import { createLorem } from "../lorem.ts";
import { buildPlaceholder } from "./placeholder.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkEventFeatureSections({
	upcomingEventId,
	pastEventId,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (!upcomingEventId || !pastEventId) return [buildPlaceholder("Event Feature", "events", "eventFeatureBlock")];

	const lorem = createLorem(1101);

	return [
		{
			blockName: "Event Feature: Upcoming, Countdown, Custom Button, Extra Links",
			demo: "An upcoming event with a description, a countdown, a custom button label and URL, and two extra buttons.",
			blockType: "eventFeatureBlock",
			event: upcomingEventId,
			description: lorem.sentence(14),
			showDates: true,
			showCountdown: true,
			showRaised: false,
			buttonLabel: lorem.title(2),
			buttonUrl: "/events",
			extraLinks: [
				{ label: lorem.title(2), url: "/events" },
				{ label: lorem.title(3), url: "https://example.com" },
			],
		},
		{
			blockName: "Event Feature: Past, Amount Raised",
			demo: "A past event showing its dates and the amount raised.",
			blockType: "eventFeatureBlock",
			event: pastEventId,
			showDates: true,
			showCountdown: false,
			showRaised: true,
		},
		{
			blockName: "Event Feature: Description Only (no dates, no raised)",
			demo: "Dates, countdown and amount raised all turned off, so only the description shows.",
			blockType: "eventFeatureBlock",
			event: pastEventId,
			description: lorem.paragraph(2),
			showDates: false,
			showCountdown: false,
			showRaised: false,
		},
	];
}
