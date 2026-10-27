import type { RequiredDataFromCollectionSlug } from "payload";
import { buildHomeLayout, homeMeta } from "./homeLayout";

// Used as a fallback until a "home" page is created in the admin
export const homeStatic: RequiredDataFromCollectionSlug<"pages"> = {
	slug: "home",
	_status: "published",
	layout: buildHomeLayout(),
	meta: homeMeta,
	title: "Home",
};
