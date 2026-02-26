import type { CollectionAfterChangeHook } from "payload";

import { updateTag } from "next/cache.js";

export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, req: { payload } }) => {
	payload.logger.info(`Revalidating redirects`);

	updateTag("redirects");

	return doc;
};
