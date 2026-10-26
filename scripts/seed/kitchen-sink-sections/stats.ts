import { createLorem } from "../lorem.ts";
import type { KitchenSinkLayoutBlock } from "./types.ts";

export function buildKitchenSinkStatsSections(): KitchenSinkLayoutBlock[] {
	const lorem = createLorem(1700);

	return [
		{
			blockName: "All-time Stats: Everything + Extra Stats",
			demo: "Every automatic stat turned on (total raised, events held and runs showcased), plus a description and three manually entered stats.",
			blockType: "statsBlock",
			title: lorem.title(3),
			description: lorem.sentence(),
			showRaised: true,
			showEvents: true,
			showRuns: true,
			extraStats: [
				{ label: lorem.title(2), value: "10+" },
				{ label: lorem.title(2), value: "1,234" },
				{ label: lorem.title(3), value: "99%" },
			],
		},
		{
			blockName: "All-time Stats: Raised Only, No Description",
			demo: "Only Total Raised turned on, with no description.",
			blockType: "statsBlock",
			title: lorem.title(2),
			showRaised: true,
			showEvents: false,
			showRuns: false,
		},
		{
			blockName: "All-time Stats: Manual Stats Only",
			demo: "Every automatic stat turned off, so only the manually entered stats show.",
			blockType: "statsBlock",
			title: lorem.title(2),
			description: lorem.sentence(8),
			showRaised: false,
			showEvents: false,
			showRuns: false,
			extraStats: [
				{ label: lorem.title(1), value: "42" },
				{ label: lorem.title(2), value: "7" },
			],
		},
	];
}
