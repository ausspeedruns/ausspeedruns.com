import type { Config } from "#/payload-types";

import configPromise from "#payload-config";
import { getPayload } from "payload";

type CollectionSlug = keyof Config["collections"];
type CollectionType<T extends CollectionSlug> = Config["collections"][T];

/**
 * Resolves a Payload relation field that may be either a populated object or just an ID.
 * If it's already populated, returns it directly. If it's a number, looks it up in the database.
 */
export async function resolveRelation<T extends CollectionSlug>(
	collection: T,
	value: number | CollectionType<T>,
): Promise<CollectionType<T>> {
	if (typeof value !== "number") {
		return value;
	}

	const payload = await getPayload({ config: configPromise });
	return payload.findByID({ collection, id: value });
}
