import type { Payload, PayloadRequest, Where } from "payload";

import type { Order } from "#payload-types.ts";
import { relationId } from "#access/helpers.ts";
import { STRIPE_SESSION_TTL_SECONDS } from "./stripe.ts";
import { lockRows, withTransaction } from "./transactions.ts";

/** Extra time a pending Stripe order keeps holding stock after its session expires, to cover webhook delays. */
const STRIPE_RESERVATION_GRACE_SECONDS = 5 * 60;

export const STRIPE_RESERVATION_SECONDS = STRIPE_SESSION_TTL_SECONDS + STRIPE_RESERVATION_GRACE_SECONDS;

/** Unpaid bank transfer orders hold stock until an admin acts, so cap how many one account can have open. */
export const MAX_PENDING_BANK_TRANSFER_ORDERS = 10;

export interface ReservationItem {
	productId: number;
	variantId: string;
	quantity: number;
}

export function variantKey(productId: number, variantId: string) {
	return `${productId}:${variantId}`;
}

/**
 * Quantities held by unpaid orders, keyed by `productId:variantId`.
 * - Bank transfer (and other) pending orders hold stock until an admin completes or cancels them.
 * - Stripe pending orders hold stock while their checkout session could still be paid, or indefinitely once
 *   a payment intent is attached (an async payment such as direct debit is in progress).
 */
export async function getReservedQuantities(
	req: PayloadRequest,
	productIds: number[],
	now = new Date(),
): Promise<Map<string, number>> {
	const reserved = new Map<string, number>();
	if (productIds.length === 0) return reserved;

	const stripeCutoff = new Date(now.getTime() - STRIPE_RESERVATION_SECONDS * 1000).toISOString();
	const where: Where = {
		and: [
			{ status: { equals: "pending" } },
			{ "items.product": { in: productIds } },
			{
				or: [
					{ purchaseType: { not_equals: "stripe" } },
					{ createdAt: { greater_than: stripeCutoff } },
					{ "stripe.paymentIntentId": { exists: true } },
				],
			},
		],
	};

	const pending = await req.payload.find({
		collection: "orders",
		where,
		depth: 0,
		pagination: false,
		overrideAccess: true,
		req,
	});

	for (const order of pending.docs) {
		for (const item of order.items ?? []) {
			const productId = relationId(item.product);
			if (productId === null || !item.variantId) continue;
			const key = variantKey(productId, item.variantId);
			reserved.set(key, (reserved.get(key) ?? 0) + item.quantity);
		}
	}

	return reserved;
}

export type ReserveOrderResult = { success: true; order: Order } | { success: false; error: string };

/**
 * Creates a pending order after checking stock against what is already sold and held by other pending orders.
 * Product rows are locked for the duration so concurrent checkouts for the same stock are serialised.
 * Prices and names are snapshotted from the freshly locked product data.
 */
export async function createReservedOrder(
	payload: Payload,
	{
		userId,
		purchaseType,
		items,
	}: { userId: string; purchaseType: "stripe" | "bankTransfer"; items: ReservationItem[] },
): Promise<ReserveOrderResult> {
	const productIds = [...new Set(items.map((item) => item.productId))];

	return withTransaction(payload, async (req) => {
		await lockRows(req, "products", productIds);

		if (purchaseType === "bankTransfer") {
			const { totalDocs } = await req.payload.count({
				collection: "orders",
				where: {
					and: [
						{ user: { equals: userId } },
						{ purchaseType: { equals: "bankTransfer" } },
						{ status: { equals: "pending" } },
					],
				},
				overrideAccess: true,
				req,
			});
			if (totalDocs >= MAX_PENDING_BANK_TRANSFER_ORDERS) {
				return {
					success: false,
					error: "You have too many unpaid bank transfer orders. Please pay for your existing orders, or contact us to cancel one, before placing another.",
				};
			}
		}

		const products = await req.payload.find({
			collection: "products",
			where: { id: { in: productIds } },
			depth: 0,
			pagination: false,
			overrideAccess: true,
			req,
		});
		const reserved = await getReservedQuantities(req, productIds);

		const orderItems: NonNullable<Order["items"]> = [];
		for (const item of items) {
			const product = products.docs.find((doc) => doc.id === item.productId);
			const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
			if (!product || !variant) {
				return {
					success: false,
					error: "Some items in your cart were not found. Please refresh and try again.",
				};
			}

			if (typeof variant.stock === "number") {
				const available = variant.stock - (reserved.get(variantKey(product.id, item.variantId)) ?? 0);
				if (available < item.quantity) {
					return { success: false, error: "Insufficient stock for some items in your cart." };
				}
			}

			orderItems.push({
				product: product.id,
				productName: product.name,
				variantId: item.variantId,
				variantLabel: variant.label,
				quantity: item.quantity,
				unitPriceInCents: variant.priceInCents,
			});
		}

		const order = await req.payload.create({
			collection: "orders",
			overrideAccess: true,
			req,
			data: {
				user: userId,
				items: orderItems,
				purchaseType,
				totalInCents: 0, // Calculated from the items by the prepareOrder hook
				status: "pending",
			},
		});

		if (!order.reference) {
			throw new Error(`Order ${order.id} was created without a reference`);
		}

		return { success: true, order };
	});
}
