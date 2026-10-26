/** Highest quantity of a single product variant allowed in one checkout. Enforced server-side in actions/checkout.ts. */
export const MAX_ITEM_QUANTITY = 10;

export function clampQuantity(quantity: number): number {
	if (!Number.isFinite(quantity)) return 1;
	return Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.floor(quantity)));
}
