import type { Access } from "payload";

import { resolveRelation } from "#/utilities/resolveRelation";

export const manageUsers: Access = async ({ req: { user } }) => {
	if (!user) return false;

	if (!user.roles || user.roles.length === 0) return false;

	const roles = await Promise.all(user.roles.map((role) => resolveRelation("roles", role)));

	return roles.some((role) => role.canManageUsers);
};
