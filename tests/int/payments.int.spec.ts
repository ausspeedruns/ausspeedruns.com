// @vitest-environment node
import { createLocalReq, getPayload, type Payload } from "payload";
import type Stripe from "stripe";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import config from "#/payload.config";
import type { Order, Product, User } from "#/payload-types";
import {
	createReservedOrder,
	getReservedQuantities,
	STRIPE_RESERVATION_SECONDS,
	variantKey,
} from "#/utilities/payments/reservations";
import { handleStripeEvent } from "#/utilities/payments/stripeWebhook";

let payload: Payload;
let buyer: User;
const productIds: number[] = [];
const suffix = Date.now().toString(36);
let eventCounter = 0;

async function createProduct(stock: number | null, priceInCents = 2500): Promise<Product> {
	const product = await payload.create({
		collection: "products",
		data: {
			name: `Payment test ${suffix} ${productIds.length}`,
			slug: `payment-test-${suffix}-${productIds.length}`,
			type: "ticket",
			variants: [{ label: "Standard", priceInCents, stock }],
		},
	});
	productIds.push(product.id);
	return product;
}

async function stockOf(product: Product) {
	return (await payload.findByID({ collection: "products", id: product.id, depth: 0 })).variants[0].stock;
}

async function reserve(product: Product, quantity: number, purchaseType: "stripe" | "bankTransfer" = "stripe") {
	return createReservedOrder(payload, {
		userId: buyer.id,
		purchaseType,
		items: [{ productId: product.id, variantId: product.variants[0].id!, quantity }],
	});
}

async function reserveOrThrow(product: Product, quantity: number, purchaseType?: "stripe" | "bankTransfer") {
	const result = await reserve(product, quantity, purchaseType);
	if (!result.success) throw new Error(result.error);
	return result.order;
}

async function attachSession(order: Order, sessionId: string) {
	return payload.update({
		collection: "orders",
		id: order.id,
		data: { stripe: { sessionId } },
		overrideAccess: true,
	});
}

function event<T>(type: string, object: T): Stripe.Event {
	eventCounter += 1;
	return { id: `evt_test_${suffix}_${eventCounter}`, type, data: { object } } as unknown as Stripe.Event;
}

