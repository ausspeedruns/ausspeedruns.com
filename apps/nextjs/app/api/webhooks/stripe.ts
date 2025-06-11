import { getRegisteredClient } from "@libs/urql";
import { el } from "date-fns/locale";
import { Stripe } from "stripe";
import { gql } from "urql";

const stripeApiKey = process.env.STRIPE_SECRET_KEY as string;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const websiteApiKey = process.env.API_KEY as string;

export async function StripeHandler(request: Request) {
	const stripe = new Stripe(stripeApiKey);

	const buf = await request.arrayBuffer();
	const signature = request.headers.get("stripe-signature") as string;

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(Buffer.from(buf), signature, stripeWebhookSecret);
	} catch (err: any) {
		console.log("Webhook signature verification failed.", err.message);
		return new Response("Webhook signature verification failed", { status: 400 });
	}

	switch (event.type) {
		case "checkout.session.completed":
			const cancelUrl = event.data.object.cancel_url;
			if (cancelUrl && cancelUrl.includes("shirts")) {
				shirtOrder(event.data.object.id);
			} else {
				ticketOrder(event.data.object.id);
			}
			break;
	}

	return new Response("OK");
}

const TICKET_MUTATION = gql`
	mutation ($sessionID: String!, $apiKey: String!) {
		confirmStripe(stripeID: $sessionID, apiKey: $apiKey) {
			__typename
		}
	}
`;

async function ticketOrder(sessionId: string) {
	const client = getRegisteredClient();
	await client.mutation(TICKET_MUTATION, { sessionID: sessionId, apiKey: websiteApiKey });
}

const SHIRT_MUTATION = gql`
	mutation ($sessionID: String!, $apiKey: String!) {
		confirmShirtStripe(stripeID: $sessionID, apiKey: $apiKey) {
			__typename
		}
	}
`;

async function shirtOrder(sessionId: string) {
	const client = getRegisteredClient();
	await client.mutation(SHIRT_MUTATION, { sessionID: sessionId, apiKey: websiteApiKey });
}
