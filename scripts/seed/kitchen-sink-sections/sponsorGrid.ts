import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types";

export function buildKitchenSinkSponsorGridSection({
	mediaItems,
	img,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock {
	return {
		blockName: "Sponsor Grid Block",
		blockType: "sponsorGridBlock",
		title: "Our Amazing Sponsors",
		sponsors:
			mediaItems.length >= 4
				? [
						{ name: "Sponsor Alpha", logo: img(0), link: "https://example.com/alpha" },
						{ name: "Sponsor Beta", logo: img(1), link: "https://example.com/beta" },
						{ name: "Sponsor Gamma", logo: img(2), link: "https://example.com/gamma" },
						{ name: "Sponsor Delta", logo: img(3), link: "https://example.com/delta" },
					]
				: [{ name: "Example Sponsor", logo: img(0), link: "https://example.com" }],
	};
}
