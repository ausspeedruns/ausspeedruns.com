import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkMediaSections({
	mediaItems,
	img,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (mediaItems.length === 0) return [];

	return [
		{
			blockName: "Media Block: Image",
			demo: "A standalone Media block showing one uploaded image.",
			blockType: "mediaBlock",
			media: img(1),
		},
		{
			blockName: "Media Block: Another Image",
			demo: "The same block with a different image, to compare how other aspect ratios display.",
			blockType: "mediaBlock",
			media: img(6),
		},
	];
}
