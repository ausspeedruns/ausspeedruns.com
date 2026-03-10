import type { Access } from "payload";

import { resolveUserRoles } from "./helpers.ts";

export const sameUserOrManageUsers: Access = async ({ req: { user } }) => {
	if (!user) return false;

	const roles = await resolveUserRoles(user);
	if (roles.some((role) => role.canManageUsers)) {
		return true;
	}

	return {
		id: { equals: user.id },
	};
};
