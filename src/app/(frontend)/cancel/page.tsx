import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { getPayload } from "payload";
import config from "#payload-config";
import { Group, Stack, Text, Title } from "@mantine/core";
import { ButtonLink } from "#components/Link/ButtonLink.tsx";

import styles from "../success/success.module.css";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-09-30.endive" });

export const metadata: Metadata = {
	title: "Payment cancelled",
	description: "Your payment was cancelled and no money was taken.",
};

export default async function CancelPage({ searchParams }: { searchParams: Promise<{ sessionId?: string }> }) {
	const { sessionId } = await searchParams;

	if (!sessionId) {
		redirect("/cart");
	}

	const payload = await getPayload({ config });
	const { user } = await payload.auth({ headers: await headers() });

	if (user) {
		try {
			const session = await stripe.checkout.sessions.retrieve(sessionId);

			if (session.payment_status === "unpaid") {
				// Stop the abandoned session from being paid later, then remove its pending order.
				if (session.status === "open") {
					await stripe.checkout.sessions.expire(sessionId);
				}

				await payload.delete({
					collection: "orders",
					overrideAccess: true,
					where: {
						and: [
							{ "stripe.sessionId": { equals: sessionId } },
							{ user: { equals: user.id } },
							{ status: { equals: "pending" } },
						],
					},
				});
			}
		} catch (error) {
			payload.logger.warn({ err: error, sessionId, message: "Could not clean up cancelled Stripe checkout" });
		}
	}

	return (
		<main className={`container ${styles.page}`}>
			<Stack gap="md" maw="36rem">
				<Title order={1}>Payment cancelled</Title>
				<Text>No payment was taken. Your cart is still saved if you want to try again.</Text>
				<Group gap="sm" mt="sm">
					<ButtonLink href="/cart">Back to cart</ButtonLink>
					<ButtonLink href="/" variant="default">
						Back to home
					</ButtonLink>
				</Group>
			</Stack>
		</main>
	);
}
