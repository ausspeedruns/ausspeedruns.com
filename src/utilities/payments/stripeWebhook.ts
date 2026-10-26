import type Stripe from "stripe";
import type { Payload, PayloadRequest } from "payload";

import type { Order } from "#payload-types.ts";
import { PAID_STATUSES } from "#collections/Orders.ts";
import { formatCents } from "#utilities/formatCents.ts";
import { STRIPE_CURRENCY } from "./stripe.ts";
import { lockRows, withTransaction } from "./transactions.ts";

/** Stripe events this endpoint acts on. Subscribe to these in the Stripe dashboard. */
export const HANDLED_STRIPE_EVENTS = [
	"checkout.session.completed",
	"checkout.session.async_payment_succeeded",
	"checkout.session.async_payment_failed",
	"checkout.session.expired",
	"charge.refunded",
	"charge.dispute.created",
] as const;

function idOf(value: string | { id: string } | null | undefined): string | null {
	if (!value) return null;
	return typeof value === "string" ? value : value.id;
}

export function appendNote(notes: string | null | undefined, line: string): string {
	return notes ? `${notes}\n${line}` : line;
}

async function addNote(req: PayloadRequest, order: Order, line: string): Promise<void> {
	if (order.notes?.includes(line)) return; // Already recorded by an earlier delivery of the same event
	await req.payload.update({
		collection: "orders",
		id: order.id,
		data: { notes: appendNote(order.notes, `[${new Date().toISOString()}] ${line}`) },
		depth: 0,
		overrideAccess: true,
		req,
	});
}

/**
 * Finds the order a checkout session was created for and checks the session really belongs to it.
 * Returns `null` (and logs) when there is no matching order.
 */
async function findOrderForSession(req: PayloadRequest, session: Stripe.Checkout.Session): Promise<Order | null> {
	const { payload } = req;
	const reference = session.metadata?.reference ?? session.client_reference_id ?? null;
	const orderId = Number(session.metadata?.orderId);

	let order: Order | null = null;
	if (Number.isInteger(orderId) && orderId > 0) {
		order = await payload
			.findByID({ collection: "orders", id: orderId, depth: 0, overrideAccess: true, req })
			.catch(() => null);
	}
	if (!order) {
		const bySession = await payload.find({
			collection: "orders",
			where: { "stripe.sessionId": { equals: session.id } },
			depth: 0,
			limit: 1,
			overrideAccess: true,
			req,
		});
		order = bySession.docs[0] ?? null;
	}
	if (!order) return null;

	const mismatch =
		order.purchaseType !== "stripe" ||
		(order.stripe?.sessionId && order.stripe.sessionId !== session.id) ||
		(reference && order.reference !== reference);
	if (mismatch) {
		payload.logger.error(
			{ orderId: order.id, sessionId: session.id, reference, orderReference: order.reference },
			"Stripe session does not match the order it points to",
		);
		return null;
	}

	return order;
}

/** Locks the order row for the rest of the transaction and returns its current state. */
async function lockOrder(req: PayloadRequest, orderId: number): Promise<Order> {
	await lockRows(req, "orders", [orderId]);
	return req.payload.findByID({ collection: "orders", id: orderId, depth: 0, overrideAccess: true, req });
}

async function handleSessionPaid(req: PayloadRequest, session: Stripe.Checkout.Session): Promise<void> {
	const { payload } = req;
	const found = await findOrderForSession(req, session);
	const paymentIntentId = idOf(session.payment_intent);
	const isPaid = session.payment_status === "paid" || session.payment_status === "no_payment_required";

	if (!found) {
		if (isPaid) {
			payload.logger.error(
				{
					sessionId: session.id,
					paymentIntentId,
					amountTotal: session.amount_total,
					metadata: session.metadata,
				},
				"PAYMENT RECEIVED WITH NO MATCHING ORDER: Stripe session was paid but no order could be found. Refund or recreate the order manually.",
			);
		}
		return;
	}

	const order = await lockOrder(req, found.id);

	if (!isPaid) {
		// Checkout finished with a delayed payment method (e.g. direct debit). Record the payment intent so the
		// order keeps holding stock until `async_payment_succeeded` / `async_payment_failed` arrives.
		if (order.status === "pending" && paymentIntentId && !order.stripe?.paymentIntentId) {
			await payload.update({
				collection: "orders",
				id: order.id,
				data: { stripe: { sessionId: session.id, paymentIntentId } },
				depth: 0,
				overrideAccess: true,
				req,
			});
		}
		payload.logger.info(
			{ orderId: order.id, sessionId: session.id, paymentStatus: session.payment_status },
			"Stripe session completed but payment is still pending",
		);
		return;
	}

	// Only pending orders can become paid. Anything else is a duplicate/late delivery or needs a human.
	if (order.status !== "pending") {
		if (order.status === "cancelled") {
			payload.logger.error(
				{ orderId: order.id, sessionId: session.id },
				"Stripe payment received for a cancelled order; needs review",
			);
			await addNote(
				req,
				order,
				`Stripe payment ${paymentIntentId ?? session.id} received after the order was cancelled. Review and refund if needed.`,
			);
		} else if (!order.stripe?.paymentIntentId && paymentIntentId) {
			await payload.update({
				collection: "orders",
				id: order.id,
				data: { stripe: { sessionId: session.id, paymentIntentId } },
				depth: 0,
				overrideAccess: true,
				req,
			});
		}
		return;
	}

	const currency = session.currency?.toLowerCase();
	if (currency !== STRIPE_CURRENCY || session.amount_total !== order.totalInCents) {
		payload.logger.error(
			{
				orderId: order.id,
				sessionId: session.id,
				currency,
				amountTotal: session.amount_total,
				orderTotal: order.totalInCents,
			},
			"Stripe payment amount does not match the order; leaving it pending for review",
		);
		await addNote(
			req,
			order,
			`Stripe payment ${paymentIntentId ?? session.id} was ${session.amount_total ?? "?"} ${currency ?? "?"} but the order total is ${order.totalInCents} ${STRIPE_CURRENCY}. Review before marking as paid.`,
		);
		return;
	}

	await payload.update({
		collection: "orders",
		id: order.id,
		data: {
			status: "completed",
			stripe: { sessionId: session.id, paymentIntentId },
		},
		depth: 0,
		overrideAccess: true,
		req,
	});

	payload.logger.info({ orderId: order.id, sessionId: session.id }, "Stripe order marked as completed");
}

