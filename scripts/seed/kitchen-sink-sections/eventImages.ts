import { createLorem } from "../lorem.ts";
import { paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

const externalImage = (seed: string) => `https://picsum.photos/seed/${seed}/1600/900`;

export function buildKitchenSinkEventImagesSections({
	mediaItems,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	const lorem = createLorem(900);

	const uploads = mediaItems.slice(0, 5).map((media) => ({
		sourceType: "upload",
		uploadMedia: media.id,
		caption: lorem.sentence(6),
	}));

	const blocks: KitchenSinkLayoutBlock[] = [];

	if (uploads.length > 0) {
		blocks.push({
			blockName: "Event Images: Uploaded, Captions, Gallery Link",
			demo: "Uploaded images with captions, a title, intro text and a gallery button with a custom label.",
			blockType: "eventImagesBlock",
			title: lorem.title(3),
			richText: richText(paragraphNode([textNode(lorem.paragraph(2))])),
			images: uploads,
			galleryUrl: "https://example.com/gallery",
			galleryLabel: lorem.title(4),
		});
	}

	blocks.push(
		{
			blockName: "Event Images: Mixed Uploaded + External, No Captions on Uploads",
			demo: "Uploaded images mixed with images from external URLs (for example an offsite photo album). Only some images have captions.",
			blockType: "eventImagesBlock",
			title: lorem.title(2),
			images: [
				...uploads.slice(0, 2).map(({ caption: _caption, ...image }) => image),
				{ sourceType: "external", externalUrl: externalImage("lorem"), caption: lorem.sentence(5) },
				{ sourceType: "external", externalUrl: externalImage("ipsum") },
			],
			galleryUrl: "https://example.com/gallery",
			galleryLabel: lorem.title(2),
		},
		{
			blockName: "Event Images: Single External Image, No Title or Text",
			demo: "One external image with a caption, with no title or intro text.",
			blockType: "eventImagesBlock",
			images: [{ sourceType: "external", externalUrl: externalImage("dolor"), caption: lorem.sentence(4) }],
		},
		{
			blockName: "Event Images: Gallery Link Only (no images)",
			demo: "No images, just a title, some text and the gallery button.",
			blockType: "eventImagesBlock",
			title: lorem.title(3),
			richText: richText(paragraphNode([textNode(lorem.sentence())])),
			images: [],
			galleryUrl: "https://example.com/gallery",
			galleryLabel: lorem.title(3),
		},
	);

	return blocks;
}
