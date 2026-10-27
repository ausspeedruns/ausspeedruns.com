import type { Access, PayloadRequest, Where } from "payload";

import { isAdminUser, isUserManager } from "./helpers.ts";

/** IDs of every user holding an admin role. */
async function findAdminUserIds(req: PayloadRequest): Promise<string[]> {
	const adminRoles = await req.payload.find({
		collection: "roles",
		where: { admin: { equals: true } },
		depth: 0,
		pagination: false,
		overrideAccess: true,
		req,
	});
	if (adminRoles.docs.length === 0) return [];

	const admins = await req.payload.find({
		collection: "users",
		where: { roles: { in: adminRoles.docs.map((role) => role.id) } },
		depth: 0,
		pagination: false,
		overrideAccess: true,
		select: { username: true },
		joins: false,
		req,
	});
	return admins.docs.map((user) => String(user.id));
}

/**
 * Admins can change anyone. User managers can change anyone except admins, so they
 * can't take over an admin account by resetting its credentials.
 */
const userManagerTargets = async (req: PayloadRequest): Promise<true | Where | false> => {
	if (await isAdminUser(req)) return true;
	if (!(await isUserManager(req))) return false;

	const adminIds = await findAdminUserIds(req);
	if (adminIds.length === 0) return true;
	return { id: { not_in: adminIds } };
};

export const manageNonAdminUsersOrSelf: Access = async ({ req }) => {
	if (!req.user) return false;

	const self: Where = { id: { equals: req.user.id } };
	const targets = await userManagerTargets(req);
	if (targets === true) return true;
	if (targets === false) return self;
	return { or: [self, targets] };
};

export const manageNonAdminUsers: Access = async ({ req }) => {
	if (!req.user) return false;
	return userManagerTargets(req);
};
