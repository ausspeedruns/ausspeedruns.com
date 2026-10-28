import type { Metadata } from "next";

import type { Media, Page, Post, Config } from "../payload-types";

import { mergeOpenGraph } from "./mergeOpenGraph";
import { getServerSideURL } from "./getURL";

const getImageURL = (image?: Media | Config["db"]["defaultIDType"] | null) => {
	const serverUrl = getServerSideURL();

	let url = serverUrl + "/AusSpeedrunsOG.png";

	if (image && typeof image === "object" && "url" in image) {
		const imageUrl = image.sizes?.og?.url || image.url;

		// Media served from Azure Blob/CDN already has an absolute URL
		if (imageUrl) url = /^https?:\/\//.test(imageUrl) ? imageUrl : serverUrl + imageUrl;
	}

	return url;
};

export const generateMeta = async (args: { doc: Partial<Page> | Partial<Post> | null }): Promise<Metadata> => {
	const { doc } = args;

	const ogImage = getImageURL(doc?.meta?.image);

	const title = doc?.meta?.title ? doc?.meta?.title + " | AusSpeedruns" : "AusSpeedruns";

	return {
		description: doc?.meta?.description,
		openGraph: mergeOpenGraph({
			description: doc?.meta?.description || "",
			images: ogImage
				? [
						{
							url: ogImage,
						},
					]
				: undefined,
			title,
			url: Array.isArray(doc?.slug) ? doc?.slug.join("/") : "/",
		}),
		title,
	};
};
