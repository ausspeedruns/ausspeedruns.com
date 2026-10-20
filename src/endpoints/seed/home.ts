import type { RequiredDataFromCollectionSlug } from "payload";
import type { Media } from "#/payload-types";
import { buildHomeLayout, homeMeta } from "./home-layout";

type HomeArgs = {
	metaImage: Media;
};

export const home: (args: HomeArgs) => RequiredDataFromCollectionSlug<"pages"> = ({ metaImage }) => {
	return {
		slug: "home",
		_status: "published",
		layout: buildHomeLayout(),
		meta: { ...homeMeta, image: metaImage.id },
		title: "Home",
	};
};