import type { PayloadRequest } from "payload";

import type { Order, Product } from "#/payload-types";
import { relationId } from "#access/helpers.ts";
import type { PickupItem, PickupLookup, PickupOrder, PickupSaveRequest } from "./types.ts";

type OrderItem = NonNullable<Order["items"]>[number];

const PAID_STATUSES: Order["status"][] = ["completed", "collected"];

export class PickupError extends Error {
	status: number;

	constructor(message: string, status = 400) {
		super(message);
		this.status = status;
	}
}

/** Volunteers may type the ID with or without its prefix (legacy tickets use `T-`, new orders use `ORD-`). */
export function referenceCandidates(input: string): string[] {
	const cleaned = input.toUpperCase().replace(/\s+/g, "");
	if (!cleaned) return [];

	const candidates = new Set([cleaned]);
	if (!cleaned.startsWith("T-") && !cleaned.startsWith("ORD-")) {
		candidates.add(`T-${cleaned}`);
		candidates.add(`ORD-${cleaned}`);
	}
	return [...candidates];
}

export function effectiveCollected(
	order: Pick<Order, "status">,
	item: Pick<OrderItem, "quantity" | "collectedQuantity">,
) {
	if (order.status === "collected") return item.quantity;
	return Math.min(Math.max(item.collectedQuantity ?? 0, 0), item.quantity);
}

function isFullyCollected(order: Order) {
	return (order.items ?? []).every((item) => effectiveCollected(order, item) >= item.quantity);
}

function toPickupOrder(order: Order, products: Map<number, Product>, isSearched: boolean): PickupOrder {
	return {
		id: order.id,
		reference: order.reference ?? "",
		status: order.status,
		purchaseType: order.purchaseType,
		createdAt: order.createdAt,
		isSearched,
		items: (order.items ?? []).map((item): PickupItem => {
			const product = products.get(relationId(item.product) as number);
			return {
				orderId: order.id,
				itemId: item.id ?? "",
				productName: item.productName || product?.name || "Unknown product",
				productType: product?.type ?? null,
				variantLabel: item.variantLabel ?? "",
				quantity: item.quantity,
				collectedQuantity: effectiveCollected(order, item),
			};
		}),
	};
}

async function findOrderByReference(req: PayloadRequest, input: string): Promise<Order> {
	const candidates = referenceCandidates(input);
	if (candidates.length === 0) throw new PickupError("Enter a ticket ID.");

	const result = await req.payload.find({
		collection: "orders",
		where: { reference: { in: candidates } },
		depth: 0,
		limit: candidates.length,
		overrideAccess: true,
		req,
	});

	// Prefer exactly what was typed over a prefixed guess
	const order = candidates.map((ref) => result.docs.find((doc) => doc.reference === ref)).find(Boolean);
	if (!order) throw new PickupError(`No ticket found for "${input.trim()}".`, 404);
	return order;
}

async function findProducts(req: PayloadRequest, orders: Order[]) {
	const ids = [
		...new Set(
			orders
				.flatMap((order) => (order.items ?? []).map((item) => relationId(item.product)))
				.filter((id) => id !== null),
		),
	];
	if (ids.length === 0) return new Map<number, Product>();

	const result = await req.payload.find({
		collection: "products",
		where: { id: { in: ids } },
		depth: 0,
		pagination: false,
		overrideAccess: true,
		req,
	});
	return new Map(result.docs.map((product) => [product.id, product]));
}

/** Finds the event selling this order's ticket, purely so the desk can show which event it's for. */
async function findEventForOrder(req: PayloadRequest, order: Order, products: Map<number, Product>) {
	const ticketIds = (order.items ?? [])
		.map((item) => relationId(item.product))
		.filter((id): id is number => id !== null && products.get(id)?.type === "ticket");
	if (ticketIds.length === 0) return null;

	const result = await req.payload.find({
		collection: "events",
		where: { products: { in: ticketIds } },
		depth: 0,
		limit: 1,
		sort: "-timeSettings.startTime",
		overrideAccess: true,
		req,
	});
	return result.docs[0] ?? null;
}

