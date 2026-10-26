import { CODE_FORMAT, headingNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock } from "./types.ts";

/** Stands in for a block whose required relationship (event, product, …) doesn't exist in the database. */
export function buildPlaceholder(blockLabel: string, missing: string, blockType: string): KitchenSinkLayoutBlock {
	return {
		blockName: `${blockLabel} (placeholder — no ${missing} found)`,
		demoNoLabel: true,
		blockType: "content",
		settings: { background: "muted", textColor: "auto", padding: "small", fullBleed: false },
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode(`${blockLabel} examples unavailable`, "h3"),
					paragraphNode([
						textNode("The "),
						textNode(blockType, CODE_FORMAT),
						textNode(
							` block needs at least one ${missing.replace(/s$/, "")} to link to, and none were found when the seed ran. Add some ${missing} and re-run the seed to see these examples.`,
						),
					]),
				),
			},
		],
	};
}
