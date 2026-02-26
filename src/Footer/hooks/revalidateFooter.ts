import type { GlobalAfterChangeHook } from "payload";

import { updateTag } from "next/cache.js";

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
	if (!context.disableRevalidate) {
		payload.logger.info(`Revalidating footer`);

		updateTag("global_footer");
	}

	return doc;
};
