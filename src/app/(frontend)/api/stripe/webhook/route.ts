import type Stripe from "stripe";
import { getPayload } from "payload";
import config from "#payload-config";
import { getStripe } from "#utilities/payments/stripe.ts";
import { handleStripeEvent } from "#utilities/payments/stripeWebhook.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
	const payload = await getPayload({ config });
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!webhookSecret) {
		payload.logger.error("STRIPE_WEBHOOK_SECRET is not set; Stripe webhooks cannot be processed");
		return new Response("Stripe webhook is not configured", { status: 500 });
	}

	const signature = req.headers.get("stripe-signature");
	if (!signature) {
		return new Response("Missing Stripe signature", { status: 400 });
	}

	const body = await req.text();
	let event: Stripe.Event;

	try {
		event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown signature verification error";
		return new Response(`Webhook Error: ${message}`, { status: 400 });
	}

	try {
		await handleStripeEvent(payload, event);
	} catch (error) {
		payload.logger.error(
			{ err: error, eventId: event.id, eventType: event.type },
			"Failed handling Stripe webhook event",
		);
		return new Response("Webhook handler failed", { status: 500 });
	}

	return new Response("ok", { status: 200 });
}
