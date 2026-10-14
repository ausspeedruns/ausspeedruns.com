import type { Access } from "payload";

import { isUserManager } from "./helpers.ts";

/**
 * Collection-level access: user managers get full access, other logged-in users
 * are restricted to documents where `ownerField` references themselves.
 */
export const ownDocOrManageUsers =
	(ownerField: string): Access =>
	async ({ req }) => {
		if (!req.user) return false;

		if (await isUserManager(req)) {
			return true;
		}

		return {
			[ownerField]: { equals: req.user.id },
		};
	};
