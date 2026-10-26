"use client";

import Link from "next/link";
import { Button, Divider, Group, Paper, Skeleton, Stack, Text, Title } from "@mantine/core";
import { formatCents } from "#utilities/formatCents.ts";
import type { PaymentMethod } from "./cartLines";

interface OrderSummaryProps {
	ready: boolean;
	itemCount: number;
	lineCount: number;
	totalInCents: number;
	isLoggedIn: boolean;
	hasProblems: boolean;
	/** For each payment method, the items that can't be bought with it. */
	blockedBy: Record<PaymentMethod, string[]>;
	checkingOut: PaymentMethod | null;
	onCheckout: (method: PaymentMethod) => void;
	className?: string;
}

const METHODS: { method: PaymentMethod; label: string; unavailableLabel: string }[] = [
	{ method: "stripe", label: "Pay by card", unavailableLabel: "Card payment" },
	{ method: "bank", label: "Pay by bank transfer", unavailableLabel: "Bank transfer" },
];

export function OrderSummary(props: OrderSummaryProps) {
	const empty = props.itemCount === 0;
	const firstAvailable = METHODS.find(({ method }) => props.blockedBy[method].length === 0)?.method;

	return (
		<Paper p="lg" withBorder className={props.className}>
			<Stack gap="md">
				<Title order={2} size="h4">
					Summary
				</Title>

				<Group justify="space-between" align="baseline">
					<Text>
						Total{" "}
						{props.ready && !empty && (
							<Text span c="dimmed" size="sm">
								({props.itemCount} {props.itemCount === 1 ? "item" : "items"})
							</Text>
						)}
					</Text>
					{props.ready ? (
						<Text fw={700} size="xl">
							{formatCents(props.totalInCents)}
						</Text>
					) : (
						<Skeleton height={28} width={96} />
					)}
				</Group>

				<Divider />

				{!props.isLoggedIn ? (
					<Stack gap="xs">
						<Button component={Link} href="/login?redirect=/cart" fullWidth disabled={empty}>
							Log in to checkout
						</Button>
						<Text size="sm" c="dimmed">
							Orders and tickets are attached to your account. Your cart will still be here after you log
							in.
						</Text>
					</Stack>
				) : (
					<Stack gap="sm">
						{props.hasProblems && (
							<Text size="sm" c="red">
								Some items in your cart need attention before you can check out.
							</Text>
						)}
						{METHODS.map(({ method, label, unavailableLabel }) => {
							const blockedBy = props.blockedBy[method];
							const blocked = blockedBy.length > 0;
							return (
								<Stack gap={4} key={method}>
									<Button
										fullWidth
										variant={method === firstAvailable ? "filled" : "default"}
										disabled={
											!props.ready ||
											empty ||
											blocked ||
											props.hasProblems ||
											props.checkingOut !== null
										}
										loading={props.checkingOut === method}
										onClick={() => props.onCheckout(method)}
									>
										{label}
									</Button>
									{blocked && (
										<Text size="xs" c="dimmed">
											{blockedBy.length === props.lineCount
												? `${unavailableLabel} isn't available for ${props.lineCount === 1 ? "this item" : "these items"}.`
												: `${unavailableLabel} isn't available for: ${blockedBy.join(", ")}`}
										</Text>
									)}
								</Stack>
							);
						})}
					</Stack>
				)}
			</Stack>
		</Paper>
	);
}
