import type { Order, Product } from "#/payload-types";

export type PickupOrderStatus = Order["status"];

export interface PickupItem {
	orderId: number;
	itemId: string;
	productName: string;
	productType: Product["type"] | null;
	variantLabel: string;
	quantity: number;
	/** Effective number already handed over (an order with status "collected" counts as fully collected). */
	collectedQuantity: number;
}

export interface PickupOrder {
	id: number;
	reference: string;
	status: PickupOrderStatus;
	purchaseType: Order["purchaseType"];
	createdAt: string;
	/** The order whose ID was typed in. */
	isSearched: boolean;
	items: PickupItem[];
}

export interface PickupLookup {
	/** The order whose ID was typed in. */
	order: PickupOrder & { notes: string };
	user: {
		id: string;
		username: string;
		name: string | null;
	};
	event: { id: number; name: string; shortName: string } | null;
	/** The searched order first, then the person's other uncollected (non-cancelled) orders, newest first. */
	orders: PickupOrder[];
}

export interface PickupItemUpdate {
	orderId: number;
	itemId: string;
	collectedQuantity: number;
}

export interface PickupSaveRequest {
	reference: string;
	updates: PickupItemUpdate[];
	notes?: string;
	/** Orders currently on screen, kept in the response even if they're now fully collected. */
	shownOrderIds?: number[];
}
