import type { Access } from "payload";

import { isUserManager } from "./helpers.ts";

export const sameUserOrManageUsers: Access = async ({ req }) => {
	if (!req.user) return false;

	if (await isUserManager(req)) {
		return true;
	}

	return {
		id: { equals: req.user.id },
	};
};