/** Session expired unpaid, or its delayed payment failed: remove the pending order and release its stock hold. */
async function handleSessionFailed(req: PayloadRequest, session: Stripe.Checkout.Session): Promise<void> {
	const found = await findOrderForSession(req, session);
	if (!found) {
		req.payload.logger.info({ sessionId: session.id }, "Stripe session ended unpaid with no matching order");
		return;
	}

	const order = await lockOrder(req, found.id);
	if (order.status !== "pending") return;

	await req.payload.delete({ collection: "orders", id: order.id, overrideAccess: true, req });
	req.payload.logger.info({ orderId: order.id, sessionId: session.id }, "Removed unpaid Stripe order");
}

async function findOrderByPaymentIntent(
	req: PayloadRequest,
	paymentIntentId: string | null,
	metadata: Stripe.Metadata | null | undefined,
): Promise<Order | null> {
	if (paymentIntentId) {
		const result = await req.payload.find({
			collection: "orders",
			where: { "stripe.paymentIntentId": { equals: paymentIntentId } },
			depth: 0,
			limit: 1,
			overrideAccess: true,
			req,
		});
		if (result.docs[0]) return result.docs[0];
	}

	const orderId = Number(metadata?.orderId);
	if (Number.isInteger(orderId) && orderId > 0) {
		const order = await req.payload
			.findByID({ collection: "orders", id: orderId, depth: 0, overrideAccess: true, req })
			.catch(() => null);
		if (order?.purchaseType === "stripe" && (!metadata?.reference || metadata.reference === order.reference)) {
			return order;
		}
	}

	return null;
}

async function handleChargeRefunded(req: PayloadRequest, charge: Stripe.Charge): Promise<void> {
	const found = await findOrderByPaymentIntent(req, idOf(charge.payment_intent), charge.metadata);
	if (!found) {
		req.payload.logger.warn({ chargeId: charge.id }, "Stripe refund for a charge with no matching order");
		return;
	}

	const order = await lockOrder(req, found.id);
	const fullyRefunded = charge.refunded || charge.amount_refunded >= charge.amount;

	if (fullyRefunded) {
		if (order.status === "cancelled") return;

		const wasPaid = PAID_STATUSES.includes(order.status);
		await req.payload.update({
			collection: "orders",
			id: order.id,
			data: {
				status: "cancelled",
				notes: appendNote(
					order.notes,
					`[${new Date().toISOString()}] Fully refunded in Stripe (charge ${charge.id}, ${formatCents(charge.amount_refunded)}). Order cancelled${wasPaid ? " and stock restored" : ""}.`,
				),
			},
			depth: 0,
			overrideAccess: true,
			req,
		});
		req.payload.logger.info({ orderId: order.id, chargeId: charge.id }, "Stripe order cancelled after full refund");
		return;
	}

	await addNote(
		req,
		order,
		`Partially refunded in Stripe (charge ${charge.id}, ${formatCents(charge.amount_refunded)} of ${formatCents(charge.amount)} refunded). Order left as-is.`,
	);
}

async function handleDisputeCreated(req: PayloadRequest, dispute: Stripe.Dispute): Promise<void> {
	const found = await findOrderByPaymentIntent(req, idOf(dispute.payment_intent), dispute.metadata);
	if (!found) {
		req.payload.logger.warn({ disputeId: dispute.id }, "Stripe dispute for a payment with no matching order");
		return;
	}

	const order = await lockOrder(req, found.id);
	req.payload.logger.warn({ orderId: order.id, disputeId: dispute.id }, "Stripe dispute opened for order");
	await addNote(
		req,
		order,
		`Dispute ${dispute.id} opened in Stripe (${dispute.reason}, ${formatCents(dispute.amount)}). Respond in the Stripe dashboard.`,
	);
}

/** Applies a verified Stripe webhook event. Each event is handled in its own transaction. */
export async function handleStripeEvent(payload: Payload, event: Stripe.Event): Promise<void> {
	switch (event.type) {
		case "checkout.session.completed":
		case "checkout.session.async_payment_succeeded":
			return withTransaction(payload, (req) => handleSessionPaid(req, event.data.object));
		case "checkout.session.expired":
		case "checkout.session.async_payment_failed":
			return withTransaction(payload, (req) => handleSessionFailed(req, event.data.object));
		case "charge.refunded":
			return withTransaction(payload, (req) => handleChargeRefunded(req, event.data.object));
		case "charge.dispute.created":
			return withTransaction(payload, (req) => handleDisputeCreated(req, event.data.object));
		default:
			return;
	}
}
