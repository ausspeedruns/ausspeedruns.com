import type { Order as OrderType } from "#payload-types.ts";
import { Badge, Divider, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { CalendarClock, CircleDollarSign, CreditCard, Landmark, PackageCheck } from "lucide-react";
import { OrderItem } from "./order-item";

interface OrderProps {
	order: OrderType;
}

const currencyFormatter = new Intl.NumberFormat("en-AU", {
	style: "currency",
	currency: "AUD",
});

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
	dateStyle: "medium",
	timeStyle: "short",
});

function formatOrderStatus(status: OrderType["status"]) {
	if (status === "completed") return "Completed";
	if (status === "collected") return "Collected";
	if (status === "cancelled") return "Cancelled";
	return "Pending";
}

function formatPurchaseType(purchaseType: OrderType["purchaseType"]) {
	if (purchaseType === "bankTransfer") return "Bank transfer";
	if (purchaseType === "stripe") return "Card";
	if (purchaseType === "other") return "Other";
	return "Unknown";
}

function getStatusColor(status: OrderType["status"]) {
	if (status === "completed") return "blue";
	if (status === "collected") return "green";
	if (status === "cancelled") return "red";
	return "yellow";
}

export function Order(props: OrderProps) {
	const { order } = props;
	const items = order.items ?? [];

	const totalInCents = items.reduce((total, item) => {
		return total + item.quantity * (item.unitPriceInCents ?? 0);
	}, 0);

	const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
	const purchaseType = formatPurchaseType(order.purchaseType);
	const PurchaseIcon = order.purchaseType === "bankTransfer" ? Landmark : CreditCard;

	return (
		<Paper mt="md" p="md" radius="md" shadow="xs" withBorder>
			<Stack gap="md">
				<Group justify="space-between" align="flex-start" wrap="nowrap">
					<div>
						<Title order={3}>{order.reference}</Title>
						<Group gap={6} mt={4}>
							<CalendarClock size={14} />
							<Text size="sm" c="dimmed">
								Placed on {dateFormatter.format(new Date(order.createdAt))}
							</Text>
						</Group>
					</div>
					<Badge color={getStatusColor(order.status)} variant="light">
						{formatOrderStatus(order.status)}
					</Badge>
				</Group>

				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
					<Group gap="xs" wrap="nowrap">
						<ThemeIcon color="grape" size="md" variant="light">
							<PurchaseIcon size={16} />
						</ThemeIcon>
						<div>
							<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
								Purchase method
							</Text>
							<Text fw={600}>{purchaseType}</Text>
						</div>
					</Group>
					<Group gap="xs" wrap="nowrap">
						<ThemeIcon color="indigo" size="md" variant="light">
							<PackageCheck size={16} />
						</ThemeIcon>
						<div>
							<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
								Items
							</Text>
							<Text fw={600}>{totalQuantity}</Text>
						</div>
					</Group>
					<Group gap="xs" wrap="nowrap">
						<ThemeIcon color="teal" size="md" variant="light">
							<CircleDollarSign size={16} />
						</ThemeIcon>
						<div>
							<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
								Order total
							</Text>
							<Text fw={700}>{currencyFormatter.format(totalInCents / 100)}</Text>
						</div>
					</Group>
				</SimpleGrid>

				<Divider />

				{items.length === 0 ? (
					<Text size="sm" c="dimmed">
						No line items were found for this order.
					</Text>
				) : (
					<Stack gap="xs">
						{items.map((item) => (
							<OrderItem
								key={item.id ?? `${String(item.product)}-${item.variantLabel ?? "default"}`}
								item={item}
							/>
						))}
					</Stack>
				)}
			</Stack>
		</Paper>
	);
}
