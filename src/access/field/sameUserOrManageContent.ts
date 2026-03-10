import { resolveUserRoles } from "#access/helpers.ts";
import type { FieldAccess } from "payload";

/**
 * Field-level access: allows if the user can manage content, or if the document belongs to the requesting user.
 */
export const sameUserOrManageContent: FieldAccess = async ({ req: { user }, id }) => {
	if (!user) return false;

	const roles = await resolveUserRoles(user);
	if (roles.some((role) => role.canManageContent)) return true;

	return user.id === id;
};
