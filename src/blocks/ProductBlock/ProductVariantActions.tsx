"use client";

import { checkout } from "#actions/checkout.ts";
import { useCartStore } from "#/stores/useCartStore";
import { useState } from "react";

import styles from "./ProductBlock.module.css";
import type { Product } from "#payload-types.ts";
import { Button, Group } from "@mantine/core";
import { ShoppingCart } from "pixelarticons/react";

type ProductVariantActionsProps = {
	productId: number;
	productName: string;
	variant: Product["variants"][number];
	payment: Product["payment"];
};

export function ProductVariantActions({ productId, productName, variant, payment }: ProductVariantActionsProps) {
	const [quantity, setQuantity] = useState(1);
	const [isLoading, setIsLoading] = useState<"stripe" | "bank" | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [infoMessage, setInfoMessage] = useState<string | null>(null);
	const addItem = useCartStore((store) => store.addItem);

	const allowStripe = payment?.allowStripe ?? true;
	const allowBankTransfer = payment?.allowBankTransfer ?? false;
	const canBePurchasedViaAnyMethod = allowStripe || allowBankTransfer;
	const variantLabel = variant.label || "Default";
	const cartName = `${productName} - ${variantLabel}`;

	function updateQuantity(value: number) {
		if (Number.isNaN(value)) return;
		const nextValue = Math.max(1, Math.floor(value));
		setQuantity(nextValue);
	}

	function handleAddToCart() {
		if (!variant.id) {
			setErrorMessage("This variant is missing its identifier.");
			setInfoMessage(null);
			return;
		}

		addItem({
			id: `${productId}:${variant.id}`,
			productId,
			variantId: variant.id,
			name: cartName,
			priceInCents: variant.priceInCents ?? 0,
			quantity,
		});

		setErrorMessage(null);
		setInfoMessage("Added to cart.");
	}

	async function handleBuyNow(method: "stripe" | "bank") {
		if (!variant.id) {
			setErrorMessage("This variant is missing its identifier.");
			setInfoMessage(null);
			return;
		}

		setIsLoading(method);
		setErrorMessage(null);
		setInfoMessage(null);

		try {
			const result = await checkout([{ productId, variantId: variant.id, quantity }], method);
			if (!result.success) {
				setErrorMessage(result.error);
				return;
			}

			if (result.type === "stripe") {
				window.location.href = result.url;
				return;
			}

			setInfoMessage(`Bank transfer order created. Reference: ${result.reference}`);
		} catch {
			setErrorMessage("Unable to process checkout right now. Please try again.");
		} finally {
			setIsLoading(null);
		}
	}

	return (
		<div className={styles.actionsWrap}>
			<div className={styles.quantityRow}>
				<label className={styles.quantityLabel} htmlFor={`qty-${variant.id ?? variantLabel}`}>
					Qty
				</label>
				<input
					id={`qty-${variant.id ?? variantLabel}`}
					type="number"
					min={1}
					step={1}
					value={quantity}
					onChange={(event) => updateQuantity(Number(event.target.value))}
					className={styles.quantityInput}
				/>
			</div>

			<Group className={styles.buttonRow}>
				{allowStripe && (
					<Button disabled={isLoading !== null} onClick={() => handleBuyNow("stripe")}>
						{isLoading === "stripe" ? "Starting checkout..." : "Buy Now via Stripe"}
					</Button>
				)}
				{allowBankTransfer && (
					<Button disabled={isLoading !== null} onClick={() => handleBuyNow("bank")}>
						{isLoading === "bank" ? "Creating order..." : "Buy Now via Bank Transfer"}
					</Button>
				)}
				<Button
					disabled={!canBePurchasedViaAnyMethod || isLoading !== null}
					onClick={handleAddToCart}
					leftSection={<ShoppingCart />}
				>
					Add to cart
				</Button>
			</Group>

			{errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
			{infoMessage && <p className={styles.infoText}>{infoMessage}</p>}
		</div>
	);
}