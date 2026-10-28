import { timingSafeEqual } from "node:crypto";
import type { PayloadRequest } from "payload";

import { resolveUserRoles } from "./helpers.ts";

function hasCronSecret(req: PayloadRequest): boolean {
	const secret = process.env.CRON_SECRET;
	if (!secret) return false;

	const header = Buffer.from(req.headers.get("authorization") ?? "");
	const expected = Buffer.from(`Bearer ${secret}`);
	return header.length === expected.length && timingSafeEqual(header, expected);
}

/** `/api/payload-jobs/run` is limited to admins, content managers and external schedulers sending `CRON_SECRET`. */
export async function canRunJobs({ req }: { req: PayloadRequest }): Promise<boolean> {
	if (hasCronSecret(req)) return true;
	if (!req.user) return false;

	const roles = await resolveUserRoles(req);
	return roles.some((role) => Boolean(role.admin || role.canManageContent));
}
