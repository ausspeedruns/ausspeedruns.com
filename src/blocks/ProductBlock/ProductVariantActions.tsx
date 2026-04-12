"use client";

import { checkout } from "#actions/checkout.ts";
import { useCartStore } from "#/stores/useCartStore";
import { useState } from "react";

import styles from "./ProductBlock.module.css";

type ProductVariant = {
	id?: string;
	label?: string | null;
	priceInCents?: number | null;
	stripePriceId?: string | null;
	bankTransferDetails?: {
		allowBankTransfer?: boolean | null;
	} | null;
};

type ProductVariantActionsProps = {
	productName: string;
	variant: ProductVariant;
	ctaLabel: string;
};

export function ProductVariantActions({ productName, variant, ctaLabel }: ProductVariantActionsProps) {
	const [quantity, setQuantity] = useState(1);
	const [isLoading, setIsLoading] = useState<"stripe" | "bank" | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [infoMessage, setInfoMessage] = useState<string | null>(null);
	const addItem = useCartStore((store) => store.addItem);

	const hasCheckoutPriceId = !!variant.stripePriceId;
	const allowBankTransfer = variant.bankTransferDetails?.allowBankTransfer ?? true;
	const variantLabel = variant.label || "Default";
	const cartName = `${productName} - ${variantLabel}`;

	function updateQuantity(value: number) {
		if (Number.isNaN(value)) return;
		const nextValue = Math.max(1, Math.floor(value));
		setQuantity(nextValue);
	}

	function handleAddToCart() {
		if (!variant.stripePriceId) {
			setErrorMessage("This variant cannot be added to cart yet.");
			setInfoMessage(null);
			return;
		}

		addItem({
			id: variant.stripePriceId,
			name: cartName,
			priceInCents: variant.priceInCents ?? 0,
			quantity,
		});

		setErrorMessage(null);
		setInfoMessage("Added to cart.");
	}

	async function handleBuyNow(method: "stripe" | "bank") {
		if (!variant.stripePriceId) {
			setErrorMessage("This variant is missing a checkout price ID.");
			setInfoMessage(null);
			return;
		}

		setIsLoading(method);
		setErrorMessage(null);
		setInfoMessage(null);

		try {
			const result = await checkout([{ priceId: variant.stripePriceId, quantity }], method);
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

			<div className={styles.buttonRow}>
				<button
					type="button"
					className={styles.purchaseButton}
					disabled={!hasCheckoutPriceId || isLoading !== null}
					onClick={() => handleBuyNow("stripe")}
				>
					{isLoading === "stripe" ? "Starting checkout..." : ctaLabel}
				</button>
				<button
					type="button"
					className={styles.bankButton}
					disabled={!hasCheckoutPriceId || !allowBankTransfer || isLoading !== null}
					onClick={() => handleBuyNow("bank")}
				>
					{isLoading === "bank" ? "Creating order..." : "Buy with Bank"}
				</button>
				<button
					type="button"
					className={styles.addToCartButton}
					disabled={!hasCheckoutPriceId || isLoading !== null}
					onClick={handleAddToCart}
				>
					Add to cart
				</button>
			</div>

			{errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
			{infoMessage && <p className={styles.infoText}>{infoMessage}</p>}
		</div>
	);
}
