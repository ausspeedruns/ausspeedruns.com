import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types";

export function buildKitchenSinkHomeSections({ eventId, img }: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	const blocks: KitchenSinkLayoutBlock[] = [];

	if (eventId) {
		blocks.push(
			{
				blockName: "Event Feature — countdown",
				blockType: "eventFeatureBlock",
				event: eventId,
				description: "The next event, with a countdown to the start time and an extra button.",
				showCountdown: true,
				showRaised: false,
				extraLinks: [{ label: "All events", url: "/events" }],
			},
			{
				blockName: "Event Feature — past event",
				blockType: "eventFeatureBlock",
				event: eventId,
				showRaised: true,
			},
		);
	}

	blocks.push(
		{
			blockName: "All-time Stats",
			blockType: "statsBlock",
			title: "AusSpeedruns so far",
			description: "Totals are calculated from published events and their runs.",
			extraStats: [{ label: "Charities supported", value: "10+" }],
		},
		{
			blockName: "Social Banner — YouTube",
			blockType: "socialBannerBlock",
			heading: "Missed a run?",
			text: "Every run from every event is uploaded to our YouTube channel.",
			buttonLabel: "Watch on YouTube",
			url: "https://www.youtube.com/@AusSpeedruns",
			platform: "youtube",
			backgroundImage: img(1),
		},
	);

	return blocks;
}
