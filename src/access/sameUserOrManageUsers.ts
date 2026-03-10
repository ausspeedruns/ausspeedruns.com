import type { Access } from "payload";

import { resolveRelation } from "#/utilities/resolveRelation";

export const sameUserOrManageUsers: Access = async ({ req: { user } }) => {
	if (!user) return false;

	if (user.roles && user.roles.length > 0) {
		const roles = await Promise.all(user.roles.map((role) => resolveRelation("roles", role)));

		if (roles.some((role) => role.canManageUsers)) {
			return true;
		}
	}

	return {
		id: { equals: user.id },
	};
};
