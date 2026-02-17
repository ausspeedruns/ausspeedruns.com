import type { Role } from "@/payload-types";
import type { Access, CollectionSlug, DataFromCollectionSlug, Payload } from "payload";

export const authenticatedOrEventLive: Access = ({ req: { user } }) => {
	if (user?.roles?.some((role) => {
		if (typeof role === "number") {
			return false;
		}

		return (role as Role).canManageContent;
	})) {
		return true;
	}

	return {
		"settings.isPublished": {
			equals: true,
		},
	};
};

async function resolveRelation<T extends CollectionSlug>(
	payload: Payload,
	collection: T,
	value: number | DataFromCollectionSlug<T>,
): Promise<DataFromCollectionSlug<T>> {
	if (typeof value === "number") {
		return payload.findByID({ collection, id: value });
	}

	return value;
}
