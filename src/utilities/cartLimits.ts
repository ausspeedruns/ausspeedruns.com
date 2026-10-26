/** Highest quantity of a single product variant allowed in one checkout. Enforced server-side in actions/checkout.ts. */
export const MAX_ITEM_QUANTITY = 10;

/** Highest number of distinct lines allowed in one checkout (Stripe allows at most 100 line items). */
export const MAX_CART_LINES = 50;

export function clampQuantity(quantity: number): number {
	if (!Number.isFinite(quantity)) return 1;
	return Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.floor(quantity)));
}
