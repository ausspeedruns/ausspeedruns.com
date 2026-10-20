// @vitest-environment node
import { createLocalReq, getPayload, type Payload, type PayloadRequest } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import config from "#/payload.config";
import type { Event, Order, Product, User } from "#/payload-types";
import { lookupTicket, referenceCandidates, savePickup } from "#/utilities/ticketPickup/server";

let payload: Payload;
let req: PayloadRequest;
let attendee: User;
let event: Event;
let oldEvent: Event;
const products: Record<string, Product> = {};
const orders: Record<string, Order> = {};
const roleIds: number[] = [];

const suffix = Date.now().toString(36).toUpperCase();

async function createProduct(key: string, type: "ticket" | "merchandise", labels: string[]) {
	products[key] = await payload.create({
		collection: "products",
		data: {
			name: `Pickup ${key} ${suffix}`,
			slug: `pickup-${key}-${suffix}`.toLowerCase(),
			type,
			variants: labels.map((label) => ({ label, priceInCents: 1000 })),
		},
	});
	return products[key];
}

async function createOrder(key: string, status: Order["status"], items: Order["items"]) {
	orders[key] = await payload.create({
		collection: "orders",
		draft: false,
		context: { skipStockAdjustment: true },
		data: {
			reference: `T-${key}${suffix}`,
			user: attendee.id,
			status,
			purchaseType: "stripe",
			items,
			totalInCents: 0,
		},
	});
	return orders[key];
}

