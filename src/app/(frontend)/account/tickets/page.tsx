import config from "#payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Ticket } from "./ticket";
import type { Event } from "#payload-types.ts";
import { Alert, Stack, ThemeIcon, Text, Title } from "@mantine/core";
import { MemoryStick } from "pixelarticons/react";

export default async function AccountTicketsPage() {
	const payload = await getPayload({ config });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		redirect(`/login?redirect=${encodeURIComponent(`/account/tickets`)}`);
	}

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
				<Alert
					color="gray"
					icon={
						<ThemeIcon color="gray" radius="xl" size="sm" variant="light">
							<MemoryStick width={14} height={14} />
						</ThemeIcon>
					}
					variant="light"
				>
					<Text size="sm">You have not bought any tickets yet.</Text>
				</Alert>
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
								key={order.id}
								ticketData={{
									paid: order.status === "completed",
									ticketID: order.reference ?? "Missing ID",
									method: order.purchaseType === "bankTransfer" ? "bank" : "card",
									taken: order.status === "collected",
									priceInCents: item.unitPriceInCents ?? 0,
									event,
								}}
							/>
						);
					}),
				)
			)}
		</Stack>
	);
}
