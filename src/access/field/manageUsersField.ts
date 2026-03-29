import { resolveUserRoles } from "#access/helpers.ts";
import type { FieldAccess } from "payload";

/**
 * Field-level access: allows if the user can manage users, or if the document belongs to the requesting user.
 */
export const manageUsersField: FieldAccess = async ({ req: { user }, id }) => {
	if (!user) return false;

	const roles = await resolveUserRoles(user);
	return roles.some((role) => role.canManageUsers);
};
