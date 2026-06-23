import type { KitchenSinkLayoutBlock } from "./types";

export function buildKitchenSinkLiveStreamSection(): KitchenSinkLayoutBlock {
	return {
		blockName: "Live Stream Block",
		blockType: "liveStreamBlock",
		title: "Watch Live",
		twitchChannel: "ausspeedruns",
	};
}
