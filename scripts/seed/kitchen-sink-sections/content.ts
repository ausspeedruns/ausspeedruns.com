import { createLorem, LOREM_OPENING } from "../lorem.ts";
import {
	BOLD,
	BOLD_ITALIC,
	CODE_FORMAT,
	ITALIC,
	STRIKETHROUGH,
	SUBSCRIPT,
	SUPERSCRIPT,
	UNDERLINE,
	checklistNode,
	headingNode,
	horizontalRuleNode,
	internalLinkNode,
	linkNode,
	listNode,
	mediaBlockNode,
	paragraphNode,
	quoteNode,
	richText,
	textNode,
	uploadNode,
} from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

type Lorem = ReturnType<typeof createLorem>;

const para = (lorem: Lorem, sentences?: number) => paragraphNode([textNode(lorem.paragraph(sentences))]);

/** Heading + paragraph, the most common column body. */
const simpleColumn = (lorem: Lorem, size: string, tag: "h2" | "h3" | "h4" = "h3", sentences = 2) => ({
	size,
	richText: richText(headingNode(lorem.title(2), tag), para(lorem, sentences)),
});

export function buildContentLayoutExamples({ posts }: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	const lorem = createLorem(100);
	const firstPost = posts[0];

	return [
		{
			blockName: "Content: Full Width",
			demo: "A single full-width column with a heading and a paragraph. The simplest possible Content block.",
			blockType: "content",
			columns: [
				{
					size: "full",
					richText: richText(
						headingNode(lorem.title(4), "h2"),
						paragraphNode([textNode(`${LOREM_OPENING} ${lorem.paragraph(3)}`)]),
					),
				},
			],
		},
		{
			blockName: "Content: Three Equal Columns (⅓ + ⅓ + ⅓)",
			demo: "Three one-third columns side by side, showing inline formatting: bold, italic, underline, strikethrough, bold-italic and inline code.",
			blockType: "content",
			columns: [
				{
					size: "oneThird",
					richText: richText(
						headingNode(lorem.title(2), "h3"),
						paragraphNode([
							textNode(`${lorem.sentence()} `),
							textNode(lorem.words(2), BOLD),
							textNode(` ${lorem.sentence()}`),
						]),
					),
				},
				{
					size: "oneThird",
					richText: richText(
						headingNode(lorem.title(2), "h3"),
						paragraphNode([
							textNode(`${lorem.phrase(4)} `),
							textNode(lorem.words(1), BOLD),
							textNode(", "),
							textNode(lorem.words(1), ITALIC),
							textNode(", "),
							textNode(lorem.words(1), UNDERLINE),
							textNode(", "),
							textNode(lorem.words(1), STRIKETHROUGH),
							textNode(` ${lorem.sentence()}`),
						]),
					),
				},
				{
					size: "oneThird",
					richText: richText(
						headingNode(lorem.title(2), "h3"),
						paragraphNode([
							textNode(`${lorem.phrase(3)} `),
							textNode(lorem.words(2), BOLD_ITALIC),
							textNode(` ${lorem.words(2)} `),
							textNode(lorem.words(2), CODE_FORMAT),
							textNode(` ${lorem.sentence()}`),
						]),
					),
				},
			],
		},
		{
			blockName: "Content: Two Equal Columns (½ + ½) with Lists",
			demo: "Two half-width columns, one with a bullet list and one with a numbered list.",
			blockType: "content",
			columns: [
				{
					size: "half",
					richText: richText(
						headingNode(lorem.title(2), "h3"),
						para(lorem, 2),
						listNode("bullet", lorem.items(4)),
					),
				},
				{
					size: "half",
					richText: richText(
						headingNode(lorem.title(2), "h3"),
						para(lorem, 1),
						listNode("number", lorem.items(5)),
					),
				},
			],
		},
		{
			blockName: "Content: Asymmetric (⅔ + ⅓) with Links and Quote",
			demo: "A wide main column with an internal link, an external link that opens in a new tab and a blockquote, beside a narrow sidebar column.",
			blockType: "content",
			columns: [
				{
					size: "twoThirds",
					richText: richText(
						headingNode(lorem.title(4), "h3"),
						para(lorem, 3),
						paragraphNode([
							textNode(`${lorem.sentence()} `),
							firstPost
								? internalLinkNode(lorem.words(3), "posts", firstPost.id)
								: linkNode(lorem.words(3), "/posts"),
							textNode(` ${lorem.words(4)} `),
							linkNode(lorem.words(4), "https://example.com", true),
							textNode(`. ${lorem.sentence()}`),
						]),
						quoteNode(lorem.sentence(18)),
					),
				},
				{
					size: "oneThird",
					richText: richText(
						headingNode(lorem.title(2), "h3"),
						para(lorem, 1),
						listNode("bullet", lorem.items(4, 2)),
					),
				},
			],
		},
		{
			blockName: "Content: Reversed Asymmetric (⅓ + ⅔)",
			demo: "The narrow column comes first. Useful for a navigation list or table of contents beside the main text.",
			blockType: "content",
			columns: [
				{
					size: "oneThird",
					richText: richText(headingNode(lorem.title(1), "h4"), listNode("bullet", lorem.items(4, 2))),
				},
				simpleColumn(lorem, "twoThirds", "h3", 4),
			],
		},
		{
			blockName: "Content: Mixed Widths (½ + ⅓)",
			demo: "Column widths don't have to fill the row. The leftover space stays empty.",
			blockType: "content",
			columns: [simpleColumn(lorem, "half"), simpleColumn(lorem, "oneThird", "h3", 1)],
		},
		{
			blockName: "Content: Single Two-Thirds Column",
			demo: "One two-thirds column on its own, leaving empty space on the right.",
			blockType: "content",
			columns: [simpleColumn(lorem, "twoThirds", "h3", 3)],
		},
		{
			blockName: "Content: Single One-Third Column",
			demo: "One one-third column on its own.",
			blockType: "content",
			columns: [simpleColumn(lorem, "oneThird", "h4", 2)],
		},
		{
			blockName: "Content: Wrapping Card Grid (⅓ × 6)",
			demo: "Six one-third columns wrap onto two rows to make a card grid.",
			blockType: "content",
			columns: Array.from({ length: 6 }, () => simpleColumn(lorem, "oneThird", "h4", lorem.int(1, 3))),
		},
		{
			blockName: "Content: Wrapping Grid (½ × 4)",
			demo: "Four half-width columns wrap into a 2 × 2 grid.",
			blockType: "content",
			columns: Array.from({ length: 4 }, () => simpleColumn(lorem, "half", "h4", 2)),
		},
		{
			blockName: "Content: Stacked Full-Width Sections",
			demo: "Several full-width columns in one block stack vertically, acting as separate sections without adding more blocks.",
			blockType: "content",
			columns: [
				{ size: "full", richText: richText(headingNode(lorem.title(4), "h2"), para(lorem, 3)) },
				{
					size: "full",
					richText: richText(
						headingNode(lorem.title(3), "h3"),
						paragraphNode([
							textNode(`${lorem.sentence()} `),
							textNode(lorem.words(4), BOLD),
							textNode(` ${lorem.sentence()}`),
						]),
						quoteNode(lorem.sentence(16)),
					),
				},
				{ size: "full", richText: richText(headingNode(lorem.title(3), "h3"), para(lorem, 2)) },
			],
		},
		{
			blockName: "Content: Columns with Links (custom, internal, new tab)",
			demo: "The per-column 'Enable link' option: a custom URL (Default style), an internal link to a post (Outline style) and an external link that opens in a new tab.",
			blockType: "content",
			columns: [
				{
					...simpleColumn(lorem, "oneThird", "h3", 1),
					enableLink: true,
					link: { type: "custom", appearance: "default", label: lorem.title(2), url: "/events" },
				},
				{
					...simpleColumn(lorem, "oneThird", "h3", 1),
					enableLink: true,
					link: firstPost
						? {
								type: "reference",
								appearance: "outline",
								label: lorem.title(2),
								reference: { relationTo: "posts", value: firstPost.id },
							}
						: { type: "custom", appearance: "outline", label: lorem.title(2), url: "/posts" },
				},
				{
					...simpleColumn(lorem, "oneThird", "h3", 1),
					enableLink: true,
					link: {
						type: "custom",
						appearance: "default",
						label: lorem.title(3),
						url: "https://example.com",
						newTab: true,
					},
				},
			],
		},
	];
}

