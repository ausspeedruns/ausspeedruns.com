import { create } from "zustand";

// const dummyCartItem: CartItem = {
// 	id: "5",
// 	name: "ASO2026 Ticket",
// 	priceInCents: 1000,
// 	quantity: 1,
// };

export interface CartItem {
	id: string;
	productId: number;
	variantId: string;
	name: string;
	priceInCents: number;
	quantity: number;
}

interface CartStore {
	items: CartItem[];
	addItem: (item: CartItem) => void;
	removeItem: (itemId: string) => void;
	updateItemQuantity: (itemId: string, quantity: number) => void;
	clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
	// items: [dummyCartItem],
	items: [],
	addItem: (item) => set((state) => ({ items: [...state.items, item] })),
	removeItem: (itemId) => set((state) => ({ items: state.items.filter((item) => item.id !== itemId) })),
	updateItemQuantity: (itemId, quantity) =>
		set((state) => ({
			items: state.items.map((item) =>
				item.id === itemId
					? {
							...item,
							quantity,
						}
					: item,
			),
		})),
	clearCart: () => set({ items: [] }),
}));