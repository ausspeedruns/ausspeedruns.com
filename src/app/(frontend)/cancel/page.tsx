import { redirect } from "next/navigation";
import Stripe from "stripe";
import { getPayload } from "payload";
import config from "#payload-config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });

export const metadata = {
	title: "Order Cancelled",
	description: "Stripe return page confirming the order was cancelled.",
};

export default async function CancelPage({ searchParams }: { searchParams: Promise<{ sessionId?: string }> }) {
	const { sessionId } = await searchParams;

	if (!sessionId) {
		redirect("/");
	}

	const session = await stripe.checkout.sessions.retrieve(sessionId);

	if (session.payment_status === "unpaid") {
		const payload = await getPayload({ config });
		// Safe to clean up - payment was never completed
		await payload.delete({
			collection: "orders",
			where: {
				"stripe.sessionId": {
					equals: sessionId,
				},
			},
		});
	}

	return (
		<div>
			<h1>Order cancelled</h1>
			<p>Your order has been cancelled. No payment was taken.</p>
			<a href="/">Back to home</a>
		</div>
	);
}