export function buildContentRichTextExamples({ posts, img }: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	const lorem = createLorem(200);
	const firstPost = posts[0];

	return [
		{
			blockName: "Content: Every Rich Text Feature",
			demo: "Every rich text feature in one column: headings h1 to h6, all inline formats, superscript and subscript, internal and external links, centre, right and justified alignment, indents, a blockquote, horizontal rules, and bullet, numbered and check lists.",
			blockType: "content",
			columns: [
				{
					size: "full",
					richText: richText(
						headingNode(lorem.title(1), "h1"),
						headingNode(lorem.title(2), "h2"),
						headingNode(lorem.title(3), "h3"),
						headingNode(lorem.title(3), "h4"),
						headingNode(lorem.title(4), "h5"),
						headingNode(lorem.title(4), "h6"),
						paragraphNode([
							textNode(lorem.phrase(2), BOLD),
							textNode(" · "),
							textNode(lorem.words(2), ITALIC),
							textNode(" · "),
							textNode(lorem.words(2), UNDERLINE),
							textNode(" · "),
							textNode(lorem.words(2), STRIKETHROUGH),
							textNode(" · "),
							textNode(lorem.words(2), CODE_FORMAT),
							textNode(" · "),
							textNode(lorem.words(2), BOLD_ITALIC),
							textNode(" · "),
							textNode(lorem.words(2), BOLD | UNDERLINE),
							textNode(" · "),
							textNode(lorem.words(1)),
							textNode("2", SUPERSCRIPT),
							textNode(" · "),
							textNode(lorem.words(1)),
							textNode("2", SUBSCRIPT),
						]),
						paragraphNode([
							textNode(`${lorem.sentence()} `),
							firstPost
								? internalLinkNode(lorem.words(2), "posts", firstPost.id)
								: linkNode(lorem.words(2), "/posts"),
							textNode(` ${lorem.words(3)} `),
							linkNode(lorem.words(3), "https://example.com", true),
							textNode(` ${lorem.paragraph(4)}`),
						]),
						paragraphNode([textNode(lorem.paragraph(2))], { format: "center" }),
						paragraphNode([textNode(lorem.paragraph(2))], { format: "right" }),
						paragraphNode([textNode(lorem.paragraph(3))], { format: "justify" }),
						paragraphNode([textNode(lorem.paragraph(2))], { indent: 1 }),
						paragraphNode([textNode(lorem.sentence())], { indent: 2 }),
						quoteNode(lorem.sentence(24)),
						horizontalRuleNode(),
						listNode("bullet", [
							lorem.items(1)[0],
							[
								textNode(`${lorem.phrase(3)} `),
								textNode(lorem.words(2), BOLD),
								textNode(` ${lorem.words(3)}`),
							],
							[textNode(`${lorem.phrase(2)} `), linkNode(lorem.words(2), "https://example.com", true)],
							lorem.sentence(20),
						]),
						listNode("number", lorem.items(4)),
						checklistNode([
							{ text: lorem.sentence(6), checked: true },
							{ text: lorem.sentence(5), checked: true },
							{ text: lorem.sentence(7), checked: false },
						]),
						horizontalRuleNode(),
						para(lorem, 2),
					),
				},
			],
		},
		{
			blockName: "Content: Long-Form Article",
			demo: "A blog-style article: a two-thirds column of long text with headings, an embedded image and a quote, plus a one-third sidebar of links.",
			blockType: "content",
			columns: [
				{
					size: "twoThirds",
					richText: richText(
						headingNode(lorem.title(5), "h2"),
						paragraphNode([textNode(LOREM_OPENING, BOLD), textNode(` ${lorem.paragraph(4)}`)]),
						para(lorem, 5),
						headingNode(lorem.title(3), "h3"),
						para(lorem, 4),
						...(img(5) ? [mediaBlockNode(img(5))] : []),
						para(lorem, 3),
						quoteNode(lorem.sentence(20)),
						headingNode(lorem.title(3), "h3"),
						para(lorem, 5),
					),
				},
				{
					size: "oneThird",
					richText: richText(
						headingNode(lorem.title(2), "h4"),
						listNode(
							"bullet",
							Array.from({ length: 5 }, () => [linkNode(lorem.title(3), "#")]),
						),
						horizontalRuleNode(),
						headingNode(lorem.title(2), "h4"),
						para(lorem, 2),
					),
				},
			],
		},
	];
}

