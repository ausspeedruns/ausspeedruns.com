import { CODE_FORMAT, headingNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types";

export function buildKitchenSinkDonationTrackerSection({ eventId }: KitchenSinkSectionContext): KitchenSinkLayoutBlock {
	if (eventId) {
		return {
			blockName: "Donation Tracker Block",
			blockType: "donationTrackerBlock",
			event: eventId,
			title: "Donation Progress",
		};
	}

	return {
		blockName: "Donation Tracker (placeholder — no events found)",
		blockType: "content",
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode("Donation Tracker Block", "h3"),
					paragraphNode([
						textNode("The "),
						textNode("donationTrackerBlock", CODE_FORMAT),
						textNode(
							" requires an Event relationship. It displays live donation totals and incentive progress for the selected event.",
						),
					]),
				),
			},
		],
	};
}