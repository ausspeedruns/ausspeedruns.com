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
import type { KitchenSinkLayoutBlock } from "./types";

export function buildKitchenSinkSummarySection(): KitchenSinkLayoutBlock {
	return {
		blockName: "Content: Why Content Is Enough",
		blockType: "content",
		settings: {
			background: "muted",
			textColor: "auto",
			padding: "large",
			fullBleed: true,
		},
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode("Before You Create a New Block…", "h2"),
					quoteNode(
						"If you're thinking about creating a custom block, first ask: could a Content block do this?",
					),
					paragraphNode([
						textNode("The Content block supports "),
						textNode("all of the following", BOLD),
						textNode(" without any custom development:"),
					]),
				),
			},
			{
				size: "oneThird",
				richText: richText(
					headingNode("Layouts", "h4"),
					listNode("bullet", [
						"Full-width sections",
						"Two-column (50/50) layouts",
						"Three-column (33/33/33) layouts",
						"Asymmetric (66/33 or 33/66) layouts",
						"Card grids (wrapping columns)",
						"Mixed-width columns",
						"Stacked full-width sections in one block",
					]),
				),
			},
			{
				size: "oneThird",
				richText: richText(
					headingNode("Rich Text Features", "h4"),
					listNode("bullet", [
						"Headings (h1–h4)",
						"Paragraphs with inline formatting",
						"Bold, italic, underline, strikethrough, code",
						"Internal and external links",
						"Ordered and unordered lists",
						"Blockquotes",
						"CTA links on columns",
					]),
				),
			},
			{
				size: "oneThird",
				richText: richText(
					headingNode("Styling & Media", "h4"),
					listNode("bullet", [
						"Inline images via Upload in rich text",
						"Block-level media via Media blocks in rich text",
						"Background: theme, brand, or custom colour",
						"Text colour: auto, light, or dark",
						"Padding: none, small, default, large",
						"Full-bleed or contained backgrounds",
					]),
				),
			},
			{
				size: "full",
				richText: richText(
					paragraphNode([
						textNode("Only reach for a custom block when you need "),
						textNode("interactive behaviour", BOLD),
						textNode(" (countdown timers, live streams, forms), "),
						textNode("external data", BOLD),
						textNode(" (donation trackers, event data), or "),
						textNode("specialised UI", BOLD),
						textNode(" (image carousels, sponsor grids). For everything else — "),
						textNode("Content is king.", BOLD_ITALIC),
					]),
				),
			},
		],
	};
}