export function buildContentStylingExamples(): KitchenSinkLayoutBlock[] {
	const lorem = createLorem(300);

	const styled = (
		blockName: string,
		demo: string,
		settings: Record<string, unknown>,
		columns: KitchenSinkLayoutBlock["columns"],
	): KitchenSinkLayoutBlock => ({
		blockName,
		demo,
		blockType: "content",
		settings: { textColor: "auto", padding: "default", fullBleed: false, ...settings },
		columns,
	});

	return [
		styled(
			"Content: Card Background",
			"Background: Card. Uses the theme's card colour, so it adapts to light and dark mode.",
			{ background: "card" },
			[simpleColumn(lorem, "full", "h3", 3)],
		),
		styled(
			"Content: Muted Background, Small Padding",
			"Background: Muted, Padding: Small. A subtle box for notes or fine print.",
			{ background: "muted", padding: "small" },
			[simpleColumn(lorem, "full", "h4", 2)],
		),
		styled(
			"Content: Primary Background, Full Bleed, Large Padding",
			"Background: Primary, Full-bleed on, Padding: Large, plus an Outline-style column link. The colour runs edge to edge while the content stays centred.",
			{ background: "primary", padding: "large", fullBleed: true },
			[
				{
					size: "full",
					richText: richText(headingNode(lorem.title(4), "h2"), para(lorem, 2)),
					enableLink: true,
					link: { type: "custom", appearance: "outline", label: lorem.title(2), url: "/events" },
				},
			],
		),
		styled(
			"Content: Secondary Background",
			"Background: Secondary, contained to the content width, with two half columns.",
			{ background: "secondary" },
			[simpleColumn(lorem, "half"), simpleColumn(lorem, "half")],
		),
		styled(
			"Content: AusSpeedruns Blue",
			"Background: AusSpeedruns Blue. Text automatically switches to light.",
			{ background: "blue" },
			[simpleColumn(lorem, "half"), simpleColumn(lorem, "half")],
		),
		styled(
			"Content: AusSpeedruns Orange, Full Bleed",
			"Background: AusSpeedruns Orange, Full-bleed on, with three columns.",
			{ background: "orange", fullBleed: true },
			[simpleColumn(lorem, "oneThird"), simpleColumn(lorem, "oneThird"), simpleColumn(lorem, "oneThird")],
		),
		styled(
			"Content: Custom Dark Colour, Light Text, Full Bleed",
			"Background: Custom (#1a1a2e), Text Colour: Light, Padding: Large, Full-bleed on.",
			{
				background: "custom",
				customBackgroundColor: "#1a1a2e",
				textColor: "light",
				padding: "large",
				fullBleed: true,
			},
			[simpleColumn(lorem, "full", "h2", 3)],
		),
		styled(
			"Content: Custom Light Colour, Dark Text",
			"Background: Custom (hsl(45 100% 90%)), Text Colour: Dark.",
			{ background: "custom", customBackgroundColor: "hsl(45 100% 90%)", textColor: "dark" },
			[simpleColumn(lorem, "twoThirds", "h3", 2), simpleColumn(lorem, "oneThird", "h4", 1)],
		),
		styled(
			"Content: Card Background, No Padding",
			"Background: Card, Padding: None. The content sits tight against the edges.",
			{ background: "card", padding: "none" },
			[simpleColumn(lorem, "full", "h4", 1)],
		),
		styled(
			"Content: No Background, Large Padding",
			"No background, Padding: Large. Adds breathing room around plain content.",
			{ background: "none", padding: "large" },
			[simpleColumn(lorem, "full", "h3", 2)],
		),
	];
}

