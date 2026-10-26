import { createLorem } from "../lorem.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkSocialBannerSections({ img }: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	const lorem = createLorem(1800);

	return [
		{
			blockName: "Social Banner: YouTube with Background Image",
			demo: "Platform: YouTube (which sets the accent colour), with a background image.",
			blockType: "socialBannerBlock",
			heading: lorem.title(3),
			text: lorem.sentence(),
			buttonLabel: lorem.title(2),
			url: "https://www.youtube.com/@AusSpeedruns",
			platform: "youtube",
			backgroundImage: img(1),
		},
		{
			blockName: "Social Banner: Twitch, No Background Image",
			demo: "Platform: Twitch, with no background image.",
			blockType: "socialBannerBlock",
			heading: lorem.title(2),
			text: lorem.sentence(),
			buttonLabel: lorem.title(2),
			url: "https://twitch.tv/ausspeedruns",
			platform: "twitch",
		},
		{
			blockName: "Social Banner: Other, Heading Only",
			demo: "Platform: Other, with only a heading and button, plus a background image.",
			blockType: "socialBannerBlock",
			heading: lorem.title(4),
			buttonLabel: lorem.title(1),
			url: "https://example.com",
			platform: "other",
			backgroundImage: img(3),
		},
	];
}