describe("Ticket pickup", () => {
	beforeAll(async () => {
		payload = await getPayload({ config: await config });

		const role = await payload.create({
			collection: "roles",
			data: { name: `Pickup Desk ${suffix}`, canPickupTickets: true },
		});
		roleIds.push(role.id);
		const staff = await payload.create({
			collection: "users",
			disableVerificationEmail: true,
			data: {
				username: `pickup_staff_${suffix}`.toLowerCase(),
				email: `pickup_staff_${suffix}@example.com`.toLowerCase(),
				password: "password123",
				dateOfBirth: "1990-01-01T00:00:00.000Z",
				roles: [role.id],
			},
		});
		attendee = await payload.create({
			collection: "users",
			disableVerificationEmail: true,
			data: {
				username: `pickup_attendee_${suffix}`.toLowerCase(),
				name: "Pickup Attendee",
				email: `pickup_attendee_${suffix}@example.com`.toLowerCase(),
				password: "password123",
				dateOfBirth: "1990-01-01T00:00:00.000Z",
			},
		});
		req = await createLocalReq({ user: { ...staff, collection: "users" } as never }, payload);

		await createProduct("ticket", "ticket", ["Standard"]);
		await createProduct("shirt", "merchandise", ["Medium", "Large"]);
		await createProduct("oldShirt", "merchandise", ["Large"]);

		const eventData = (name: string, productIds: number[]) => ({
			name,
			shortName: name,
			timeSettings: {
				timezone: "Australia/Sydney",
				startTime: "2026-07-01T00:00:00.000Z",
				endTime: "2026-07-07T00:00:00.000Z",
			},
			products: productIds,
			_status: "published" as const,
		});
		event = await payload.create({
			collection: "events",
			data: eventData(`PICKUP${suffix}`, [products.ticket.id, products.shirt.id]) as never,
		});
		oldEvent = await payload.create({
			collection: "events",
			data: eventData(`PICKUPOLD${suffix}`, [products.oldShirt.id]) as never,
		});

		await createOrder("TIX", "completed", [{ product: products.ticket.id, variantLabel: "Standard", quantity: 2 }]);
		await createOrder("SHIRT", "completed", [
			{ product: products.shirt.id, variantLabel: "Medium", quantity: 1 },
			{ product: products.shirt.id, variantLabel: "Large", quantity: 2 },
		]);
		await createOrder("OLD", "completed", [{ product: products.oldShirt.id, variantLabel: "Large", quantity: 1 }]);
		await createOrder("DONE", "collected", [{ product: products.oldShirt.id, variantLabel: "Large", quantity: 1 }]);
		await createOrder("GONE", "cancelled", [{ product: products.shirt.id, variantLabel: "Large", quantity: 1 }]);
	});

	afterAll(async () => {
		for (const order of Object.values(orders)) await payload.delete({ collection: "orders", id: order.id });
		for (const doc of [event, oldEvent]) if (doc) await payload.delete({ collection: "events", id: doc.id });
		for (const product of Object.values(products)) await payload.delete({ collection: "products", id: product.id });
		await payload.delete({
			collection: "users",
			where: { username: { like: `pickup_%_${suffix}`.toLowerCase() } },
		});
		for (const id of roleIds) await payload.delete({ collection: "roles", id });
	});

	it("accepts IDs with or without a prefix", () => {
		expect(referenceCandidates(" abc 123 ")).toEqual(["ABC123", "T-ABC123", "ORD-ABC123"]);
		expect(referenceCandidates("ord-abc")).toEqual(["ORD-ABC"]);
	});

	it("finds the ticket plus every other uncollected order", async () => {
		const lookup = await lookupTicket(req, `tix${suffix}`.toLowerCase());

		expect(lookup.order.reference).toBe(`T-TIX${suffix}`);
		expect(lookup.user.username).toBe(attendee.username);
		expect(lookup.event?.id).toBe(event.id);
		expect(lookup.order.items[0]).toMatchObject({ productType: "ticket", quantity: 2, collectedQuantity: 0 });
		// Searched order first, then newest first; collected and cancelled orders are left out
		expect(lookup.orders.map((order) => order.id)).toEqual([orders.TIX.id, orders.OLD.id, orders.SHIRT.id]);
		expect(lookup.orders.every((order) => typeof order.createdAt === "string")).toBe(true);
	});

	it("marks items collected and updates order statuses", async () => {
		const lookup = await lookupTicket(req, `T-TIX${suffix}`);
		const ticket = lookup.order.items[0];
		const [medium, large] = lookup.orders.find((order) => order.id === orders.SHIRT.id)!.items;
		const shownOrderIds = lookup.orders.map((order) => order.id);
		const shirtItems = (result: typeof lookup) =>
			result.orders.find((order) => order.id === orders.SHIRT.id)?.items.map((item) => item.collectedQuantity);

		const afterPartial = await savePickup(req, {
			reference: lookup.order.reference,
			updates: [
				{ orderId: ticket.orderId, itemId: ticket.itemId, collectedQuantity: 2 },
				{ orderId: medium.orderId, itemId: medium.itemId, collectedQuantity: 1 },
				{ orderId: large.orderId, itemId: large.itemId, collectedQuantity: 1 },
			],
			notes: "Large shirt out of stock",
			shownOrderIds,
		});

		expect(afterPartial.order.status).toBe("collected");
		expect(afterPartial.order.notes).toBe("Large shirt out of stock");
		expect(shirtItems(afterPartial)).toEqual([1, 1]);
		expect((await payload.findByID({ collection: "orders", id: orders.SHIRT.id })).status).toBe("completed");

		const afterAll = await savePickup(req, {
			reference: lookup.order.reference,
			updates: [{ orderId: large.orderId, itemId: large.itemId, collectedQuantity: 5 }],
			shownOrderIds,
		});
		expect(shirtItems(afterAll)).toEqual([1, 2]);
		// Still shown after saving so the volunteer sees what they just ticked
		expect(afterAll.orders.map((order) => order.id)).toEqual(shownOrderIds);
		expect((await payload.findByID({ collection: "orders", id: orders.SHIRT.id })).status).toBe("collected");

		// A fresh search no longer shows the fully collected shirt order
		const fresh = await lookupTicket(req, `T-TIX${suffix}`);
		expect(fresh.orders.map((order) => order.id)).toEqual([orders.TIX.id, orders.OLD.id]);

		// Unticking reverts the order to paid-but-not-collected while keeping the other items collected
		const reverted = await savePickup(req, {
			reference: lookup.order.reference,
			updates: [{ orderId: medium.orderId, itemId: medium.itemId, collectedQuantity: 0 }],
			shownOrderIds,
		});
		expect(shirtItems(reverted)).toEqual([0, 2]);
		expect((await payload.findByID({ collection: "orders", id: orders.SHIRT.id })).status).toBe("completed");
	});

	it("rejects items that don't belong to the ticket", async () => {
		const gone = orders.GONE;
		await expect(
			savePickup(req, {
				reference: `T-TIX${suffix}`,
				updates: [{ orderId: gone.id, itemId: gone.items[0].id ?? "", collectedQuantity: 1 }],
			}),
		).rejects.toThrow(/doesn't belong/);
	});

	it("reports unknown tickets", async () => {
		await expect(lookupTicket(req, `NOPE${suffix}`)).rejects.toThrow(/No ticket found/);
	});
});
