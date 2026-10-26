import { createLorem } from "../lorem.ts";
import {
	BOLD,
	BOLD_ITALIC,
	headingNode,
	listNode,
	paragraphNode,
	quoteNode,
	richText,
	textNode,
} from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock } from "./types.ts";

/** Closing full-bleed section mixing full-width and one-third columns in a single block. */
export function buildKitchenSinkSummarySection(): KitchenSinkLayoutBlock {
	const lorem = createLorem(2400);
	const listColumn = () => ({
		size: "oneThird",
		richText: richText(headingNode(lorem.title(1), "h4"), listNode("bullet", lorem.items(lorem.int(5, 7)))),
	});

	return {
		blockName: "Content: Closing Summary (full-bleed muted, mixed columns)",
		demo: "A full-bleed Muted block mixing full-width and one-third columns in a single block.",
		blockType: "content",
		settings: { background: "muted", textColor: "auto", padding: "large", fullBleed: true },
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode(lorem.title(4), "h2"),
					quoteNode(lorem.sentence(14)),
					paragraphNode([
						textNode(`${lorem.phrase(4)} `),
						textNode(lorem.words(3), BOLD),
						textNode(` ${lorem.words(4)}:`),
					]),
				),
			},
			listColumn(),
			listColumn(),
			listColumn(),
			{
				size: "full",
				richText: richText(
					paragraphNode([
						textNode(`${lorem.sentence()} `),
						textNode(lorem.words(2), BOLD),
						textNode(` ${lorem.sentence()} `),
						textNode(lorem.words(3), BOLD_ITALIC),
					]),
				),
			},
		],
	};
}
