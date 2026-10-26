import { getPayload } from "payload";

import configPromise from "#payload-config";
import type { SessionInfo } from "#stores/useSessionStore.ts";

export const dynamic = "force-dynamic";

/** Minimal session info for the site header, kept out of the root layout so pages can be static. */
export async function GET(request: Request): Promise<Response> {
	const payload = await getPayload({ config: configPromise });
	const { user, permissions } = await payload.auth({ headers: request.headers });

	const body: SessionInfo = user
		? { user: { username: user.username }, canAccessAdmin: Boolean(permissions.canAccessAdmin) }
		: { user: null, canAccessAdmin: false };

	return Response.json(body, { headers: { "Cache-Control": "private, no-store" } });
}
