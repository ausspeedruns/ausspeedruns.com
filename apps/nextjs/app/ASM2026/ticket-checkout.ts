"use server";

import { headers } from "next/headers";
import { auth } from "../../auth";
import { Stripe } from "stripe";
import { redirect } from "next/navigation";
import { gql } from "urql";
import { getRegisteredClient } from "@libs/urql";

const stripeApiKey = process.env.STRIPE_SECRET_KEY as string;
const websiteApiKey = process.env.API_KEY as string;

const ticketId = "price_1QyTCuKT8G4cNWT5XZ4mnwYZ";

const event = "ASM2025";

const CREATE_TICKET_MUTATION = gql`
	mutation ($userID: ID!, $stripeID: String, $apiKey: String!, $event: String!) {
		generateTicket(
			userID: $userID
			event: $event
			numberOfTickets: 1
			method: stripe
			stripeID: $stripeID
			apiKey: $apiKey
		) {
			__typename
		}
	}
`;

export const stripeCheckoutAction = async () => {
	const user = await auth();

	if (!user || !user.user.id) {
		throw new Error("Unauthorized");
	}

	const stripe = new Stripe(stripeApiKey);
	const origin = headers().get("origin");

	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price: ticketId,
				quantity: 1,
			},
		],
		mode: "payment",
		success_url: `${origin}/user/${user.user.username}#tickets`,
		cancel_url: `${origin}/api/tickets/cancel?session_id={CHECKOUT_SESSION_ID}`,
		customer_email: user.user.email ?? undefined,
	});

	if (!session.id || !session.url) {
		throw new Error("Failed to create session");
	}

	const client = getRegisteredClient();
	await client.mutation(CREATE_TICKET_MUTATION, {
		userID: user.user.id,
		stripeID: session.id,
		apiKey: websiteApiKey,
		event,
	});

	redirect(session.url);
};
