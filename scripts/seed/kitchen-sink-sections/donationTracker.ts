import { createLorem } from "../lorem.ts";
import { buildPlaceholder } from "./placeholder.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkDonationTrackerSections({
	upcomingEventId,
	pastEventId,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (!upcomingEventId || !pastEventId)
		return [buildPlaceholder("Donation Tracker", "events", "donationTrackerBlock")];

	const lorem = createLorem(1301);

	return [
		{
			blockName: "Donation Tracker: Live (upcoming event)",
			demo: "Display mode: Live. Shows the running total and active incentives for the upcoming event.",
			blockType: "donationTrackerBlock",
			event: upcomingEventId,
			title: lorem.title(3),
			displayMode: "live",
		},
		{
			blockName: "Donation Tracker: Results (past event)",
			demo: "Display mode: Results. A post-event recap of a past event's incentives.",
			blockType: "donationTrackerBlock",
			event: pastEventId,
			title: lorem.title(2),
			displayMode: "results",
		},
	];
}
