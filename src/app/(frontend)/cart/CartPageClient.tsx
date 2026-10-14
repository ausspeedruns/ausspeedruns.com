"use client";

import { CartItem } from "./CartItem";
import { OrderSummary } from "./OrderSummary";
import styles from "./cart.module.css";
import { useCartStore } from "#stores/useCartStore.ts";
import {
	Alert,
	Button,
	Code,
	CopyButton,
	Divider,
	Grid,
	Group,
	Modal,
	Paper,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AlertCircle, Check, CircleCheck, Copy, Landmark, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { checkout, type BankDetails } from "#actions/checkout.ts";
import Link from "next/link";

export function CartPageClient() {
	const { items, removeItem: removeItemStore, updateItemQuantity, clearCart } = useCartStore();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [checkingOut, setCheckingOut] = useState(false);
	const [bankModalOpened, { open: openBankModal, close: closeBankModal }] = useDisclosure(false);
	const [bankReference, setBankReference] = useState<string | null>(null);
	const [bankTotalInCents, setBankTotalInCents] = useState(0);
	const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);

	const totalInCents = items.reduce((sum, item) => sum + item.priceInCents * item.quantity, 0);
	const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

	function updateQuantity(itemId: string, nextQuantity: number) {
		if (nextQuantity < 1) {
			removeItemStore(itemId);
		} else {
			const item = items.find((item) => item.id === itemId);
			if (item) {
				updateItemQuantity(itemId, nextQuantity);
			}
		}
		setErrorMessage(null);
	}

	function removeItem(itemId: string) {
		removeItemStore(itemId);
		setErrorMessage(null);
	}

	async function handleCheckout(type: "stripe" | "bank") {
		setErrorMessage(null);
		setCheckingOut(true);

		try {
			const result = await checkout(
				items.map((item) => ({
					productId: item.productId,
					variantId: item.variantId,
					quantity: item.quantity,
				})),
				type,
			);

			if (!result.success) {
				setErrorMessage(result.error);
				return;
			}

			if (result.type === "stripe") {
				clearCart();
				window.location.href = result.url;
				return;
			}

			if (result.type === "bank") {
				setBankTotalInCents(result.totalInCents);
				setBankDetails(result.bankDetails);
				clearCart();
				setBankReference(result.reference);
				openBankModal();
			}
		} catch {
			setErrorMessage("An unexpected error occurred. Please try again.");
		} finally {
			setCheckingOut(false);
		}
	}

	return (
		<div className={styles.pageShell}>
			<Stack gap="xl">
				<Title order={1}>Your cart</Title>

				{errorMessage && (
					<Alert color="red" icon={<AlertCircle size={16} />} variant="light">
						{errorMessage}
					</Alert>
				)}

				<Grid align="start" gap="xl">
					<Grid.Col span={{ base: 12, md: 7 }}>
						<Stack gap="md">
							{items.length === 0 ? (
								<Paper p="xl" shadow="xs" withBorder>
									<Stack align="center" gap="md" py="lg">
										<ThemeIcon color="gray" size={56} variant="light">
											<ShoppingCart size={28} />
										</ThemeIcon>
										<Title order={3}>Your cart is empty</Title>
									</Stack>
								</Paper>
							) : (
								items.map((item) => {
									return (
										<CartItem
											key={item.id}
											item={item}
											onRemove={removeItem}
											onUpdateQuantity={updateQuantity}
										/>
									);
								})
							)}
						</Stack>
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 5 }}>
						<OrderSummary
							itemCount={itemCount}
							totalInCents={totalInCents}
							disabled={items.length === 0}
							loading={checkingOut}
							onCheckout={handleCheckout}
						/>
					</Grid.Col>
				</Grid>
			</Stack>

			<Modal
				opened={bankModalOpened}
				onClose={closeBankModal}
				title={
					<Group gap="xs">
						<ThemeIcon color="green" variant="light" size="lg">
							<CircleCheck size={20} />
						</ThemeIcon>
						<Title order={3}>Order placed</Title>
					</Group>
				}
				centered
				size="md"
				closeOnClickOutside={false}
			>
				<Stack gap="md">
					<Text>Your order has been created. Please complete the bank transfer using the details below.</Text>

					<Paper p="md" withBorder bg="var(--mantine-color-blue-light)">
						<Group justify="space-between">
							<Text fw={600}>Amount to transfer</Text>
							<Title order={3}>
								{new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
									bankTotalInCents / 100,
								)}
							</Title>
						</Group>
					</Paper>

					<Paper p="md" withBorder>
						<Stack gap="xs">
							<Group justify="space-between">
								<Text c="dimmed" size="sm">
									Account name
								</Text>
								<Text fw={600}>{bankDetails?.accountName}</Text>
							</Group>
							<Group justify="space-between">
								<Text c="dimmed" size="sm">
									BSB
								</Text>
								<Text fw={600}>{bankDetails?.bsb}</Text>
							</Group>
							<Group justify="space-between">
								<Text c="dimmed" size="sm">
									Account number
								</Text>
								<Text fw={600}>{bankDetails?.accountNumber}</Text>
							</Group>
						</Stack>
					</Paper>

					{bankDetails?.instructions && <Text size="sm">{bankDetails.instructions}</Text>}

					<Divider />

					<Stack gap={4}>
						<Text size="sm" fw={600}>
							Transfer description / reference
						</Text>
						<Text size="sm" c="dimmed">
							You must include this reference in your bank transfer so we can match your payment.
						</Text>
						<Group gap="xs">
							<Code block style={{ flex: 1, fontSize: "1.1rem", textAlign: "center" }}>
								{bankReference}
							</Code>
							<CopyButton value={bankReference ?? ""}>
								{({ copied, copy }) => (
									<Button
										variant="light"
										color={copied ? "green" : "blue"}
										onClick={copy}
										leftSection={copied ? <Check size={16} /> : <Copy size={16} />}
										size="sm"
									>
										{copied ? "Copied" : "Copy"}
									</Button>
								)}
							</CopyButton>
						</Group>
					</Stack>

					<Divider />

					<Button component={Link} href="/account/orders" fullWidth leftSection={<Landmark size={16} />}>
						View your orders
					</Button>
					<Button variant="light" onClick={closeBankModal} fullWidth>
						Close
					</Button>
				</Stack>
			</Modal>
		</div>
	);
}
