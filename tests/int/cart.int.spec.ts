import { beforeEach, describe, expect, it, vi } from "vitest";

// Node 25+ ships a global localStorage that shadows jsdom's and is undefined without --localstorage-file.
// The store grabs storage when it's created, so this has to run before the import below.
vi.hoisted(() => {
	const data = new Map<string, string>();
	const storage = {
		get length() {
			return data.size;
		},
		clear: () => data.clear(),
		getItem: (key: string) => data.get(key) ?? null,
		key: (index: number) => [...data.keys()][index] ?? null,
		removeItem: (key: string) => void data.delete(key),
		setItem: (key: string, value: string) => void data.set(key, String(value)),
	};
	Object.defineProperty(window, "localStorage", { value: storage, configurable: true });
});

import { CART_STORAGE_KEY, sanitiseCartItems, useCartStore } from "#/stores/useCartStore";
import { buildCartLines, linesBlockingMethod } from "#/app/(frontend)/cart/cartLines";
import type { CartProduct } from "#/actions/cartProducts";

const shirt = { productId: 1, variantId: "m", name: "Shirt (M)", priceInCents: 3000, quantity: 1 };
const ticket = { productId: 2, variantId: "std", name: "Ticket", priceInCents: 5000, quantity: 1 };

function product(overrides: Partial<CartProduct> & Pick<CartProduct, "id" | "variants">): CartProduct {
	return {
		name: `Product ${overrides.id}`,
		slug: null,
		type: "merchandise",
		image: null,
		available: true,
		allowStripe: true,
		allowBankTransfer: true,
		...overrides,
	};
}

describe("cart store", () => {
	beforeEach(() => {
		window.localStorage.clear();
		useCartStore.setState({ items: [], hasHydrated: false });
	});

	it("merges repeat adds of the same variant into one line", () => {
		useCartStore.getState().addItem(shirt);
		useCartStore.getState().addItem({ ...shirt, quantity: 2 });
		useCartStore.getState().addItem(ticket);

		const { items } = useCartStore.getState();
		expect(items).toHaveLength(2);
		expect(items[0]).toMatchObject({ id: "1:m", quantity: 3 });
		expect(items[1]).toMatchObject({ id: "2:std", quantity: 1 });
	});

	it("caps quantities at the checkout limit", () => {
		useCartStore.getState().addItem({ ...shirt, quantity: 8 });
		useCartStore.getState().addItem({ ...shirt, quantity: 8 });
		expect(useCartStore.getState().items[0].quantity).toBe(10);

		useCartStore.getState().updateItemQuantity("1:m", 50);
		expect(useCartStore.getState().items[0].quantity).toBe(10);

		useCartStore.getState().updateItemQuantity("1:m", 0);
		expect(useCartStore.getState().items[0].quantity).toBe(1);
	});

	it("saves to localStorage and restores it on rehydrate (refresh / new tab)", async () => {
		useCartStore.getState().addItem({ ...shirt, quantity: 2 });
		expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).state.items).toHaveLength(1);

		// Simulate a fresh page load: in-memory state is gone, storage remains.
		useCartStore.setState({ items: [], hasHydrated: false });
		window.localStorage.setItem(
			CART_STORAGE_KEY,
			JSON.stringify({ state: { items: [{ ...shirt, id: "1:m", quantity: 2 }] }, version: 1 }),
		);

		await useCartStore.persist.rehydrate();

		const state = useCartStore.getState();
		expect(state.hasHydrated).toBe(true);
		expect(state.items).toEqual([{ ...shirt, id: "1:m", quantity: 2 }]);
	});

	it("does not persist the hydration flag", () => {
		useCartStore.getState().addItem(shirt);
		expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).state).not.toHaveProperty("hasHydrated");
	});
});

describe("sanitiseCartItems", () => {
	it("drops malformed entries and merges duplicates", () => {
		const result = sanitiseCartItems([
			shirt,
			{ ...shirt, quantity: 4 },
			{ productId: "nope", variantId: "x" },
			null,
			ticket,
		]);
		expect(result).toEqual([
			{ ...shirt, id: "1:m", quantity: 5 },
			{ ...ticket, id: "2:std" },
		]);
	});

	it("returns an empty cart for non-array data", () => {
		expect(sanitiseCartItems(undefined)).toEqual([]);
		expect(sanitiseCartItems({ items: [] })).toEqual([]);
	});
});

describe("buildCartLines", () => {
	const items = [
		{ ...shirt, id: "1:m", quantity: 3 },
		{ ...ticket, id: "2:std" },
	];

	it("uses the cart snapshot and reports no problems while products load", () => {
		const lines = buildCartLines(items, null);
		expect(lines.map((line) => line.problem)).toEqual([null, null]);
		expect(lines[0].priceInCents).toBe(3000);
	});

	it("uses fresh prices and flags missing, unavailable and low-stock items", () => {
		const products = new Map([
			[
				1,
				product({
					id: 1,
					name: "Shirt",
					variants: [
						{ id: "m", label: "M", priceInCents: 3500, stock: 2 },
						{ id: "l", label: "L", priceInCents: 3500, stock: null },
					],
				}),
			],
		]);

		const lines = buildCartLines(items, products);
		expect(lines[0]).toMatchObject({ name: "Shirt", variantLabel: "M", priceInCents: 3500, maxQuantity: 2 });
		expect(lines[0].problem).toMatch(/Only 2 left/);
		expect(lines[1].problem).toMatch(/no longer exists/);

		const unavailable = new Map([[1, { ...products.get(1)!, available: false }]]);
		expect(buildCartLines([items[0]], unavailable)[0].problem).toMatch(/No longer on sale/);
	});

	it("lists the items that block each payment method", () => {
		const products = new Map([
			[
				1,
				product({
					id: 1,
					name: "Shirt",
					allowBankTransfer: false,
					variants: [{ id: "m", label: "M", priceInCents: 1, stock: null }],
				}),
			],
			[
				2,
				product({
					id: 2,
					name: "Ticket",
					allowStripe: false,
					variants: [{ id: "std", label: "Standard", priceInCents: 1, stock: null }],
				}),
			],
		]);
		const lines = buildCartLines(items, products);

		expect(linesBlockingMethod(lines, "bank")).toEqual(["Shirt"]);
		expect(linesBlockingMethod(lines, "stripe")).toEqual(["Ticket"]);
	});
});
