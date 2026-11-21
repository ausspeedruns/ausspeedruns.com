import config from "#payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Ticket } from "./Ticket";
import type { Event } from "#payload-types.ts";
import { Alert, Anchor, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { ListBox } from "pixelarticons/react";

const TICKET_VISIBLE_AFTER_EVENT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

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

	// Build the visible tickets up front so the empty state also covers orders whose tickets are hidden
	// (e.g. the event is over or no longer linked to the product).
	const hideTicketsEndedBefore = Date.now() - TICKET_VISIBLE_AFTER_EVENT_MS;
	const ticketElements = tickets.docs.flatMap((order) =>
		(order.items ?? []).flatMap((item) => {
			if (!item.product || typeof item.product !== "object") {
				return [];
			}

			const event = eventsByProductId[item.product.id];

			if (!event) {
				return [];
			}

			const endTime = event.timeSettings?.endTime;
			if (endTime && new Date(endTime).getTime() < hideTicketsEndedBefore) {
				return [];
			}

			return [
				<Ticket
					key={`${order.id}-${item.id ?? item.product.id}`}
					ticketData={{
						paid: order.status === "completed" || order.status === "collected",
						ticketID: order.reference ?? null,
						method: order.purchaseType === "bankTransfer" ? "bank" : "card",
						taken: order.status === "collected",
						priceInCents: item.unitPriceInCents ?? 0,
						amountOwedInCents: order.totalInCents,
						event,
					}}
					bankTransfer={paymentSettings.bankTransfer}
				/>,
			];
		}),
	);

	return (
		<Stack gap="md">
			<Title order={1}>Tickets</Title>
			{ticketElements.length === 0 ? (
				<Alert
					color="gray"
					icon={
						<ThemeIcon color="gray" radius="xl" size="sm" variant="light">
							<ListBox width={14} height={14} />
						</ThemeIcon>
					}
					variant="light"
				>
					<Text size="sm">
						{tickets.docs.length === 0 ? (
							"You haven't bought any tickets yet."
						) : (
							<>
								You don&apos;t have any tickets for upcoming events. Past purchases can be found in your{" "}
								<Anchor href="/account/orders">orders</Anchor>.
							</>
						)}
					</Text>
				</Alert>
			) : (
				ticketElements
			)}
		</Stack>
	);
}
