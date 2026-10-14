import type { Access } from "payload";

import { isContentManager } from "./helpers.ts";

/**
 * Collection-level access: content managers get full access, other logged-in users
 * are restricted to documents where `ownerField` references themselves.
 */
export const ownDocOrManageContent =
	(ownerField: string): Access =>
	async ({ req }) => {
		if (!req.user) return false;

		if (await isContentManager(req)) {
			return true;
		}

		return {
			[ownerField]: { equals: req.user.id },
		};
	};
