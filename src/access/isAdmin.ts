import type { Access } from "payload";

import { resolveUserRoles } from "./helpers.ts";

export const isAdmin: Access = async ({ req: { user } }) => {
	if (!user) return false;
	const roles = await resolveUserRoles(user);
	return roles.some((role) => role.admin);
};
