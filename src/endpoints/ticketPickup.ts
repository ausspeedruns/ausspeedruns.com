import { commitTransaction, initTransaction, killTransaction, type Endpoint, type PayloadRequest } from "payload";
import { z } from "zod";

import { canUseTicketPickup } from "#access/helpers.ts";
import { lookupTicket, PickupError, savePickup } from "#utilities/ticketPickup/server.ts";

const saveSchema = z.object({
	reference: z.string().min(1).max(64),
	updates: z
		.array(
			z.object({
				orderId: z.number().int(),
				itemId: z.string().min(1),
				collectedQuantity: z.number().int().min(0),
			}),
		)
		.max(200),
	notes: z.string().max(10_000).optional(),
	shownOrderIds: z.array(z.number().int()).max(200).optional(),
});

function handler(fn: (req: PayloadRequest) => Promise<Response>, { transaction = false } = {}): Endpoint["handler"] {
	return async (req) => {
		if (!(await canUseTicketPickup(req))) {
			return Response.json({ error: "You don't have access to the ticket pickup desk." }, { status: 403 });
		}

		const shouldCommit = transaction ? await initTransaction(req) : false;
		try {
			const response = await fn(req);
			if (shouldCommit) await commitTransaction(req);
			return response;
		} catch (error) {
			if (transaction) await killTransaction(req);
			if (error instanceof PickupError) {
				return Response.json({ error: error.message }, { status: error.status });
			}
			req.payload.logger.error({ err: error, msg: "Ticket pickup request failed" });
			return Response.json({ error: "Something went wrong. Check the server logs." }, { status: 500 });
		}
	};
}

/** Mounted under `/api/orders/pickup`. */
export const ticketPickupEndpoints: Endpoint[] = [
	{
		path: "/pickup",
		method: "get",
		handler: handler(async (req) =>
			Response.json(await lookupTicket(req, String(req.searchParams.get("reference") ?? ""))),
		),
	},
	{
		path: "/pickup",
		method: "post",
		handler: handler(
			async (req) => {
				let body: unknown;
				try {
					body = req.json ? await req.json() : {};
				} catch {
					throw new PickupError("Invalid JSON body.");
				}
				const parsed = saveSchema.safeParse(body);
				if (!parsed.success) throw new PickupError("Invalid request.");
				return Response.json(await savePickup(req, parsed.data));
			},
			{ transaction: true },
		),
	},
];
