import { createLorem } from "../lorem.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkSponsorGridSections({
	mediaItems,
	img,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (mediaItems.length === 0) return [];

	const lorem = createLorem(1900);

	return [
		{
			blockName: "Sponsor Grid: Many Linked Sponsors",
			demo: "Eight sponsor logos, each linking to the sponsor's website.",
			blockType: "sponsorGridBlock",
			title: lorem.title(3),
			sponsors: Array.from({ length: 8 }, (_, index) => ({
				name: lorem.title(2),
				logo: img(index),
				link: `https://example.com/${lorem.words(1)}`,
			})),
		},
		{
			blockName: "Sponsor Grid: Few Unlinked Sponsors",
			demo: "Two sponsor logos without links.",
			blockType: "sponsorGridBlock",
			title: lorem.title(2),
			sponsors: Array.from({ length: 2 }, (_, index) => ({
				name: lorem.title(1),
				logo: img(index + 4),
			})),
		},
	];
}
