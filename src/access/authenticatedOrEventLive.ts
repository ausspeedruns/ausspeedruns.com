import type { Role } from "#/payload-types";
import type { Access } from "payload";

export const authenticatedOrEventLive: Access = ({ req: { user } }) => {
	if (
		user?.roles?.some((role) => {
			if (typeof role === "number") {
				return false;
			}

			return (role as Role).canManageContent;
		})
	) {
		return true;
	}

	return {
		"settings.isPublished": {
			equals: true,
		},
	};
};
