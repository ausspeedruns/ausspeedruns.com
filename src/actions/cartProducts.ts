"use server";

import { getPayload } from "payload";
import config from "#payload-config";
import type { Media } from "#payload-types.ts";

export interface CartProduct {
	id: number;
	name: string;
	slug: string | null;
	type: "ticket" | "merchandise";
	image: Media | null;
	available: boolean;
	allowStripe: boolean;
	allowBankTransfer: boolean;
	variants: { id: string; label: string; priceInCents: number; stock: number | null }[];
}

/** Fresh product data for the items in a cart. Products that no longer exist are simply missing from the result. */
export async function getCartProducts(productIds: number[]): Promise<CartProduct[]> {
	const ids = [...new Set(productIds)].filter((id) => Number.isInteger(id) && id > 0).slice(0, 50);
	if (ids.length === 0) return [];

	const payload = await getPayload({ config });
	const result = await payload.find({
		collection: "products",
		where: { id: { in: ids } },
		depth: 1,
		pagination: false,
		overrideAccess: false,
	});

	const now = new Date();

	return result.docs.map((product) => {
		const firstImage = product.images?.[0]?.image;
		return {
			id: product.id,
			name: product.name,
			slug: product.slug ?? null,
			type: product.type,
			image: firstImage && typeof firstImage === "object" ? firstImage : null,
			available:
				(!product.availableFrom || new Date(product.availableFrom) <= now) &&
				(!product.availableUntil || new Date(product.availableUntil) >= now),
			// Mirrors the checks in actions/checkout.ts and actions/checkout/bank.ts
			allowStripe: product.payment?.allowStripe !== false,
			allowBankTransfer: product.payment?.allowBankTransfer === true,
			variants: product.variants
				.filter((variant): variant is typeof variant & { id: string } => typeof variant.id === "string")
				.map((variant) => ({
					id: variant.id,
					label: variant.label,
					priceInCents: variant.priceInCents,
					stock: typeof variant.stock === "number" ? variant.stock : null,
				})),
		};
	});
}
