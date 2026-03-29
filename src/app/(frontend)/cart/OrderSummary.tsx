"use client";

import { Button, Divider, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { CreditCard, Landmark } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
	style: "currency",
	currency: "AUD",
});

function formatCurrency(amountInCents: number) {
	return currencyFormatter.format(amountInCents / 100);
}

interface OrderSummaryProps {
	itemCount: number;
	totalInCents: number;
	disabled: boolean;
	loading: boolean;
	onCheckout: (type: "stripe" | "bank") => void;
}

export function OrderSummary(props: OrderSummaryProps) {
	return (
		<Paper p="xl" radius="lg" shadow="xs" withBorder style={{ position: "sticky", top: "6rem" }}>
			<Stack gap="md">
				<div>
					<Text c="dimmed" size="sm">
						Order summary
					</Text>
					<Title order={2} mt={4}>
						{props.itemCount} {props.itemCount === 1 ? "item" : "items"}
					</Title>
				</div>

				<Divider />

				<Group justify="space-between">
					<Text fw={700}>Total</Text>
					<Title order={3}>{formatCurrency(props.totalInCents)}</Title>
				</Group>

				<Button
					fullWidth
					leftSection={<CreditCard size={16} />}
					size="md"
					disabled={props.disabled}
					loading={props.loading}
					onClick={() => props.onCheckout("stripe")}
				>
					Pay with card
				</Button>

				<Button
					fullWidth
					leftSection={<Landmark size={16} />}
					size="md"
					variant="light"
					disabled={props.disabled}
					loading={props.loading}
					onClick={() => props.onCheckout("bank")}
				>
					Bank Transfer
				</Button>
			</Stack>
		</Paper>
	);
}
