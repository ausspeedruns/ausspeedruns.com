import type { GlobalAfterChangeHook } from "payload";

import { updateTag } from "next/cache.js";

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
	if (!context.disableRevalidate) {
		payload.logger.info(`Revalidating header`);

		updateTag("global_header");
	}

	return doc;
};
