import { CODE_FORMAT, headingNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types";

export function buildKitchenSinkEventHeroSection({ eventId }: KitchenSinkSectionContext): KitchenSinkLayoutBlock {
	if (eventId) {
		return {
			blockName: "Event Hero Block",
			blockType: "eventHeroBlock",
			event: eventId,
			heading: "AusSpeedruns Marathon 2026",
		};
	}

	return {
		blockName: "Event Hero Block (placeholder — no events found)",
		blockType: "content",
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode("Event Hero Block", "h3"),
					paragraphNode([
						textNode("The "),
						textNode("eventHeroBlock", CODE_FORMAT),
						textNode(
							" requires an Event relationship. Create an Event in the admin dashboard, then add this block to a page and select it. It displays event-specific hero content with an optional heading override.",
						),
					]),
				),
			},
		],
	};
}