import { createLorem } from "../lorem.ts";
import { buildPlaceholder } from "./placeholder.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkEventHeroSections({
	upcomingEventId,
	pastEventId,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (!upcomingEventId || !pastEventId) return [buildPlaceholder("Event Hero", "events", "eventHeroBlock")];

	const lorem = createLorem(1001);

	return [
		{
			blockName: "Event Hero: Upcoming, Heading + Subheading + Buttons",
			demo: "An upcoming event with a heading override, a subheading, the event dates and two buttons.",
			blockType: "eventHeroBlock",
			event: upcomingEventId,
			heading: lorem.title(3),
			subheading: lorem.sentence(8),
			showDates: true,
			showRecapStats: false,
			links: [
				{ label: lorem.title(2), url: "/events" },
				{ label: lorem.title(2), url: "https://example.com" },
			],
		},
		{
			blockName: "Event Hero: Past, Recap Stats",
			demo: "A past event with recap stats turned on (total raised, runs, runners and hours).",
			blockType: "eventHeroBlock",
			event: pastEventId,
			subheading: lorem.sentence(6),
			showDates: true,
			showRecapStats: true,
			links: [{ label: lorem.title(2), url: "/events" }],
		},
		{
			blockName: "Event Hero: Minimal (no dates, no overrides)",
			demo: "Dates hidden and no overrides, so only the event's own name and artwork show.",
			blockType: "eventHeroBlock",
			event: pastEventId,
			showDates: false,
			showRecapStats: false,
		},
	];
}
