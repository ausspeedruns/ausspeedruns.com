import type {
	CollectionAfterChangeHook,
	CollectionBeforeChangeHook,
	CollectionBeforeValidateHook,
	CollectionConfig,
	PayloadRequest,
} from "payload";
import { customAlphabet } from "nanoid";

import type { Order, Product } from "#/payload-types";
import { manageUsersField } from "#access/field/manageUsersField.ts";
import { relationId } from "#access/helpers.ts";
import { manageUsers } from "#access/manageUsers.ts";
import { ownDocOrManageUsers } from "#access/ownDocOrManageUsers.ts";
import { lockRows } from "#utilities/payments/transactions.ts";
import { ticketPickupEndpoints } from "#endpoints/ticketPickup.ts";

type OrderItem = NonNullable<Order["items"]>[number];

export const PAID_STATUSES: Order["status"][] = ["completed", "collected"];

const nanoid = customAlphabet("23456789ABCDEFGHJKMNPQRSTUVWXYZ", 10);
export function createOrderReference() {
	return `ORD-${nanoid()}`; // Outputs e.g., ORD-7FX3M9K2
}

export function calculateTotalInCents(items: Pick<OrderItem, "quantity" | "unitPriceInCents">[]) {
	return items.reduce((sum, item) => sum + (item.quantity ?? 0) * (item.unitPriceInCents ?? 0), 0);
}

function findVariant(product: Product, item: Pick<OrderItem, "variantId" | "variantLabel">) {
	return (
		product.variants.find((variant) => item.variantId && variant.id === item.variantId) ??
		product.variants.find((variant) => item.variantLabel && variant.label === item.variantLabel)
	);
}

/**
 * Fills in product snapshot data (name, variant label, unit price) from the product so that
 * orders keep a record of what was bought even if the product changes later.
 * Values that are already provided (e.g. migrated historical prices) are kept.
 */
async function snapshotItems(req: PayloadRequest, items: OrderItem[]): Promise<OrderItem[]> {
	const productIds = [...new Set(items.map((item) => relationId(item.product)).filter((id) => id !== null))];
	if (productIds.length === 0) return items;

	const products = await req.payload.find({
		collection: "products",
		where: { id: { in: productIds } },
		depth: 0,
		pagination: false,
		overrideAccess: true,
		req,
	});
	const productMap = new Map(products.docs.map((product) => [product.id, product]));

	return items.map((item) => {
		const product = productMap.get(relationId(item.product) as number);
		if (!product) return item;

		const variant = findVariant(product, item);
		return {
			...item,
			productName: item.productName || product.name,
			variantId: item.variantId || variant?.id || null,
			variantLabel: item.variantLabel || variant?.label || null,
			unitPriceInCents:
				typeof item.unitPriceInCents === "number" ? item.unitPriceInCents : (variant?.priceInCents ?? 0),
		};
	});
}

const prepareOrder: CollectionBeforeValidateHook<Order> = async ({ data, operation, req }) => {
	if (!data) return data;

	if (operation === "create" && !data.reference) {
		data.reference = createOrderReference();
	}

	if (Array.isArray(data.items)) {
		data.items = await snapshotItems(req, data.items);
		data.totalInCents = calculateTotalInCents(data.items);
	}

	return data;
};

async function adjustStock(req: PayloadRequest, items: OrderItem[], direction: -1 | 1) {
	const productIds = [...new Set(items.map((item) => relationId(item.product)).filter((id) => id !== null))];
	if (productIds.length === 0) return;

	// Usually already locked by lockStockRows; re-locking in the same transaction is a no-op.
	await lockRows(req, "products", productIds);

	const products = await req.payload.find({
		collection: "products",
		where: { id: { in: productIds } },
		depth: 0,
		pagination: false,
		overrideAccess: true,
		req,
	});

	for (const product of products.docs) {
		const changes = new Map<string, number>();
		for (const item of items) {
			if (relationId(item.product) !== product.id) continue;
			const variant = findVariant(product, item);
			if (!variant?.id || variant.stock === null || variant.stock === undefined) continue;
			changes.set(variant.id, (changes.get(variant.id) ?? 0) + direction * item.quantity);
		}
		if (changes.size === 0) continue;

		const variants = product.variants.map((candidate) => {
			const change = candidate.id ? changes.get(candidate.id) : undefined;
			if (change === undefined) return candidate;

			const stock = (candidate.stock ?? 0) + change;
			if (stock < 0) {
				req.payload.logger.warn(
					{ productId: product.id, variantId: candidate.id, stock },
					"Product variant oversold; stock clamped to 0",
				);
			}
			return { ...candidate, stock: Math.max(0, stock) };
		});

		await req.payload.update({
			collection: "products",
			id: product.id,
			depth: 0,
			overrideAccess: true,
			req,
			data: { variants },
		});
	}
}

