import type { AccessArgs } from "payload";

import type { User } from "#/payload-types";
import { isStaffRole, resolveUserRoles } from "./helpers.ts";

type isStaff = (args: AccessArgs<User>) => Promise<boolean>;

export const staff: isStaff = async ({ req: { user } }) => {
	if (!user) return false;
	const roles = await resolveUserRoles(user);
	return roles.some(isStaffRole);
};
