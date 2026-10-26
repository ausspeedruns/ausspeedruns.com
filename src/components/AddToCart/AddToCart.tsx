"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Anchor, Button, Group, NumberInput, Select, Stack, Text } from "@mantine/core";
import type { Product } from "#payload-types.ts";
import { useCartStore } from "#stores/useCartStore.ts";
import { MAX_ITEM_QUANTITY, clampQuantity } from "#utilities/cartLimits.ts";
import { formatCents } from "#utilities/formatCents.ts";

interface AddToCartProps {
	product: Pick<Product, "id" | "name" | "payment">;
	/** Variants that can be picked. Defaults to all of the product's variants. */
	variants: Product["variants"];
	available?: boolean;
}

export function AddToCart({ product, variants, available = true }: AddToCartProps) {
	const router = useRouter();
	const addItem = useCartStore((state) => state.addItem);

	const options = variants.filter((variant): variant is typeof variant & { id: string } => !!variant.id);
	const hasChoice = options.length > 1;
	const pricesVary = new Set(options.map((option) => option.priceInCents)).size > 1;

	const [variantId, setVariantId] = useState<string | null>(hasChoice ? null : (options[0]?.id ?? null));
	const [quantity, setQuantity] = useState<number | string>(1);
	const [added, setAdded] = useState(false);

	const variant = options.find((option) => option.id === variantId);
	const stock = typeof variant?.stock === "number" ? variant.stock : null;
	const soldOut = stock === 0;
	const maxQuantity = Math.max(1, Math.min(MAX_ITEM_QUANTITY, stock ?? MAX_ITEM_QUANTITY));
	const canPay = product.payment?.allowStripe !== false || product.payment?.allowBankTransfer === true;

	if (!available || options.length === 0) {
		return <Text c="dimmed">Not on sale right now.</Text>;
	}

	if (!canPay) {
		return <Text c="dimmed">This can&apos;t be bought online.</Text>;
	}

	function add() {
		if (!variant || soldOut) return false;
		addItem({
			productId: product.id,
			variantId: variant.id,
			name: hasChoice ? `${product.name} (${variant.label})` : product.name,
			priceInCents: variant.priceInCents,
			quantity: Math.min(maxQuantity, clampQuantity(Number(quantity) || 1)),
		});
		return true;
	}

	const disabled = !variant || soldOut;

	return (
		<Stack gap="sm">
			{hasChoice && (
				<Select
					label="Option"
					placeholder="Choose an option"
					data={options.map((option) => ({
						value: option.id,
						label: [
							option.label,
							pricesVary ? formatCents(option.priceInCents) : null,
							option.stock === 0 ? "Sold out" : null,
						]
							.filter(Boolean)
							.join(" · "),
						disabled: option.stock === 0,
					}))}
					value={variantId}
					onChange={(value) => {
						setVariantId(value);
						setAdded(false);
					}}
					allowDeselect={false}
				/>
			)}

			{soldOut && !hasChoice ? (
				<Text fw={600}>Sold out</Text>
			) : (
				<>
					<NumberInput
						label="Quantity"
						w="6rem"
						min={1}
						max={maxQuantity}
						clampBehavior="strict"
						allowDecimal={false}
						allowNegative={false}
						value={quantity}
						onChange={(value) => {
							setQuantity(value);
							setAdded(false);
						}}
					/>
					<Group gap="sm">
						<Button disabled={disabled} onClick={() => add() && setAdded(true)}>
							Add to cart
						</Button>
						<Button variant="default" disabled={disabled} onClick={() => add() && router.push("/cart")}>
							Buy now
						</Button>
					</Group>
				</>
			)}

			{added && (
				<Text size="sm" role="status">
					Added to your cart.{" "}
					<Anchor component={Link} href="/cart">
						View cart
					</Anchor>
				</Text>
			)}
		</Stack>
	);
}
