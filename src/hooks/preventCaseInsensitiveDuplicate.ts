import { APIError, type CollectionBeforeValidateHook } from "payload";

import { findCaseInsensitiveMatches } from "#utilities/caseInsensitive.ts";

/**
 * Fields used in public URLs are looked up case-insensitively, so prevent values that only differ by case.
 * The Keystone migration contains a few historical collisions, so it can opt out via `req.context.isMigration`.
 */
export function preventCaseInsensitiveDuplicate(field: string, message: string): CollectionBeforeValidateHook {
	return async ({ collection, data, req, originalDoc }) => {
		const value = data?.[field];
		if (req.context?.isMigration || typeof value !== "string" || value === originalDoc?.[field]) return data;

		const matches = await findCaseInsensitiveMatches({
			payload: req.payload,
			collection: collection.slug,
			field,
			value,
			overrideAccess: true,
			req,
		});

		// resetPassword runs this hook with the full doc as `data` and no `originalDoc`
		const selfId = originalDoc?.id ?? data?.id;
		if (matches.some((match) => match.id !== selfId)) {
			throw new APIError(message, 400, undefined, true);
		}

		return data;
	};
}
