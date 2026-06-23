import { headingNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types";

export function buildKitchenSinkCarouselSection({ mediaItems }: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (mediaItems.length < 3) {
		return [];
	}

	return [
		{
			blockName: "Image Carousel",
			blockType: "imageCarousel",
			richText: richText(
				headingNode("Image Carousel", "h3"),
				paragraphNode([
					textNode(
						"The Image Carousel block displays a rotating gallery of images with optional introductory rich text content above it.",
					),
				]),
			),
			images: mediaItems.slice(0, 5).map((media) => ({ media: media.id })),
		},
	];
}