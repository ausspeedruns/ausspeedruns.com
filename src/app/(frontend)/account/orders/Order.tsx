import type { Order as OrderType, PaymentSetting } from "#payload-types.ts";
import { Badge, Divider, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { BankTransferDetails } from "#components/BankTransferDetails/BankTransferDetails.tsx";
import { formatCents } from "#utilities/formatCents.ts";
import { OrderItem } from "./OrderItem";

interface OrderProps {
	order: OrderType;
	bankTransfer?: PaymentSetting["bankTransfer"];
}

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
	dateStyle: "medium",
	timeStyle: "short",
});

const STATUS: Record<OrderType["status"], { label: string; color: string }> = {
	pending: { label: "Awaiting payment", color: "yellow" },
	completed: { label: "Paid", color: "ausSpeedrunsBlue" },
	collected: { label: "Collected", color: "green" },
	cancelled: { label: "Cancelled", color: "gray" },
};

function formatPurchaseType(purchaseType: OrderType["purchaseType"]) {
	if (purchaseType === "bankTransfer") return "Bank transfer";
	if (purchaseType === "stripe") return "Card";
	return "Other";
}

export function Order({ order, bankTransfer }: OrderProps) {
	const items = order.items ?? [];
	const totalInCents =
		order.totalInCents >= 0
			? order.totalInCents
			: items.reduce((sum, item) => sum + item.quantity * (item.unitPriceInCents ?? 0), 0);
	const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
	const status = STATUS[order.status] ?? STATUS.pending;
	const awaitingTransfer = order.status === "pending" && order.purchaseType === "bankTransfer" && !!order.reference;

	return (
		<Paper p="lg" withBorder>
			<Group justify="space-between" align="flex-start" wrap="nowrap">
				<div>
					<Text ff="monospace" fw={700} size="lg">
						{order.reference}
					</Text>
					<Text size="sm" c="dimmed">
						{dateFormatter.format(new Date(order.createdAt))} · {formatPurchaseType(order.purchaseType)} ·{" "}
						{totalQuantity} {totalQuantity === 1 ? "item" : "items"}
					</Text>
				</div>
				<Stack gap={4} align="flex-end">
					<Badge color={status.color} variant="light">
						{status.label}
					</Badge>
					<Text fw={700}>{formatCents(totalInCents)}</Text>
				</Stack>
			</Group>

			<Divider my="md" />

			{items.length === 0 ? (
				<Text size="sm" c="dimmed">
					No items were found for this order.
				</Text>
			) : (
				<Stack gap={0}>
					{items.map((item, index) => (
						<OrderItem key={item.id ?? index} item={item} />
					))}
				</Stack>
			)}

			{awaitingTransfer && (
				<>
					<Divider my="md" />
					<Title order={3} size="h5" mb="sm">
						Waiting for your bank transfer
					</Title>
					<BankTransferDetails
						amountInCents={totalInCents}
						reference={order.reference!}
						accountName={bankTransfer?.accountName}
						bsb={bankTransfer?.bsb}
						accountNumber={bankTransfer?.accountNumber}
						instructions={bankTransfer?.instructions}
					/>
				</>
			)}
		</Paper>
	);
}
