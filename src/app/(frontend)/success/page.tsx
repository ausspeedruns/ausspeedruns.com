import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "#payload-config";
import { Group, Stack, Text, Title } from "@mantine/core";
import { ButtonLink } from "#components/Link/ButtonLink.tsx";
import { ClearCart } from "./ClearCart";

import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Order received",
	description: "Your payment was received.",
};

type SuccessPageProps = {
	searchParams: Promise<{
		sessionId?: string;
	}>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
	const { sessionId } = await searchParams;
	const payload = await getPayload({ config });
	const { user } = await payload.auth({ headers: await headers() });

	let reference: string | null = null;
	if (sessionId && user) {
		const result = await payload.find({
			collection: "orders",
			where: { and: [{ "stripe.sessionId": { equals: sessionId } }, { user: { equals: user.id } }] },
			limit: 1,
			depth: 0,
			overrideAccess: false,
			user,
		});
		reference = result.docs[0]?.reference ?? null;
	}

	return (
		<main className={`container ${styles.page}`}>
			{sessionId && <ClearCart />}
			<Stack gap="md" maw="36rem">
				<Title order={1}>Thanks for your order</Title>
				<Text>
					Your payment went through. It can take a minute for the order to show as paid in your account.
				</Text>
				{reference && (
					<Text>
						Order reference:{" "}
						<Text span ff="monospace" fw={700}>
							{reference}
						</Text>
					</Text>
				)}
				<Group gap="sm" mt="sm">
					<ButtonLink href="/account/orders">View my orders</ButtonLink>
					<ButtonLink href="/" variant="default">
						Back to home
					</ButtonLink>
				</Group>
			</Stack>
		</main>
	);
}
