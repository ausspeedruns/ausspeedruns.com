import type { CartProduct } from "#actions/cartProducts.ts";
import type { CartItem } from "#stores/useCartStore.ts";
import { MAX_ITEM_QUANTITY } from "#utilities/cartLimits.ts";

export type PaymentMethod = "stripe" | "bank";

export interface CartLine {
	item: CartItem;
	product: CartProduct | null;
	name: string;
	variantLabel: string | null;
	priceInCents: number;
	maxQuantity: number;
	/** The product or variant has been deleted, so there's no current price. */
	missing: boolean;
	/** Set when the line can't be checked out as-is. */
	problem: string | null;
}

/**
 * Combines the saved cart with fresh product data. `products` is null while that data is still loading,
 * in which case the snapshot stored in the cart is used and no problems are reported.
 */
export function buildCartLines(items: CartItem[], products: Map<number, CartProduct> | null): CartLine[] {
	return items.map((item) => {
		const product = products?.get(item.productId) ?? null;
		const variant = product?.variants.find((candidate) => candidate.id === item.variantId) ?? null;
		const stock = variant?.stock ?? null;

		const missing = !!products && (!product || !variant);
		let problem: string | null = null;
		if (products) {
			if (!product || !variant) problem = "This item no longer exists. Remove it to continue.";
			else if (!product.available) problem = "No longer on sale. Remove it to continue.";
			else if (stock === 0) problem = "Sold out. Remove it to continue.";
			else if (stock !== null && stock < item.quantity)
				problem = `Only ${stock} left. Lower the quantity to continue.`;
		}

		return {
			item,
			product,
			name: product?.name ?? item.name,
			variantLabel: product && variant && product.variants.length > 1 ? variant.label : null,
			priceInCents: variant?.priceInCents ?? item.priceInCents,
			missing,
			maxQuantity: Math.max(1, Math.min(MAX_ITEM_QUANTITY, stock ?? MAX_ITEM_QUANTITY)),
			problem,
		};
	});
}

/** Names of the lines that stop a payment method from being used, e.g. "ASM26 Shirt (L)". */
export function linesBlockingMethod(lines: CartLine[], method: PaymentMethod): string[] {
	return lines
		.filter((line) => {
			if (!line.product) return false;
			return method === "stripe" ? !line.product.allowStripe : !line.product.allowBankTransfer;
		})
		.map((line) => (line.variantLabel ? `${line.name} (${line.variantLabel})` : line.name));
}
