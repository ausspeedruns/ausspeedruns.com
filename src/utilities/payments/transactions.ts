import type { PostgresAdapter } from "@payloadcms/db-postgres";
import { inArray } from "@payloadcms/db-postgres/drizzle";
import {
	commitTransaction,
	createLocalReq,
	initTransaction,
	killTransaction,
	type Payload,
	type PayloadRequest,
} from "payload";

/** Runs `fn` inside a database transaction, committing on success and rolling back on error. */
export async function withTransaction<T>(payload: Payload, fn: (req: PayloadRequest) => Promise<T>): Promise<T> {
	const req = await createLocalReq({}, payload);
	const ownsTransaction = await initTransaction(req);
	try {
		const result = await fn(req);
		if (ownsTransaction) await commitTransaction(req);
		return result;
	} catch (error) {
		if (ownsTransaction) await killTransaction(req);
		throw error;
	}
}

/**
 * Takes `SELECT … FOR UPDATE` row locks on the given documents for the rest of the request's transaction,
 * so concurrent read-modify-write cycles (stock, order status) on the same rows are serialised.
 * Take locks before writing rows that reference them (e.g. orders → products) to avoid deadlocks, and
 * IDs are locked in ascending order for the same reason. No-op outside a transaction.
 */
export async function lockRows(req: PayloadRequest, collection: "orders" | "products", ids: number[]): Promise<void> {
	const sorted = [...new Set(ids)].sort((a, b) => a - b);
	if (sorted.length === 0 || !req.transactionID) return;

	const adapter = req.payload.db as unknown as PostgresAdapter;
	const db = adapter.sessions?.[await req.transactionID]?.db;
	const table = adapter.tables?.[collection];
	if (!db || !table) return;

	await db.select({ id: table.id }).from(table).where(inArray(table.id, sorted)).orderBy(table.id).for("update");
}
