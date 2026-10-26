import { buildPlaceholder } from "./placeholder.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkRandomRunSections({
	pastEventId,
	vodRunIds,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (!pastEventId) return [buildPlaceholder("Random Run", "events", "randomRunBlock")];

	const blocks: KitchenSinkLayoutBlock[] = [
		{
			blockName: "Random Run: Any VOD from Event",
			demo: "Embeds a random YouTube VOD from the event's runs. It changes on every page load.",
			blockType: "randomRunBlock",
			specificEvent: pastEventId,
		},
	];

	if (vodRunIds.length > 1) {
		blocks.push({
			blockName: "Random Run: From Hand-picked Runs",
			demo: "Picks at random from a hand-picked set of runs only.",
			blockType: "randomRunBlock",
			specificEvent: pastEventId,
			specificRuns: vodRunIds.slice(0, 3),
		});
	}

	return blocks;
}
