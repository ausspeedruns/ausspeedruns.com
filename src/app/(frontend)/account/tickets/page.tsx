import config from "#payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Ticket } from "./Ticket";
import type { Event } from "#payload-types.ts";
import { Stack, Text, Title } from "@mantine/core";

export default async function AccountTicketsPage() {
	const payload = await getPayload({ config });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		redirect(`/login?redirect=${encodeURIComponent(`/account/tickets`)}`);
	}

	const paymentSettings = await payload.findGlobal({ slug: "paymentSettings", depth: 0 });

	const tickets = await payload.find({
		collection: "orders",
		where: {
			and: [
				{
					user: {
						equals: user.id,
					},
				},
				{
					"items.product.type": {
						equals: "ticket",
					},
				},
			],
		},
		overrideAccess: false,
		user,
	});

	const ticketProductIds = new Set<number>();
	tickets.docs.forEach((order) => {
		order.items?.forEach((item) => {
			if (item.product && typeof item.product === "object" && item.product.type === "ticket") {
				ticketProductIds.add(item.product.id);
			}
		});
	});

	// Fetch event data for all tickets in a single query
	const eventsByProductId: Record<number, Event> = {};
	if (ticketProductIds.size > 0) {
		const events = await payload.find({
			collection: "events",
			where: {
				"products.id": {
					in: Array.from(ticketProductIds),
				},
			},
		});

		events.docs.forEach((event) => {
			event.products?.forEach((product) => {
				if (typeof product !== "object") return;

				if (product.type === "ticket") {
					eventsByProductId[product.id] = event;
				}
			});
		});
	}

	return (
		<Stack gap="md">
			<Title order={1}>Tickets</Title>
			{tickets.docs.length === 0 ? (
				<Text c="dimmed">You haven&apos;t bought any tickets yet.</Text>
			) : (
				tickets.docs.map((order) =>
					order.items?.map((item) => {
						if (!item.product || typeof item.product !== "object") {
							return null;
						}

						const event = eventsByProductId[item.product.id];

						if (!event) {
							return null;
						}

						return (
							<Ticket
								key={`${order.id}-${item.id ?? item.product.id}`}
								ticketData={{
									paid: order.status === "completed" || order.status === "collected",
									ticketID: order.reference ?? "Missing ID",
									method: order.purchaseType === "bankTransfer" ? "bank" : "card",
									taken: order.status === "collected",
									priceInCents: item.unitPriceInCents ?? 0,
									amountOwedInCents: order.totalInCents,
									event,
								}}
								bankTransfer={paymentSettings.bankTransfer}
							/>
						);
					}),
				)
			)}
		</Stack>
	);
}
