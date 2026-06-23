import { BOLD, headingNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock } from "./types";

export function buildKitchenSinkCtaSection(): KitchenSinkLayoutBlock {
	return {
		blockName: "Call to Action",
		blockType: "cta",
		links: [
			{
				link: {
					type: "custom",
					appearance: "default",
					label: "Primary Action",
					url: "/get-started",
				},
			},
			{
				link: {
					type: "custom",
					appearance: "outline",
					label: "Learn More",
					url: "/about",
				},
			},
		],
		richText: richText(
			headingNode("Ready to Get Involved?", "h3"),
			paragraphNode([
				textNode("Call to Action blocks pair a rich text area with up to two buttons. They support both "),
				textNode("default", BOLD),
				textNode(" and "),
				textNode("outline", BOLD),
				textNode(" button appearances, and can link internally or externally."),
			]),
		),
	};
}