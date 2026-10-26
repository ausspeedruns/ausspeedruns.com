"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert, Anchor, Button, Grid, Modal, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { checkout, type BankDetails } from "#actions/checkout.ts";
import { getCartProducts, type CartProduct } from "#actions/cartProducts.ts";
import { BankTransferDetails } from "#components/BankTransferDetails/BankTransferDetails.tsx";
import { useCartStore } from "#stores/useCartStore.ts";
import { CartItem } from "./CartItem";
import { OrderSummary } from "./OrderSummary";
import { buildCartLines, linesBlockingMethod, type PaymentMethod } from "./cartLines";

import styles from "./CartPageClient.module.css";

interface CartPageClientProps {
	isLoggedIn: boolean;
}

interface BankOrder {
	reference: string;
	totalInCents: number;
	bankDetails: BankDetails;
}

export function CartPageClient({ isLoggedIn }: CartPageClientProps) {
	const items = useCartStore((state) => state.items);
	const hasHydrated = useCartStore((state) => state.hasHydrated);
	const removeItem = useCartStore((state) => state.removeItem);
	const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
	const clearCart = useCartStore((state) => state.clearCart);

	const [products, setProducts] = useState<Map<number, CartProduct> | null>(null);
	const [productsFailed, setProductsFailed] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>();
	const [checkingOut, setCheckingOut] = useState<PaymentMethod | null>(null);
	const [bankOrder, setBankOrder] = useState<BankOrder>();
	const [bankModalOpened, bankModal] = useDisclosure(false);

	const productIdsKey = [...new Set(items.map((item) => item.productId))].sort((a, b) => a - b).join(",");

	useEffect(() => {
		if (!hasHydrated) return;
		const ids = productIdsKey ? productIdsKey.split(",").map(Number) : [];
		if (ids.length === 0) {
			setProducts(new Map());
			return;
		}

		let cancelled = false;
		getCartProducts(ids)
			.then((result) => {
				if (cancelled) return;
				setProducts(new Map(result.map((product) => [product.id, product])));
				setProductsFailed(false);
			})
			.catch(() => {
				if (!cancelled) setProductsFailed(true);
			});
		return () => {
			cancelled = true;
		};
	}, [hasHydrated, productIdsKey]);

	const lines = useMemo(() => buildCartLines(items, products), [items, products]);
	const blockedBy = useMemo(
		() => ({ stripe: linesBlockingMethod(lines, "stripe"), bank: linesBlockingMethod(lines, "bank") }),
		[lines],
	);

	const countedLines = lines.filter((line) => !line.missing);
	const totalInCents = countedLines.reduce((sum, line) => sum + line.priceInCents * line.item.quantity, 0);
	const itemCount = countedLines.reduce((sum, line) => sum + line.item.quantity, 0);
	const loadingProducts = products === null && !productsFailed;

	function handleRemove(itemId: string) {
		removeItem(itemId);
		setErrorMessage(undefined);
	}

	function handleUpdateQuantity(itemId: string, quantity: number) {
		if (quantity < 1) removeItem(itemId);
		else updateItemQuantity(itemId, quantity);
		setErrorMessage(undefined);
	}

	async function handleCheckout(method: PaymentMethod) {
		setErrorMessage(undefined);
		setCheckingOut(method);

		try {
			const result = await checkout(
				items.map((item) => ({
					productId: item.productId,
					variantId: item.variantId,
					quantity: item.quantity,
				})),
				method,
			);

			if (!result.success) {
				setErrorMessage(result.error);
				setCheckingOut(null);
				return;
			}

			if (result.type === "stripe") {
				// The cart is cleared on /success, so it survives if the payment is cancelled.
				window.location.href = result.url;
				return;
			}

			setBankOrder({
				reference: result.reference,
				totalInCents: result.totalInCents,
				bankDetails: result.bankDetails,
			});
			clearCart();
			bankModal.open();
			setCheckingOut(null);
		} catch {
			setErrorMessage("Something went wrong starting checkout. Please try again.");
			setCheckingOut(null);
		}
	}

	return (
		<main className={`container ${styles.page}`}>
			<Stack gap="lg">
				<Title order={1}>Cart</Title>

				{errorMessage && (
					<Alert color="red" variant="light">
						{errorMessage}
					</Alert>
				)}

				{hasHydrated && items.length === 0 ? (
					<Stack gap="xs" align="flex-start">
						<Text>Your cart is empty.</Text>
						<Anchor component={Link} href="/">
							Continue browsing
						</Anchor>
					</Stack>
				) : (
					<Grid gap="xl" align="flex-start">
						<Grid.Col span={{ base: 12, md: 8 }}>
							{!hasHydrated ? (
								<Stack gap="md">
									<Skeleton height={72} />
									<Skeleton height={72} />
								</Stack>
							) : (
								<ul className={styles.list}>
									{lines.map((line) => (
										<CartItem
											key={line.item.id}
											line={line}
											loading={loadingProducts}
											onRemove={handleRemove}
											onUpdateQuantity={handleUpdateQuantity}
										/>
									))}
								</ul>
							)}
						</Grid.Col>

						<Grid.Col span={{ base: 12, md: 4 }}>
							<OrderSummary
								className={styles.summary}
								ready={hasHydrated && !loadingProducts}
								itemCount={itemCount}
								lineCount={lines.length}
								totalInCents={totalInCents}
								isLoggedIn={isLoggedIn}
								hasProblems={lines.some((line) => line.problem)}
								blockedBy={blockedBy}
								checkingOut={checkingOut}
								onCheckout={handleCheckout}
							/>
						</Grid.Col>
					</Grid>
				)}
			</Stack>

			<Modal
				opened={bankModalOpened}
				onClose={bankModal.close}
				title={<Text fw={700}>Order placed: transfer to finish</Text>}
				centered
				closeOnClickOutside={false}
			>
				{bankOrder && (
					<Stack gap="lg">
						<Text size="sm">
							Your order has been created. Transfer the amount below to complete it. These details are
							also on your orders page.
						</Text>
						<BankTransferDetails
							amountInCents={bankOrder.totalInCents}
							reference={bankOrder.reference}
							accountName={bankOrder.bankDetails.accountName}
							bsb={bankOrder.bankDetails.bsb}
							accountNumber={bankOrder.bankDetails.accountNumber}
							instructions={bankOrder.bankDetails.instructions}
						/>
						<Button component={Link} href="/account/orders" fullWidth>
							Go to my orders
						</Button>
					</Stack>
				)}
			</Modal>
		</main>
	);
}
