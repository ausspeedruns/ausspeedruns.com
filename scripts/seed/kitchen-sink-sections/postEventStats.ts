import { createLorem } from "../lorem.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkPostEventStatsSections({
	pastEventId,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	const lorem = createLorem(1400);
	const blocks: KitchenSinkLayoutBlock[] = [];

	if (pastEventId) {
		blocks.push(
			{
				blockName: "Post-Event Stats: From Event (stats + run list + schedule link)",
				demo: "Stat cards and the run list, calculated from a past event, plus a schedule link with a custom label.",
				blockType: "postEventStatsBlock",
				title: lorem.title(2),
				event: pastEventId,
				showStats: true,
				showRunList: true,
				scheduleUrl: "/events",
				scheduleLabel: lorem.title(2),
			},
			{
				blockName: "Post-Event Stats: From Event, Run List Only",
				demo: "Stat cards turned off, so only the run list shows.",
				blockType: "postEventStatsBlock",
				title: lorem.title(3),
				event: pastEventId,
				showStats: false,
				showRunList: true,
			},
		);
	}

	blocks.push({
		blockName: "Post-Event Stats: Manual Stats (no event)",
		demo: "No event selected: manually entered totals (runs, runners and duration) and an external schedule link.",
		blockType: "postEventStatsBlock",
		title: lorem.title(2),
		showStats: true,
		totalRuns: 42,
		uniqueRunners: 37,
		totalRunDuration: "48:15:00",
		scheduleUrl: "https://example.com/schedule",
		scheduleLabel: lorem.title(3),
	});

	return blocks;
}
