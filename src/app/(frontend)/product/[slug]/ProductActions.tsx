"use client";

import { useState } from "react";
import { Button, NumberInput, Select } from "@mantine/core";
import { useCartStore } from "#/stores/useCartStore";
import type { Product } from "#/payload-types";

import styles from "./page.module.css";

interface ProductActionsProps {
	product: Product;
	available: boolean;
}

export default function ProductActions({ product, available }: ProductActionsProps) {
	const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
		product.variants.length === 1 ? (product.variants[0].id ?? null) : null,
	);
	const [quantity, setQuantity] = useState(1);
	const addItem = useCartStore((s) => s.addItem);

	const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

	const handleAddToCart = () => {
		if (!selectedVariant) return;
		addItem({
			id: selectedVariant.stripePriceId ?? "what",
			name: product.variants.length > 1 ? `${product.name} — ${selectedVariant.label}` : product.name,
			priceInCents: selectedVariant.priceInCents,
			quantity,
		});
	};

	if (!available) {
		return <p className={styles.unavailable}>This product is currently unavailable.</p>;
	}

	return (
		<div className={styles.actions}>
			{product.variants.length > 1 && (
				<Select
					label="Variant"
					placeholder="Select an option"
					data={product.variants.map((v) => ({
						value: v.id!,
						label: `${v.label} — $${(v.priceInCents / 100).toFixed(2)}`,
					}))}
					value={selectedVariantId}
					onChange={setSelectedVariantId}
				/>
			)}
			<NumberInput label="Quantity" min={1} max={10} value={quantity} onChange={(v) => setQuantity(Number(v))} />
			<Button onClick={handleAddToCart} disabled={!selectedVariant}>
				Add to cart ({selectedVariant?.stripePriceId})
			</Button>
		</div>
	);
}
