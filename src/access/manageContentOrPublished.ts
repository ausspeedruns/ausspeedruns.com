import type { Access } from "payload";
import { resolveUserRoles } from "./helpers.ts";

export const manageContentOrPublished: Access = async ({ req: { user } }) => {
	if (user) {
		const roles = await resolveUserRoles(user);
		if (roles.some((role) => role.canManageContent)) {
			return true;
		}
	}

	return {
		_status: {
			equals: "published",
		},
	};
};
