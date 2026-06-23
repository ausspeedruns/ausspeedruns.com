import { BOLD, ITALIC, headingNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkHeroData, KitchenSinkSectionContext } from "./types";

export function buildKitchenSinkHero({ img }: KitchenSinkSectionContext): KitchenSinkHeroData {
	return {
		type: "highImpact",
		links: [
			{
				link: {
					type: "custom",
					appearance: "default",
					label: "Explore Blocks",
					url: "#blocks-start",
				},
			},
			{
				link: {
					type: "custom",
					appearance: "outline",
					label: "View Source",
					url: "https://github.com/ausspeedruns/ausspeedruns-v2",
				},
			},
		],
		media: img(0),
		richText: richText(
			headingNode("Kitchen Sink — Every Block & Configuration", "h1"),
			paragraphNode([
				textNode("This page demonstrates "),
				textNode("every single block type", BOLD),
				textNode(" in the page builder, including multiple configurations of the "),
				textNode("Content", ITALIC),
				textNode(" block. Use this as a living reference for your team."),
			]),
		),
	};
}