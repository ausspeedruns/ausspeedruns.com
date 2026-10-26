import type { GlobalAfterChangeHook } from "payload";

import { revalidateTag } from "next/cache.js";

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
	if (!context.disableRevalidate) {
		payload.logger.info(`Revalidating footer`);

		// "max" is stale-while-revalidate (next visitor still sees old data); expire: 0 refreshes immediately
		revalidateTag("global_footer", { expire: 0 });
	}

	return doc;
};
