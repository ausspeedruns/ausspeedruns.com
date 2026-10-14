import type {
	CollectionAfterChangeHook,
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

type OrderItem = NonNullable<Order["items"]>[number];

const PAID_STATUSES: Order["status"][] = ["completed", "collected"];

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
	for (const item of items) {
		const productId = relationId(item.product);
		if (productId === null) continue;

		const product = await req.payload
			.findByID({ collection: "products", id: productId, depth: 0, overrideAccess: true, req })
			.catch(() => null);
		if (!product) continue;

		const variant = findVariant(product, item);
		if (!variant || variant.stock === null || variant.stock === undefined) continue;

		await req.payload.update({
			collection: "products",
			id: product.id,
			depth: 0,
			overrideAccess: true,
			req,
			data: {
				variants: product.variants.map((candidate) =>
					candidate.id === variant.id
						? { ...candidate, stock: Math.max(0, (candidate.stock ?? 0) + direction * item.quantity) }
						: candidate,
				),
			},
		});
	}
}

/** Decrements stock when an order becomes paid and restores it if a paid order is cancelled. */
const syncStock: CollectionAfterChangeHook<Order> = async ({ doc, previousDoc, operation, req }) => {
	if (req.context?.skipStockAdjustment) return doc;

	const wasPaid = operation === "update" && PAID_STATUSES.includes(previousDoc?.status);
	const isPaid = PAID_STATUSES.includes(doc.status);

	if (isPaid && !wasPaid) {
		await adjustStock(req, doc.items ?? [], -1);
	} else if (wasPaid && doc.status === "cancelled") {
		await adjustStock(req, doc.items ?? [], 1);
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
		afterChange: [syncStock],
	},
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
