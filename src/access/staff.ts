import type { AccessArgs } from "payload";

import type { User } from "#/payload-types";
import { isStaffRole, resolveUserRoles } from "./helpers.ts";

type isStaff = (args: AccessArgs<User>) => Promise<boolean>;

export const staff: isStaff = async ({ req }) => {
	if (!req.user) return false;
	const roles = await resolveUserRoles(req);
	return roles.some(isStaffRole);
};
