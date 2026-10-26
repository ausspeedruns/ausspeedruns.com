import { createLorem } from "../lorem.ts";
import { buildPlaceholder } from "./placeholder.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkEventLiveSections({
	upcomingEventId,
	mediaItems,
	img,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (!upcomingEventId) return [buildPlaceholder("Event Live", "events", "eventLiveBlock")];

	const lorem = createLorem(1201);
	const sponsors = (count: number, offset: number, withLinks: boolean) =>
		mediaItems.length === 0
			? []
			: Array.from({ length: count }, (_, index) => ({
					logo: img(offset + index),
					name: lorem.title(2),
					...(withLinks ? { url: `https://example.com/${lorem.words(1)}` } : {}),
				}));

	return [
		{
			blockName: "Event Live: Cover Background, Major + Minor Sponsors",
			demo: "A cover background image, location, a donate button, two major sponsors in the header and five minor sponsors in the bottom strip, all linked.",
			blockType: "eventLiveBlock",
			event: upcomingEventId,
			location: lorem.title(1),
			donateUrl: "/donate",
			background: { image: img(0), mode: "cover" },
			majorSponsors: sponsors(2, 1, true),
			minorSponsors: sponsors(5, 3, true),
		},
		{
			blockName: "Event Live: Tiled Background (96px), Unlinked Sponsors",
			demo: "A repeating tiled background at 96px, an external donate URL and sponsor logos without links.",
			blockType: "eventLiveBlock",
			event: upcomingEventId,
			location: lorem.title(2),
			donateUrl: "https://example.com/donate",
			background: { image: img(2), mode: "tile", tileSize: 96 },
			majorSponsors: sponsors(1, 4, false),
			minorSponsors: sponsors(3, 5, false),
		},
		{
			blockName: "Event Live: Fallback Background, No Donate, No Sponsors",
			demo: "No background image, donate URL or sponsors. Falls back to the event's hero image, then to the brand pattern.",
			blockType: "eventLiveBlock",
			event: upcomingEventId,
			majorSponsors: [],
			minorSponsors: [],
		},
	];
}
