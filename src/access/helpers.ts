import type { PayloadRequest } from "payload";

import type { Role, User } from "#/payload-types";

type RoleFlag = "admin" | "canManageContent" | "canManageUsers";

const ROLES_CONTEXT_KEY = "__resolvedUserRoles";

/**
 * Resolves all roles for the request's user, handling both populated Role objects and numeric IDs.
 * The result is cached on `req.context` so repeated access checks in one request only hit the DB once.
 */
export async function resolveUserRoles(req: PayloadRequest, user: User | null | undefined = req.user as User): Promise<Role[]> {
	if (!user?.roles || user.roles.length === 0) return [];

	const isRequestUser = user === req.user;
	if (isRequestUser && Array.isArray(req.context?.[ROLES_CONTEXT_KEY])) {
		return req.context[ROLES_CONTEXT_KEY] as Role[];
	}

	const populated = user.roles.filter((role): role is Role => typeof role === "object" && role !== null);
	const ids = user.roles.filter((role): role is number => typeof role === "number");

	let fetched: Role[] = [];
	if (ids.length > 0) {
		const result = await req.payload.find({
			collection: "roles",
			where: { id: { in: ids } },
			depth: 0,
			limit: ids.length,
			pagination: false,
			overrideAccess: true,
			req,
		});
		fetched = result.docs;
	}

	const roles = [...populated, ...fetched];
	if (isRequestUser && req.context) {
		req.context[ROLES_CONTEXT_KEY] = roles;
	}

	return roles;
}

export function isStaffRole(role: Role): boolean {
	return Boolean(role.admin || role.canManageContent || role.canManageUsers);
}

export async function userHasRoleFlag(req: PayloadRequest, flag: RoleFlag): Promise<boolean> {
	if (!req.user) return false;
	const roles = await resolveUserRoles(req);
	return roles.some((role) => Boolean(role[flag]));
}

export const isContentManager = (req: PayloadRequest) => userHasRoleFlag(req, "canManageContent");
export const isUserManager = (req: PayloadRequest) => userHasRoleFlag(req, "canManageUsers");
export const isAdminUser = (req: PayloadRequest) => userHasRoleFlag(req, "admin");

/** Extracts an ID from a relationship value that may be populated or not. */
export function relationId<T extends string | number>(value: T | { id: T } | null | undefined): T | null {
	if (value === null || value === undefined) return null;
	if (typeof value === "object") return value.id;
	return value;
}