export function buildContentBackgroundImageExamples({
	mediaItems,
	img,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (mediaItems.length === 0) return [];

	const lorem = createLorem(400);

	const withImage = (
		blockName: string,
		demo: string,
		imageIndex: number,
		settings: Record<string, unknown>,
		columns: KitchenSinkLayoutBlock["columns"],
	): KitchenSinkLayoutBlock => ({
		blockName,
		demo,
		blockType: "content",
		settings: {
			background: "none",
			backgroundImage: img(imageIndex),
			textColor: "light",
			padding: "large",
			fullBleed: true,
			...settings,
		},
		columns,
	});

	return [
		withImage(
			"Content: Background Image, Dark 25% Overlay",
			"Full-bleed background image with a light Dark 25% overlay.",
			0,
			{ backgroundImageOverlay: "dark25" },
			[simpleColumn(lorem, "full", "h2", 2)],
		),
		withImage(
			"Content: Background Image, Dark 50% Overlay",
			"Full-bleed background image with the default Dark 50% overlay and a Default-style column link.",
			1,
			{ backgroundImageOverlay: "dark50" },
			[
				{
					size: "full",
					richText: richText(headingNode(lorem.title(4), "h2"), para(lorem, 3)),
					enableLink: true,
					link: { type: "custom", appearance: "default", label: lorem.title(2), url: "/events" },
				},
			],
		),
		withImage(
			"Content: Background Image, Dark 75% Overlay + Blue, Contained",
			"Contained (not full-bleed) background image with a Dark 75% overlay, layered over the AusSpeedruns Blue background colour.",
			2,
			{ background: "blue", backgroundImageOverlay: "dark75", fullBleed: false },
			[
				simpleColumn(lorem, "twoThirds", "h3", 3),
				{
					size: "oneThird",
					richText: richText(headingNode(lorem.title(2), "h4"), listNode("bullet", lorem.items(4))),
				},
			],
		),
		withImage(
			"Content: Background Image, Light 25% Overlay",
			"Full-bleed background image with a Light 25% overlay and Text Colour: Dark.",
			3,
			{ backgroundImageOverlay: "light25", textColor: "dark" },
			[simpleColumn(lorem, "half", "h3", 2), simpleColumn(lorem, "half", "h3", 2)],
		),
		withImage(
			"Content: Background Image, Light 50% Overlay, Contained",
			"Contained background image with a Light 50% overlay and Text Colour: Dark.",
			4,
			{ backgroundImageOverlay: "light50", textColor: "dark", fullBleed: false },
			[simpleColumn(lorem, "full", "h3", 2)],
		),
		withImage(
			"Content: Background Image, No Overlay, Small Padding",
			"Background image with the overlay turned off and Padding: Small. A heading-only banner.",
			5,
			{ backgroundImageOverlay: "none", padding: "small" },
			[{ size: "full", richText: richText(headingNode(lorem.title(3), "h2")) }],
		),
	];
}

export function buildContentMediaExamples({ mediaItems, img }: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (mediaItems.length === 0) return [];

	const lorem = createLorem(500);
	const captioned = (imageIndex: number) => ({
		size: "oneThird",
		richText: richText(
			mediaBlockNode(img(imageIndex)),
			paragraphNode([textNode(lorem.title(2), BOLD), textNode(` — ${lorem.sentence(8)}`)]),
		),
	});

	return [
		{
			blockName: "Content: Text → Media Block → Text → Upload → Text",
			demo: "Images inside rich text: a Media Block and an Upload placed between paragraphs, all in one column.",
			blockType: "content",
			columns: [
				{
					size: "full",
					richText: richText(
						headingNode(lorem.title(4), "h2"),
						para(lorem, 3),
						mediaBlockNode(img(0)),
						para(lorem, 3),
						uploadNode(img(1)),
						para(lorem, 2),
					),
				},
			],
		},
		{
			blockName: "Content: Image Left, Text Right (½ + ½)",
			demo: "A Media Block in the left column; text, a list and a link in the right column.",
			blockType: "content",
			columns: [
				{ size: "half", richText: richText(mediaBlockNode(img(2))) },
				{
					size: "half",
					richText: richText(
						headingNode(lorem.title(3), "h3"),
						para(lorem, 3),
						listNode("bullet", lorem.items(4)),
					),
					enableLink: true,
					link: { type: "custom", appearance: "outline", label: lorem.title(2), url: "/events" },
				},
			],
		},
		{
			blockName: "Content: Text Left, Image Right (⅔ + ⅓) on Card",
			demo: "Text in a wide column and the image in a narrow column, on a Card background.",
			blockType: "content",
			settings: { background: "card", textColor: "auto", padding: "default", fullBleed: false },
			columns: [
				{
					size: "twoThirds",
					richText: richText(
						headingNode(lorem.title(3), "h3"),
						para(lorem, 3),
						quoteNode(lorem.sentence(14)),
					),
				},
				{ size: "oneThird", richText: richText(mediaBlockNode(img(3))) },
			],
		},
		{
			blockName: "Content: Image Gallery (⅓ × 6 with captions)",
			demo: "A gallery built from columns: a full-width intro, then six one-third columns, each with an image and a caption.",
			blockType: "content",
			columns: [
				{ size: "full", richText: richText(headingNode(lorem.title(3), "h2"), para(lorem, 1)) },
				...Array.from({ length: 6 }, (_, index) => captioned(index)),
			],
		},
		{
			blockName: "Content: Side-by-Side Comparison on Muted",
			demo: "Two half columns, each with a heading, an image and a caption, on a Muted background. Good for before/after comparisons.",
			blockType: "content",
			settings: { background: "muted", textColor: "auto", padding: "default", fullBleed: false },
			columns: [
				{
					size: "half",
					richText: richText(headingNode(lorem.title(1), "h4"), mediaBlockNode(img(4)), para(lorem, 1)),
				},
				{
					size: "half",
					richText: richText(headingNode(lorem.title(1), "h4"), mediaBlockNode(img(5)), para(lorem, 1)),
				},
			],
		},
	];
}