function session(order: Order, overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session {
	return {
		id: order.stripe?.sessionId ?? `cs_test_${order.id}`,
		object: "checkout.session",
		client_reference_id: order.reference,
		metadata: { orderId: String(order.id), reference: order.reference! },
		payment_status: "paid",
		status: "complete",
		currency: "aud",
		amount_total: order.totalInCents,
		payment_intent: `pi_test_${order.id}`,
		...overrides,
	} as Stripe.Checkout.Session;
}

function charge(order: Order, overrides: Partial<Stripe.Charge> = {}): Stripe.Charge {
	return {
		id: `ch_test_${order.id}`,
		object: "charge",
		amount: order.totalInCents,
		amount_refunded: order.totalInCents,
		refunded: true,
		payment_intent: `pi_test_${order.id}`,
		metadata: {},
		...overrides,
	} as Stripe.Charge;
}

async function getOrder(order: Order) {
	return payload.findByID({ collection: "orders", id: order.id, depth: 0, overrideAccess: true });
}

describe("Payments", () => {
	beforeAll(async () => {
		payload = await getPayload({ config: await config });
		buyer = await payload.create({
			collection: "users",
			disableVerificationEmail: true,
			data: {
				username: `payment_buyer_${suffix}`,
				email: `payment_buyer_${suffix}@example.com`,
				password: "password123",
				dateOfBirth: "1990-01-01T00:00:00.000Z",
			},
		});
	});

	afterAll(async () => {
		if (!payload) return;
		if (buyer) {
			await payload.delete({ collection: "orders", where: { user: { equals: buyer.id } }, overrideAccess: true });
			await payload.delete({ collection: "users", id: buyer.id, overrideAccess: true });
		}
		if (productIds.length > 0) {
			await payload.delete({ collection: "products", where: { id: { in: productIds } }, overrideAccess: true });
		}
	});

	describe("stock reservation", () => {
		it("counts pending orders against stock", async () => {
			const product = await createProduct(2);

			await reserveOrThrow(product, 1, "bankTransfer");
			expect(await reserve(product, 2)).toMatchObject({ success: false, error: expect.stringMatching(/stock/) });
			await reserveOrThrow(product, 1);
			expect((await reserve(product, 1)).success).toBe(false);
			// Stock itself only moves when an order is paid.
			expect(await stockOf(product)).toBe(2);
		});

		it("releases expired Stripe holds but keeps bank transfer and async-payment holds", async () => {
			const product = await createProduct(10);
			const stripeOrder = await reserveOrThrow(product, 1);
			await reserveOrThrow(product, 2, "bankTransfer");
			const asyncOrder = await reserveOrThrow(product, 3);
			await payload.update({
				collection: "orders",
				id: asyncOrder.id,
				data: { stripe: { paymentIntentId: `pi_async_${asyncOrder.id}` } },
				overrideAccess: true,
			});

			const req = await createLocalReq({}, payload);
			const key = variantKey(product.id, product.variants[0].id!);
			expect((await getReservedQuantities(req, [product.id])).get(key)).toBe(6);

			const later = new Date(
				new Date(stripeOrder.createdAt).getTime() + (STRIPE_RESERVATION_SECONDS + 60) * 1000,
			);
			expect((await getReservedQuantities(req, [product.id], later)).get(key)).toBe(5);
		});

		it("does not oversell when checkouts race for the last items", async () => {
			const product = await createProduct(2);
			const results = await Promise.all([reserve(product, 1), reserve(product, 1), reserve(product, 1)]);
			expect(results.filter((result) => result.success)).toHaveLength(2);
		});

		it("snapshots prices from the product", async () => {
			const product = await createProduct(null, 1234);
			const order = await reserveOrThrow(product, 3);
			expect(order.totalInCents).toBe(3702);
			expect(order.items[0]).toMatchObject({ unitPriceInCents: 1234, variantLabel: "Standard" });
		});
	});

	describe("Stripe webhook", () => {
		it("marks a paid session's order completed and takes stock once for duplicate deliveries", async () => {
			const product = await createProduct(5);
			const order = await attachSession(await reserveOrThrow(product, 2), `cs_dup_${suffix}`);

			const paid = event("checkout.session.completed", session(order));
			await Promise.all([handleStripeEvent(payload, paid), handleStripeEvent(payload, paid)]);

			const updated = await getOrder(order);
			expect(updated.status).toBe("completed");
			expect(updated.stripe?.paymentIntentId).toBe(`pi_test_${order.id}`);
			expect(await stockOf(product)).toBe(3);
		});

		it("keeps stock correct when different orders complete at the same time", async () => {
			const product = await createProduct(10);
			const orders = await Promise.all([
				reserveOrThrow(product, 1),
				reserveOrThrow(product, 2),
				reserveOrThrow(product, 3),
			]);

			await Promise.all(
				orders.map((order) => handleStripeEvent(payload, event("checkout.session.completed", session(order)))),
			);

			expect(await stockOf(product)).toBe(4);
		});

		it("does not move a collected order back to completed on a late retry", async () => {
			const product = await createProduct(null);
			const order = await reserveOrThrow(product, 1);
			const paid = event("checkout.session.completed", session(order));

			await handleStripeEvent(payload, paid);
			await payload.update({
				collection: "orders",
				id: order.id,
				data: { status: "collected" },
				overrideAccess: true,
			});
			await handleStripeEvent(payload, paid);

			expect((await getOrder(order)).status).toBe("collected");
		});

		it("leaves the order pending and adds a note when the amount doesn't match", async () => {
			const product = await createProduct(null);
			const order = await reserveOrThrow(product, 1);

			await handleStripeEvent(payload, event("checkout.session.completed", session(order, { amount_total: 1 })));
			await handleStripeEvent(payload, event("checkout.session.completed", session(order, { currency: "usd" })));

			const updated = await getOrder(order);
			expect(updated.status).toBe("pending");
			expect(updated.notes).toMatch(/order total is 2500 aud/);
		});

		it("ignores sessions whose reference doesn't match the order", async () => {
			const product = await createProduct(null);
			const order = await reserveOrThrow(product, 1);

			await handleStripeEvent(
				payload,
				event(
					"checkout.session.completed",
					session(order, {
						metadata: { orderId: String(order.id), reference: "ORD-WRONG" },
						client_reference_id: "ORD-WRONG",
					}),
				),
			);

			expect((await getOrder(order)).status).toBe("pending");
		});

		it("records async payments and only completes them once they succeed", async () => {
			const product = await createProduct(null);
			const order = await reserveOrThrow(product, 1);

			await handleStripeEvent(
				payload,
				event("checkout.session.completed", session(order, { payment_status: "unpaid" })),
			);
			const processing = await getOrder(order);
			expect(processing.status).toBe("pending");
			expect(processing.stripe?.paymentIntentId).toBe(`pi_test_${order.id}`);

			await handleStripeEvent(payload, event("checkout.session.async_payment_succeeded", session(order)));
			expect((await getOrder(order)).status).toBe("completed");
		});

		it("removes the pending order when a session expires or its async payment fails", async () => {
			const product = await createProduct(null);
			const expired = await reserveOrThrow(product, 1);
			const failed = await reserveOrThrow(product, 1);

			await handleStripeEvent(
				payload,
				event("checkout.session.expired", session(expired, { status: "expired", payment_status: "unpaid" })),
			);
			await handleStripeEvent(
				payload,
				event("checkout.session.async_payment_failed", session(failed, { payment_status: "unpaid" })),
			);
			// A second delivery of the same event is harmless.
			await handleStripeEvent(
				payload,
				event("checkout.session.expired", session(expired, { status: "expired", payment_status: "unpaid" })),
			);

			const remaining = await payload.find({
				collection: "orders",
				where: { id: { in: [expired.id, failed.id] } },
				overrideAccess: true,
			});
			expect(remaining.totalDocs).toBe(0);
		});

		it("does not remove orders that are already paid when a session event says otherwise", async () => {
			const product = await createProduct(null);
			const order = await reserveOrThrow(product, 1);
			await handleStripeEvent(payload, event("checkout.session.completed", session(order)));
			await handleStripeEvent(payload, event("checkout.session.async_payment_failed", session(order)));

			expect((await getOrder(order)).status).toBe("completed");
		});

		it("cancels fully refunded orders and restores stock; notes partial refunds and disputes", async () => {
			const product = await createProduct(5);
			const full = await reserveOrThrow(product, 2);
			const partial = await reserveOrThrow(product, 1);
			await handleStripeEvent(payload, event("checkout.session.completed", session(full)));
			await handleStripeEvent(payload, event("checkout.session.completed", session(partial)));
			expect(await stockOf(product)).toBe(2);

			const refunded = event("charge.refunded", charge(full));
			await handleStripeEvent(payload, refunded);
			await handleStripeEvent(payload, refunded);
			const fullAfter = await getOrder(full);
			expect(fullAfter.status).toBe("cancelled");
			expect(fullAfter.notes).toMatch(/Fully refunded/);
			expect(await stockOf(product)).toBe(4);

			const partialRefund = event("charge.refunded", charge(partial, { refunded: false, amount_refunded: 500 }));
			await handleStripeEvent(payload, partialRefund);
			await handleStripeEvent(payload, partialRefund);
			await handleStripeEvent(
				payload,
				event("charge.dispute.created", {
					id: `dp_test_${partial.id}`,
					object: "dispute",
					amount: partial.totalInCents,
					reason: "fraudulent",
					payment_intent: `pi_test_${partial.id}`,
					metadata: {},
				}),
			);
			const partialAfter = await getOrder(partial);
			expect(partialAfter.status).toBe("completed");
			expect(partialAfter.notes?.match(/Partially refunded/g)).toHaveLength(1);
			expect(partialAfter.notes).toMatch(/Dispute dp_test_/);
		});
	});
});
