"use client";

import { useRowLabel } from "@payloadcms/ui";

import type { Product } from "#/payload-types";

export const VariantRowLabel = () => {
	const { data, rowNumber } = useRowLabel<NonNullable<Product["variants"]>[number]>();

	const price =
		typeof data?.priceInCents === "number"
			? new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(data.priceInCents / 100)
			: null;

	return (
		<div>
			{data?.label || `Variant ${(rowNumber ?? 0) + 1}`}
			{price ? ` — ${price}` : ""}
		</div>
	);
};
