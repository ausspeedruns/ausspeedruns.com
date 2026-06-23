import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types";

export function buildKitchenSinkMediaSection({ mediaItems, img }: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (mediaItems.length === 0) {
		return [];
	}

	return [
		{
			blockName: "Media Block",
			blockType: "mediaBlock",
			media: img(1),
		},
	];
}
