import type { Access } from "payload";

import { isContentManager } from "./helpers.ts";

export const manageContentOrPublished: Access = async ({ req }) => {
	if (await isContentManager(req)) {
		return true;
	}

	return {
		_status: {
			equals: "published",
		},
	};
};