/** `keepOrderIds` keeps orders on screen after saving even though they're now fully collected. */
export async function lookupTicket(
	req: PayloadRequest,
	input: string,
	keepOrderIds: number[] = [],
): Promise<PickupLookup> {
	const order = await findOrderByReference(req, input);
	const userId = relationId(order.user);

	// Tickets and merch are often separate orders, so show everything this person still has to pick up.
	// Old orders that were never marked collected show up too; the desk shows their date so volunteers can judge.
	const otherOrders = userId
		? (
				await req.payload.find({
					collection: "orders",
					where: {
						and: [
							{ user: { equals: userId } },
							{ id: { not_equals: order.id } },
							{
								or: [
									{ status: { in: ["pending", "completed"] } },
									...(keepOrderIds.length > 0
										? [{ and: [{ id: { in: keepOrderIds } }, { status: { equals: "collected" } }] }]
										: []),
								],
							},
						],
					},
					depth: 0,
					pagination: false,
					sort: "-createdAt",
					overrideAccess: true,
					req,
				})
			).docs.filter((candidate) => keepOrderIds.includes(candidate.id) || !isFullyCollected(candidate))
		: [];

	const products = await findProducts(req, [order, ...otherOrders]);
	const event = await findEventForOrder(req, order, products);
	const user = userId
		? await req.payload
				.findByID({ collection: "users", id: userId, depth: 0, overrideAccess: true, req })
				.catch(() => null)
		: null;

	const searched = toPickupOrder(order, products, true);

	return {
		order: { ...searched, notes: order.notes ?? "" },
		user: {
			id: user?.id ?? String(userId ?? ""),
			username: user?.username ?? "Unknown user",
			name: user?.name ?? null,
		},
		event: event ? { id: event.id, name: event.name, shortName: event.shortName } : null,
		orders: [searched, ...otherOrders.map((other) => toPickupOrder(other, products, false))],
	};
}

/**
 * Saves pickup progress. Updates are limited to orders shown for the looked-up ticket and to paid orders.
 * Each order's status is set to "collected" once every item has been handed over, and back to
 * "completed" if something gets unticked.
 */
export async function savePickup(req: PayloadRequest, body: PickupSaveRequest): Promise<PickupLookup> {
	const shownOrderIds = [
		...new Set([...(body.shownOrderIds ?? []), ...body.updates.map((update) => update.orderId)]),
	];
	const lookup = await lookupTicket(req, body.reference, shownOrderIds);
	const visibleOrders = new Map(lookup.orders.map((order) => [order.id, order]));

	const updatesByOrder = new Map<number, Map<string, number>>();
	for (const update of body.updates) {
		const order = visibleOrders.get(update.orderId);
		const item = order?.items.find((candidate) => candidate.itemId === update.itemId);
		if (!order || !item) throw new PickupError("One of the items doesn't belong to this ticket. Search again.");
		if (!PAID_STATUSES.includes(order.status)) {
			throw new PickupError(`Order ${order.reference} hasn't been paid, so it can't be handed out.`);
		}
		const changes = updatesByOrder.get(order.id) ?? new Map<string, number>();
		changes.set(item.itemId, Math.min(Math.max(Math.round(update.collectedQuantity), 0), item.quantity));
		updatesByOrder.set(order.id, changes);
	}

	const notesChanged = body.notes !== undefined && body.notes !== lookup.order.notes;
	if (notesChanged && !updatesByOrder.has(lookup.order.id)) updatesByOrder.set(lookup.order.id, new Map());

	for (const [orderId, changes] of updatesByOrder) {
		const order = await req.payload.findByID({
			collection: "orders",
			id: orderId,
			depth: 0,
			overrideAccess: true,
			req,
		});
		const data: Partial<Order> = {};

		if (changes.size > 0) {
			const items = (order.items ?? []).map((item) => ({
				...item,
				collectedQuantity: changes.get(item.id ?? "") ?? effectiveCollected(order, item),
			}));
			data.items = items;
			if (PAID_STATUSES.includes(order.status)) {
				data.status = items.every((item) => item.collectedQuantity >= item.quantity)
					? "collected"
					: "completed";
			}
		}
		if (notesChanged && orderId === lookup.order.id) data.notes = body.notes;

		await req.payload.update({ collection: "orders", id: orderId, data, depth: 0, overrideAccess: true, req });
	}

	return lookupTicket(req, body.reference, shownOrderIds);
}
