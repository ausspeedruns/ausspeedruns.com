import { createLorem } from "../lorem.ts";
import { buildPlaceholder } from "./placeholder.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkVodHighlightsSections({
	pastEventId,
	vodRunIds,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (!pastEventId) return [buildPlaceholder("VOD Highlights", "events", "vodHighlightsBlock")];

	const lorem = createLorem(1501);
	const blocks: KitchenSinkLayoutBlock[] = [
		{
			blockName: "VOD Highlights: Automatic (limit 6, playlist link)",
			demo: "Automatically shows up to 6 of the event's runs that have a YouTube VOD, with a 'view all' playlist link.",
			blockType: "vodHighlightsBlock",
			title: lorem.title(3),
			event: pastEventId,
			limit: 6,
			playlistUrl: "https://www.youtube.com/@AusSpeedruns",
		},
		{
			blockName: "VOD Highlights: Automatic (limit 3, no playlist link)",
			demo: "The same automatic selection, limited to 3 runs and without a playlist link.",
			blockType: "vodHighlightsBlock",
			title: lorem.title(2),
			event: pastEventId,
			limit: 3,
		},
	];

	if (vodRunIds.length > 0) {
		blocks.push({
			blockName: "VOD Highlights: Hand-picked Runs",
			demo: "Specific runs chosen by hand instead of the automatic selection.",
			blockType: "vodHighlightsBlock",
			title: lorem.title(2),
			event: pastEventId,
			specificRuns: vodRunIds.slice(-4),
			limit: 4,
		});
	}

	return blocks;
}
