import type { Role, User } from "#/payload-types";
import { resolveRelation } from "#/utilities/resolveRelation.ts";

/**
 * Resolves all roles for a user, handling both populated Role objects and numeric IDs.
 */
export async function resolveUserRoles(user: User): Promise<Role[]> {
	if (!user.roles || user.roles.length === 0) return [];
	return Promise.all(user.roles.map((role) => resolveRelation("roles", role)));
}

export function isStaffRole(role: Role): boolean {
	return Boolean(role.admin || role.canManageContent || role.canManageUsers);
}
