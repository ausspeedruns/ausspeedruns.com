import { createLorem } from "../lorem.ts";
import { headingNode, listNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkCarouselSections({ mediaItems }: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (mediaItems.length === 0) return [];

	const lorem = createLorem(800);

	return [
		{
			blockName: "Image Carousel: With Intro, Many Images",
			demo: "Intro rich text (heading, paragraph and list) above a carousel of up to 8 images.",
			blockType: "imageCarousel",
			richText: richText(
				headingNode(lorem.title(3), "h2"),
				paragraphNode([textNode(lorem.paragraph(2))]),
				listNode("bullet", lorem.items(3)),
			),
			images: mediaItems.slice(0, 8).map((media) => ({ media: media.id })),
		},
		{
			blockName: "Image Carousel: No Intro, Few Images",
			demo: "Just two images and no intro text.",
			blockType: "imageCarousel",
			images: mediaItems.slice(-2).map((media) => ({ media: media.id })),
		},
	];
}
