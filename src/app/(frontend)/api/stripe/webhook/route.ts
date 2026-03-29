import Stripe from "stripe";
import { getPayload } from "payload";
import config from "#payload-config";
import type { Order } from "#payload-types.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });

async function findOrderForSession(session: Stripe.Checkout.Session): Promise<Order | null> {
	const payload = await getPayload({ config });

	const orderId = session.metadata?.orderId;
	if (orderId) {
		try {
			const order = await payload.findByID({
				collection: "orders",
				id: Number(orderId),
				overrideAccess: true,
			});

			if (order) {
				return order;
			}
		} catch {
			// Ignore and continue to fallback lookups.
		}
	}

	const reference = session.metadata?.reference ?? session.client_reference_id;
	if (reference) {
		const byReference = await payload.find({
			collection: "orders",
			where: { reference: { equals: reference } },
			limit: 1,
			overrideAccess: true,
		});

		if (byReference.docs[0]) {
			return byReference.docs[0];
		}
	}

	const bySession = await payload.find({
		collection: "orders",
		where: { "stripe.sessionId": { equals: session.id } },
		limit: 1,
		overrideAccess: true,
	});

	return bySession.docs[0] ?? null;
}

async function markOrderAsComplete(session: Stripe.Checkout.Session): Promise<void> {
	const payload = await getPayload({ config });
	const order = await findOrderForSession(session);

	if (!order) {
		payload.logger.error({ sessionId: session.id }, "Stripe webhook received session with no matching order");
		return;
	}

	const paymentIntentId =
		typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

	// Make this idempotent so duplicate webhook deliveries are safe.
	if (order.status === "completed") {
		if (!order.stripe?.paymentIntentId && paymentIntentId) {
			await payload.update({
				collection: "orders",
				id: order.id,
				data: {
					stripe: {
						sessionId: session.id,
						paymentIntentId,
					},
				},
				overrideAccess: true,
			});
		}

		return;
	}

	await payload.update({
		collection: "orders",
		id: order.id,
		data: {
			status: "completed",
			totalInCents: session.amount_total ?? order.totalInCents,
			stripe: {
				sessionId: session.id,
				paymentIntentId,
			},
		},
		overrideAccess: true,
	});

	payload.logger.info({ orderId: order.id, sessionId: session.id }, "Stripe order marked as completed");
}

export async function POST(req: Request): Promise<Response> {
	const signature = req.headers.get("stripe-signature");
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!signature || !webhookSecret) {
		return new Response("Missing Stripe webhook configuration", { status: 400 });
	}

	const body = await req.text();
	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown signature verification error";
		return new Response(`Webhook Error: ${message}`, { status: 400 });
	}

	try {
		switch (event.type) {
			case "checkout.session.completed":
			case "checkout.session.async_payment_succeeded": {
				await markOrderAsComplete(event.data.object as Stripe.Checkout.Session);
				break;
			}
			default:
				break;
		}
	} catch (error) {
		const payload = await getPayload({ config });
		payload.logger.error({ err: error, eventType: event.type }, "Failed handling Stripe webhook event");
		return new Response("Webhook handler failed", { status: 500 });
	}

	return new Response("ok", { status: 200 });
}
