import { getUrqlClient } from "@libs/urql";
import { Stripe } from "stripe";
import { gql } from "urql";

const stripeApiKey = process.env.STRIPE_SECRET_KEY as string;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const websiteApiKey = process.env.API_KEY as string;

const stripe = new Stripe(stripeApiKey);

export async function StripeHandler(request: Request) {
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
			ticketOrder(event.data.object.id);
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
	const client = getUrqlClient();
	await client.mutation(TICKET_MUTATION, { sessionID: sessionId, apiKey: websiteApiKey });
}
