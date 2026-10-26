import { createLorem } from "../lorem.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

export function buildKitchenSinkCountdownSections({ now }: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	const lorem = createLorem(2100);

	return [
		{
			blockName: "Countdown: Future Date (ticking)",
			demo: "Counting down to a date 30 days after the seed was run.",
			blockType: "countdownBlock",
			title: lorem.title(3),
			targetDate: new Date(now.getTime() + 30 * DAY_MS).toISOString(),
			finishedMessage: lorem.sentence(6),
		},
		{
			blockName: "Countdown: Under a Day Away",
			demo: "Counting down to a date 12 hours after the seed was run, so the days show as zero (until that date passes).",
			blockType: "countdownBlock",
			title: lorem.title(2),
			targetDate: new Date(now.getTime() + DAY_MS / 2).toISOString(),
			finishedMessage: lorem.sentence(5),
		},
		{
			blockName: "Countdown: Past Date (finished message)",
			demo: "The target date has already passed, so the finished message shows instead.",
			blockType: "countdownBlock",
			title: lorem.title(2),
			targetDate: new Date(now.getTime() - DAY_MS).toISOString(),
			finishedMessage: lorem.sentence(7),
		},
	];
}
