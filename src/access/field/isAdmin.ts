import { resolveUserRoles } from "#access/helpers.ts";
import type { FieldAccess } from "payload";

/**
 * Field-level access: allows if the user is an admin.
 */
export const isAdminField: FieldAccess = async ({ req: { user } }) => {
	if (!user) return false;

	const roles = await resolveUserRoles(user);
	return roles.some((role) => role.admin);
};
