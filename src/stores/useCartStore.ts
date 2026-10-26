import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { clampQuantity } from "#utilities/cartLimits.ts";

export const CART_STORAGE_KEY = "ausspeedruns-cart";

export interface CartItem {
	/** `${productId}:${variantId}` */
	id: string;
	productId: number;
	variantId: string;
	/** Snapshot taken when added. The cart page shows fresh product data once it loads. */
	name: string;
	priceInCents: number;
	quantity: number;
}

interface CartStore {
	items: CartItem[];
	hasHydrated: boolean;
	addItem: (item: Omit<CartItem, "id">) => void;
	removeItem: (itemId: string) => void;
	updateItemQuantity: (itemId: string, quantity: number) => void;
	clearCart: () => void;
}

export function cartItemId(productId: number, variantId: string) {
	return `${productId}:${variantId}`;
}

const noopStorage: StateStorage = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {},
};

function isCartItem(value: unknown): value is CartItem {
	if (!value || typeof value !== "object") return false;
	const item = value as Record<string, unknown>;
	return (
		Number.isInteger(item.productId) &&
		typeof item.variantId === "string" &&
		item.variantId.length > 0 &&
		typeof item.name === "string" &&
		typeof item.priceInCents === "number" &&
		typeof item.quantity === "number"
	);
}

/** Drops malformed entries and merges duplicate lines from whatever is in storage. */
export function sanitiseCartItems(value: unknown): CartItem[] {
	if (!Array.isArray(value)) return [];

	const merged = new Map<string, CartItem>();
	for (const raw of value) {
		if (!isCartItem(raw)) continue;
		const id = cartItemId(raw.productId, raw.variantId);
		const existing = merged.get(id);
		merged.set(id, {
			...raw,
			id,
			quantity: clampQuantity((existing?.quantity ?? 0) + raw.quantity),
		});
	}
	return [...merged.values()];
}

export const useCartStore = create<CartStore>()(
	persist(
		(set) => ({
			items: [],
			hasHydrated: false,
			addItem: (item) =>
				set((state) => {
					const id = cartItemId(item.productId, item.variantId);
					const existing = state.items.find((candidate) => candidate.id === id);
					if (existing) {
						return {
							items: state.items.map((candidate) =>
								candidate.id === id
									? {
											...candidate,
											...item,
											id,
											quantity: clampQuantity(candidate.quantity + item.quantity),
										}
									: candidate,
							),
						};
					}
					return { items: [...state.items, { ...item, id, quantity: clampQuantity(item.quantity) }] };
				}),
			removeItem: (itemId) => set((state) => ({ items: state.items.filter((item) => item.id !== itemId) })),
			updateItemQuantity: (itemId, quantity) =>
				set((state) => ({
					items: state.items.map((item) =>
						item.id === itemId ? { ...item, quantity: clampQuantity(quantity) } : item,
					),
				})),
			clearCart: () => set({ items: [] }),
		}),
		{
			name: CART_STORAGE_KEY,
			version: 1,
			storage: createJSONStorage(() => (typeof window === "undefined" ? noopStorage : window.localStorage)),
			// Hydrated manually by CartHydrator so the server render and first client render match.
			skipHydration: true,
			partialize: (state) => ({ items: state.items }),
			merge: (persisted, current) => ({
				...current,
				items: sanitiseCartItems((persisted as { items?: unknown } | undefined)?.items),
			}),
			onRehydrateStorage: () => () => {
				useCartStore.setState({ hasHydrated: true });
			},
		},
	),
);
