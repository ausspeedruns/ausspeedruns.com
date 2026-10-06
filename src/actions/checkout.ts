"use server";
import { getPayload } from "payload";
import config from "#payload-config";
import { headers } from "next/headers";
import type { Product } from "#payload-types.ts";

import { stripeCheckout } from "./checkout/stripe.ts";
import { bankCheckout } from "./checkout/bank.ts";

interface CheckoutItem {
	productId: number;
	variantId: string;
	quantity: number;
}

const MAX_CHECKOUT_QUANTITY = 10;

export type CheckoutResult =
	| { success: true; type: "stripe"; url: string }
	| { success: true; type: "bank"; reference: string; totalInCents: number }
	| { success: false; error: string };

export async function checkout(items: CheckoutItem[], method: "stripe" | "bank"): Promise<CheckoutResult> {
	if (
		!Array.isArray(items) ||
		items.length === 0 ||
		!items.every(
			(item) =>
				Number.isInteger(item.productId) &&
				item.productId > 0 &&
				typeof item.variantId === "string" &&
				item.variantId.length > 0 &&
				Number.isInteger(item.quantity) &&
				item.quantity > 0 &&
				item.quantity <= MAX_CHECKOUT_QUANTITY,
		)
	) {
		return { success: false, error: "Your cart contains invalid items. Please refresh and try again." };
	}

	if (method !== "stripe" && method !== "bank") {
		return { success: false, error: "Invalid checkout method." };
	}

	const itemKeys = items.map((item) => `${item.productId}:${item.variantId}`);
	if (new Set(itemKeys).size !== itemKeys.length) {
		return { success: false, error: "Your cart contains duplicate items. Please refresh and try again." };
	}

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
			id: {
				in: items.map((item) => item.productId),
			},
		},
		pagination: false,
	});

	// Map the checkout items to include product and variant information
	const allItemData: { quantity: number; product: Product; variant: Product["variants"][number] }[] = items
		.map((item) => {
			const product = productInformation.docs.find((doc) => doc.id === item.productId);
			const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
			if (product && variant) {
				return { quantity: item.quantity, product, variant };
			}
			return null;
		})
		.filter(
			(item): item is { quantity: number; product: Product; variant: Product["variants"][number] } =>
				item !== null,
		);

	// Check if all items were found
	if (allItemData.length !== items.length) {
		return { success: false, error: "Some items in your cart were not found. Please refresh and try again." };
	}

	// Check stock and availability
	const now = new Date();
	const itemsNotAvailable = allItemData.filter((item) => {
		const availableFrom = item.product.availableFrom ? new Date(item.product.availableFrom) : null;
		const availableUntil = item.product.availableUntil ? new Date(item.product.availableUntil) : null;

		return (availableFrom && availableFrom > now) || (availableUntil && availableUntil < now);
	});
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
		return stripeCheckout({ id: user.id, email: user.email, stripeCustomerId: user.stripeCustomerId }, allItemData);
	}
}