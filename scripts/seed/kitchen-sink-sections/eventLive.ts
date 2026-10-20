import { CODE_FORMAT, headingNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types";

export function buildKitchenSinkEventLiveSection({ eventId, img }: KitchenSinkSectionContext): KitchenSinkLayoutBlock {
	if (eventId) {
		const majorLogo = img(1);
		const minorLogo = img(2);
		return {
			blockName: "Event Live Block",
			blockType: "eventLiveBlock",
			event: eventId,
			location: "Melbourne",
			donateUrl: "/donate",
			majorSponsors: majorLogo ? [{ logo: majorLogo, name: "Major sponsor" }] : [],
			minorSponsors: minorLogo ? [{ logo: minorLogo, name: "Minor sponsor" }] : [],
		};
	}

	return {
		blockName: "Event Live (placeholder — no events found)",
		blockType: "content",
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode("Event Live Block", "h3"),
					paragraphNode([
						textNode("The "),
						textNode("eventLiveBlock", CODE_FORMAT),
						textNode(
							" requires an Event relationship. It shows the Twitch stream and chat, the current run, the upcoming schedule and incentives for the selected event.",
						),
					]),
				),
			},
		],
	};
}