/** -1 when an order becomes paid, +1 when a paid order is cancelled, otherwise 0. */
function stockDirection(previousStatus: Order["status"] | undefined, status: Order["status"]): -1 | 0 | 1 {
	const wasPaid = previousStatus !== undefined && PAID_STATUSES.includes(previousStatus);
	const isPaid = PAID_STATUSES.includes(status);

	if (isPaid && !wasPaid) return -1;
	if (wasPaid && status === "cancelled") return 1;
	return 0;
}

/**
 * Locks the order's product rows before the order itself is written when its stock is about to change.
 * Writing the order takes foreign-key locks on those products, so locking them afterwards (in `syncStock`)
 * could deadlock with another order completing at the same time.
 */
const lockStockRows: CollectionBeforeChangeHook<Order> = async ({ data, originalDoc, operation, req }) => {
	if (req.context?.skipStockAdjustment) return data;

	const status = (data.status ?? originalDoc?.status) as Order["status"] | undefined;
	if (!status || stockDirection(operation === "update" ? originalDoc?.status : undefined, status) === 0) return data;

	const items = data.items ?? originalDoc?.items ?? [];
	await lockRows(
		req,
		"products",
		items.map((item) => relationId(item.product)).filter((id) => id !== null),
	);
	return data;
};

/** Decrements stock when an order becomes paid and restores it if a paid order is cancelled. */
const syncStock: CollectionAfterChangeHook<Order> = async ({ doc, previousDoc, operation, req }) => {
	if (req.context?.skipStockAdjustment) return doc;

	const direction = stockDirection(operation === "update" ? previousDoc?.status : undefined, doc.status);
	if (direction !== 0) {
		await adjustStock(req, doc.items ?? [], direction);
	}

	return doc;
};

export const Orders: CollectionConfig<"orders"> = {
	slug: "orders",
	admin: {
		useAsTitle: "reference",
		defaultColumns: ["reference", "user", "status", "purchaseType", "totalInCents", "createdAt"],
		listSearchableFields: ["reference", "stripe.sessionId"],
		group: "Shop",
	},
	access: {
		create: manageUsers,
		delete: manageUsers,
		read: ownDocOrManageUsers("user"),
		update: manageUsers,
	},
	hooks: {
		beforeValidate: [prepareOrder],
		beforeChange: [lockStockRows],
		afterChange: [syncStock],
	},
	endpoints: ticketPickupEndpoints,
	fields: [
		{
			name: "reference",
			type: "text",
			unique: true,
			index: true,
			admin: { position: "sidebar", readOnly: true },
		},
		{
			name: "user",
			type: "relationship",
			relationTo: "users",
			required: true,
			index: true,
		},
		{
			name: "items",
			type: "array",
			required: true,
			minRows: 1,
			fields: [
				{ name: "product", type: "relationship", relationTo: "products", required: true },
				{
					type: "row",
					fields: [
						{ name: "productName", type: "text", admin: { readOnly: true } },
						{ name: "variantLabel", type: "text" },
						{ name: "variantId", type: "text", admin: { hidden: true } },
					],
				},
				{
					type: "row",
					fields: [
						{ name: "quantity", type: "number", required: true, min: 1, defaultValue: 1 },
						{
							name: "unitPriceInCents",
							type: "number",
							min: 0,
							admin: { description: "Filled in from the product if left blank." },
						},
						{
							name: "collectedQuantity",
							type: "number",
							min: 0,
							defaultValue: 0,
							admin: {
								step: 1,
								description:
									"How many have been handed over at the pickup desk. Ignored when the order status is Collected.",
							},
						},
					],
				},
			],
		},
		{
			name: "totalInCents",
			type: "number",
			required: true,
			defaultValue: 0,
			admin: {
				readOnly: true,
				position: "sidebar",
				description: "Calculated from the items.",
			},
		},
		{
			name: "status",
			type: "select",
			index: true,
			required: true,
			options: [
				{ label: "Pending", value: "pending" },
				{ label: "Completed (paid)", value: "completed" },
				{ label: "Collected", value: "collected" },
				{ label: "Cancelled", value: "cancelled" },
			],
			defaultValue: "pending",
			admin: { position: "sidebar" },
		},
		{
			name: "purchaseType",
			type: "select",
			required: true,
			options: [
				{ label: "Bank Transfer", value: "bankTransfer" },
				{ label: "Stripe", value: "stripe" },
				{ label: "Other (Write in notes)", value: "other" },
			],
		},
		{
			name: "stripe",
			type: "group",
			admin: {
				condition: (data) => data?.purchaseType === "stripe",
			},
			fields: [
				{ name: "sessionId", type: "text", index: true },
				{ name: "paymentIntentId", type: "text" },
			],
		},
		{
			name: "notes",
			type: "textarea",
			access: {
				read: manageUsersField,
			},
		},
	],
};
