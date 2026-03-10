import type { AccessArgs } from "payload";

import type { User } from "#/payload-types";
import { resolveRelation } from "#/utilities/resolveRelation";

type isStaff = (args: AccessArgs<User>) => Promise<boolean>;

export const staff: isStaff = async ({ req: { user } }) => {
	if (!user) return false;
	if (!user.roles || user.roles.length === 0) return false;

	const roles = await Promise.all(user.roles.map((role) => resolveRelation("roles", role)));

	return roles.some((role) => role.admin || role.canManageContent || role.canManageUsers);
};
