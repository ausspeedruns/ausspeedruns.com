import { getPayload } from "payload";
import type { PostgresAdapter } from "@payloadcms/db-postgres";

import configPromise from "#payload-config";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };

/** Health check for Docker and the reverse proxy: the server is up and can reach Postgres. */
export async function GET(): Promise<Response> {
	try {
		const payload = await getPayload({ config: configPromise });
		await (payload.db as unknown as PostgresAdapter).pool.query("SELECT 1");

		return Response.json({ status: "ok" }, { headers });
	} catch (error) {
		console.error("Health check failed", error);
		return Response.json({ status: "error" }, { status: 503, headers });
	}
}
