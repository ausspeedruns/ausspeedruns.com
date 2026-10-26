import type { GlobalAfterChangeHook } from "payload";

import { revalidateTag } from "next/cache.js";

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
	if (!context.disableRevalidate) {
		payload.logger.info(`Revalidating header`);

		// "max" is stale-while-revalidate (next visitor still sees old data); expire: 0 refreshes immediately
		revalidateTag("global_header", { expire: 0 });
	}

	return doc;
};
