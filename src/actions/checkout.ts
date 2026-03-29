"use server";
import { getPayload } from "payload";
import config from "#payload-config";
import { headers } from "next/headers";
import type { Product } from "#payload-types.ts";

import { stripeCheckout } from "./checkout/stripe.ts";
import { bankCheckout } from "./checkout/bank.ts";

interface CheckoutItem {
	priceId: string;
	quantity: number;
}

export type CheckoutResult =
	| { success: true; type: "stripe"; url: string }
	| { success: true; type: "bank"; reference: string }
	| { success: false; error: string };

export async function checkout(items: CheckoutItem[], method: "stripe" | "bank"): Promise<CheckoutResult> {
	// Verify they are logged in
	const payload = await getPayload({ config });
	const requestHeaders = await headers();

	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		return { success: false, error: "You must be logged in to checkout." };
	}

	// Get product data for the items being purchased
	const productInformation = await payload.find({
		collection: "products",
		where: {
			"variants.stripePriceId": {
				in: items.map((item) => item.priceId),
			},
		},
		pagination: false,
	});

	// Map the checkout items to include product and variant information
	const allItemData: { priceId: string; quantity: number; product: Product; variant: Product["variants"][number] }[] =
		items
			.map((item) => {
				console.log("Finding product for priceId:", item.priceId);
				const product = productInformation.docs.find((doc) =>
					doc.variants.some((variant) => variant.stripePriceId === item.priceId),
				);
				console.log("Found product:", product?.name);
				const variant = product?.variants.find((v) => v.stripePriceId === item.priceId);
				console.log("Found variant:", variant?.label);
				if (product && variant) {
					return { priceId: item.priceId, quantity: item.quantity, product, variant };
				}
				return null;
			})
			.filter(
				(
					item,
				): item is {
					priceId: string;
					quantity: number;
					product: Product;
					variant: Product["variants"][number];
				} => item !== null,
			);

	// Check if all items were found
	if (allItemData.length !== items.length) {
		return { success: false, error: "Some items in your cart were not found. Please refresh and try again." };
	}

	// Check stock and availability
	const itemsNotAvailable = allItemData.filter((item) => !item.product.active);
	if (itemsNotAvailable.length > 0) {
		return { success: false, error: "Some products in your cart are no longer available." };
	}

	const itemsNotInStock = allItemData.filter((item) => {
		if (item.variant.stock === undefined || item.variant.stock === null) {
			return false; // If stock is not defined then we do not have a limit
		}

		return !item.variant || item.variant.stock < item.quantity;
	});

	if (itemsNotInStock.length > 0) {
		return { success: false, error: "Insufficient stock for some items in your cart." };
	}

	if (method === "bank") {
		return bankCheckout(user.id, allItemData);
	} else {
		return stripeCheckout(user.id, allItemData);
	}
}
