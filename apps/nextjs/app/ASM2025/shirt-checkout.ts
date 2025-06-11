"use server";

import { headers } from "next/headers";
import { auth } from "../../auth";
import { Stripe } from "stripe";
import { redirect } from "next/navigation";
import { gql } from "urql";
import { getRegisteredClient } from "@libs/urql";

const stripeApiKey = process.env.STRIPE_SECRET_KEY as string;
const websiteApiKey = process.env.API_KEY as string;

const shirtId = "price_1RYogFKT8G4cNWT5b46IZyWE";

const CREATE_SHIRT_MUTATION = gql`
	mutation ($userID: ID!, $stripeID: String, $size: ShirtOrderSizeType!, $apiKey: String!) {
		generateShirt(
			userID: $userID
			method: stripe
			size: $size
			stripeID: $stripeID
			apiKey: $apiKey
		) {
			__typename
		}
	}
`;

export const stripeCheckoutAction = async (formData: FormData) => {
	const user = await auth();

	if (!user || !user.user.id) {
		throw new Error("Unauthorized");
	}

	// Check valid shirt size
	const size = formData.get("size") as string | null;

	if (!size || Array.isArray(size) || !['s', 'm', 'l', 'xl', 'xl2', 'xl3', 'xl4'].includes(size)) {
		throw new Error('Invalid Size');
	}

	const stripe = new Stripe(stripeApiKey);
	const origin = headers().get("origin");

	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price: shirtId,
				quantity: 1,
			},
		],
		mode: "payment",
		success_url: `${origin}/user/${user.user.username}#shirts`,
		cancel_url: `${origin}/api/shirts/cancel?session_id={CHECKOUT_SESSION_ID}`,
		customer_email: user.user.email ?? undefined,
	});

	if (!session.id || !session.url) {
		throw new Error("Failed to create session");
	}

	const client = getRegisteredClient();
	const res = await client.mutation(CREATE_SHIRT_MUTATION, {
		userID: user.user.id,
		stripeID: session.id,
		apiKey: websiteApiKey,
		size,
	});

	console.log("Shirt order created:", res);

	redirect(session.url);
};
