import {
	BOLD,
	BOLD_ITALIC,
	CODE_FORMAT,
	ITALIC,
	STRIKETHROUGH,
	UNDERLINE,
	headingNode,
	linkNode,
	listNode,
	mediaBlockNode,
	paragraphNode,
	quoteNode,
	richText,
	textNode,
	uploadNode,
} from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types";

export function buildKitchenSinkContentSections({
	img,
	mediaItems,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	const layout: KitchenSinkLayoutBlock[] = [];

	layout.push({
		blockName: "Content: Full-Width Section Heading",
		blockType: "content",
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode("Content Block Showcase", "h2"),
					paragraphNode([
						textNode(
							"The Content block is the most versatile building block available. Below you'll see it used in every possible column layout, with rich text pushed to its limits. Before creating a custom block, always ask yourself: could a Content block do this?",
						),
					]),
				),
			},
		],
	});

	layout.push({
		blockName: "Content: Three Equal Columns (⅓ + ⅓ + ⅓)",
		blockType: "content",
		columns: [
			{
				size: "oneThird",
				richText: richText(
					headingNode("Column One", "h3"),
					paragraphNode([
						textNode("One-third columns are perfect for "),
						textNode("feature grids", BOLD),
						textNode(" and comparison layouts. Each column gets equal space."),
					]),
				),
			},
			{
				size: "oneThird",
				richText: richText(
					headingNode("Column Two", "h3"),
					paragraphNode([
						textNode("You can mix "),
						textNode("bold", BOLD),
						textNode(", "),
						textNode("italic", ITALIC),
						textNode(", "),
						textNode("underlined", UNDERLINE),
						textNode(", and "),
						textNode("strikethrough", STRIKETHROUGH),
						textNode(" text freely."),
					]),
				),
			},
			{
				size: "oneThird",
				richText: richText(
					headingNode("Column Three", "h3"),
					paragraphNode([
						textNode("Even "),
						textNode("bold italic", BOLD_ITALIC),
						textNode(" and "),
						textNode("inline code", CODE_FORMAT),
						textNode(" formatting works inside columns."),
					]),
				),
			},
		],
	});

	layout.push({
		blockName: "Content: Two Equal Columns (½ + ½)",
		blockType: "content",
		columns: [
			{
				size: "half",
				richText: richText(
					headingNode("Left Half", "h3"),
					paragraphNode([
						textNode(
							"Half-width columns work great for side-by-side comparisons, text + image layouts, or anything that benefits from a two-column structure.",
						),
					]),
					listNode("bullet", [
						"Bullet lists render perfectly in columns",
						"Great for feature lists",
						"Or quick summaries of key points",
						"No limit on the number of items",
					]),
				),
			},
			{
				size: "half",
				richText: richText(
					headingNode("Right Half", "h3"),
					paragraphNode([
						textNode("Numbered lists are equally supported and useful for step-by-step instructions:"),
					]),
					listNode("number", [
						"Open the admin dashboard",
						"Navigate to Pages",
						"Choose a layout block",
						"Configure your columns",
						"Publish your page",
					]),
				),
			},
		],
	});

	layout.push({
		blockName: "Content: Asymmetric (⅔ + ⅓)",
		blockType: "content",
		columns: [
			{
				size: "twoThirds",
				richText: richText(
					headingNode("Main Content Area (Two-Thirds)", "h3"),
					paragraphNode([
						textNode(
							"A two-thirds column is ideal for primary content. You get plenty of horizontal space for long-form text, detailed descriptions, or complex layouts.",
						),
					]),
					paragraphNode([
						textNode("You can include "),
						linkNode("links to internal pages", "/about"),
						textNode(" as well as "),
						linkNode("external links that open in new tabs", "https://ausspeedruns.com", true),
						textNode(". Rich text supports all standard inline formatting."),
					]),
					quoteNode(
						"Blockquotes are great for highlighting important information, testimonials, or calls to attention within your content.",
					),
				),
			},
			{
				size: "oneThird",
				richText: richText(
					headingNode("Sidebar (One-Third)", "h3"),
					paragraphNode([
						textNode(
							"The narrower column is great for sidebars, quick facts, or supplementary information.",
						),
					]),
					listNode("bullet", ["Quick stats", "Key dates", "Contact info", "Related links"]),
				),
			},
		],
	});

	layout.push({
		blockName: "Content: Reversed Asymmetric (⅓ + ⅔)",
		blockType: "content",
		columns: [
			{
				size: "oneThird",
				richText: richText(
					headingNode("Navigation", "h4"),
					listNode("bullet", ["Section One", "Section Two", "Section Three", "Section Four"]),
				),
			},
			{
				size: "twoThirds",
				richText: richText(
					headingNode("Reversed Layout", "h3"),
					paragraphNode([
						textNode(
							"Flipping the column order puts the narrow column on the left — useful for navigation sidebars or table-of-contents patterns. This proves you don't need a custom block for every layout idea.",
						),
					]),
				),
			},
		],
	});

	layout.push({
		blockName: "Content: Full-Width Rich Text Showcase",
		blockType: "content",
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode("Full-Width Rich Text Capabilities", "h2"),
					paragraphNode([
						textNode("This section demonstrates every rich text feature in a single full-width column. "),
						textNode("Bold text", BOLD),
						textNode(" · "),
						textNode("Italic text", ITALIC),
						textNode(" · "),
						textNode("Underlined text", UNDERLINE),
						textNode(" · "),
						textNode("Strikethrough text", STRIKETHROUGH),
						textNode(" · "),
						textNode("Inline code", CODE_FORMAT),
						textNode(" · "),
						textNode("Bold + Italic", BOLD_ITALIC),
					]),
					headingNode("Heading Level 1", "h1"),
					headingNode("Heading Level 2", "h2"),
					headingNode("Heading Level 3", "h3"),
					headingNode("Heading Level 4", "h4"),
					paragraphNode([
						textNode("Here is a paragraph with an "),
						linkNode("internal link", "/about"),
						textNode(" and an "),
						linkNode("external link (new tab)", "https://ausspeedruns.com", true),
						textNode(
							". Links can appear anywhere inline and wrap naturally with the surrounding text. This paragraph also intentionally runs long to demonstrate how text wraps across the full width of the page, because sometimes you just need a big wall of text to see how your typography holds up at large widths.",
						),
					]),
					quoteNode(
						"This is a blockquote. Blockquotes are excellent for testimonials, highlighted quotes, or important notes that need to stand out from surrounding content.",
					),
					paragraphNode([textNode("An unordered list:")]),
					listNode("bullet", [
						"First bullet point",
						"Second bullet point with more detail",
						"Third bullet point",
					]),
					paragraphNode([textNode("An ordered list:")]),
					listNode("number", [
						"Step one of the process",
						"Step two with further explanation",
						"Step three to wrap it up",
					]),
					paragraphNode([
						textNode("And finally, a paragraph after the lists to show spacing is consistent throughout."),
					]),
				),
			},
		],
	});

	layout.push({
		blockName: "Content: Columns with CTA Links",
		blockType: "content",
		columns: [
			{
				size: "oneThird",
				richText: richText(
					headingNode("Donate", "h3"),
					paragraphNode([textNode("Support charity by donating to our current marathon event.")]),
				),
				enableLink: true,
				link: {
					type: "custom",
					label: "Donate Now",
					url: "https://donate.ausspeedruns.com",
					newTab: true,
				},
			},
			{
				size: "oneThird",
				richText: richText(
					headingNode("Volunteer", "h3"),
					paragraphNode([textNode("Join our volunteer team and help make events happen.")]),
				),
				enableLink: true,
				link: {
					type: "custom",
					label: "Sign Up to Volunteer",
					url: "/volunteer",
					newTab: false,
				},
			},
			{
				size: "oneThird",
				richText: richText(
					headingNode("Submit a Run", "h3"),
					paragraphNode([textNode("Got a speedrun you'd like to showcase? Submit it for our next event.")]),
				),
				enableLink: true,
				link: {
					type: "custom",
					label: "Submit Run",
					url: "/submissions",
					newTab: false,
				},
			},
		],
	});

	layout.push({
		blockName: "Content: Four Columns Wrapping (⅓ × 4)",
		blockType: "content",
		columns: [
			{
				size: "oneThird",
				richText: richText(
					headingNode("Card 1", "h4"),
					paragraphNode([
						textNode(
							"When you add more than 3 one-third columns, they wrap to the next row. This is useful for card-style grids.",
						),
					]),
				),
			},
			{
				size: "oneThird",
				richText: richText(
					headingNode("Card 2", "h4"),
					paragraphNode([textNode("Each card gets consistent sizing thanks to the column system.")]),
				),
			},
			{
				size: "oneThird",
				richText: richText(
					headingNode("Card 3", "h4"),
					paragraphNode([textNode("You could use this for team members, features, or portfolio items.")]),
				),
			},
			{
				size: "oneThird",
				richText: richText(
					headingNode("Card 4", "h4"),
					paragraphNode([
						textNode(
							"This fourth card wraps to a second row, proving the grid handles overflow gracefully.",
						),
					]),
				),
			},
		],
	});

	layout.push({
		blockName: "Content: Mixed Widths (½ + ⅓)",
		blockType: "content",
		columns: [
			{
				size: "half",
				richText: richText(
					headingNode("Half-Width Primary", "h3"),
					paragraphNode([
						textNode(
							"Mixing column sizes creates dynamic layouts. Here a half-width column sits beside a one-third column.",
						),
					]),
				),
			},
			{
				size: "oneThird",
				richText: richText(
					headingNode("One-Third Secondary", "h3"),
					paragraphNode([textNode("The remaining space creates natural breathing room.")]),
				),
			},
		],
	});

	layout.push({
		blockName: "Content: Stacked Full-Width Sections",
		blockType: "content",
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode("Section A — No Extra Block Needed", "h2"),
					paragraphNode([
						textNode(
							"You don't need a new Content block for every section. Multiple full-width columns inside a single Content block stack vertically, acting as distinct sections while sharing one block configuration.",
						),
					]),
				),
			},
			{
				size: "full",
				richText: richText(
					headingNode("Section B — Still the Same Block", "h3"),
					paragraphNode([
						textNode(
							"This is still inside the same Content block. Think of full-width columns as paragraphs in a document — have as many as you need. ",
						),
						textNode("This avoids block sprawl", BOLD),
						textNode(" and keeps the admin UI manageable."),
					]),
					quoteNode(
						"Pro tip: Before creating a custom block, ask yourself — could a Content block with the right column layout do the job?",
					),
				),
			},
			{
				size: "full",
				richText: richText(
					headingNode("Section C — Complex Inline Formatting", "h3"),
					paragraphNode([
						textNode("Combine "),
						textNode("bold", BOLD),
						textNode(" + "),
						textNode("italic", ITALIC),
						textNode(" + "),
						textNode("underline", UNDERLINE),
						textNode(" + "),
						textNode("code", CODE_FORMAT),
						textNode(" in a single sentence, with "),
						linkNode("links interleaved", "/example"),
						textNode(" seamlessly."),
					]),
				),
			},
		],
	});

	layout.push({
		blockName: "Content: Card Background",
		blockType: "content",
		settings: {
			background: "card",
			textColor: "auto",
			padding: "default",
			fullBleed: false,
		},
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode("Block Styling — Card Background", "h3"),
					paragraphNode([
						textNode("The Content block now has structured "),
						textNode("Settings", BOLD),
						textNode(
							" instead of a freeform style field. This block uses the Card background, which pulls from the theme's ",
						),
						textNode("--card", CODE_FORMAT),
						textNode(" CSS variable. It automatically adapts to light/dark mode."),
					]),
				),
			},
		],
	});

	layout.push({
		blockName: "Content: Primary Full-Bleed",
		blockType: "content",
		settings: {
			background: "primary",
			textColor: "auto",
			padding: "large",
			fullBleed: true,
		},
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode("Full-Bleed Primary Background", "h2"),
					paragraphNode([
						textNode(
							"This block uses a Primary background with full-bleed enabled. The background extends edge-to-edge while the content stays centred. Combined with Large padding, it creates a bold section divider.",
						),
					]),
				),
			},
		],
	});

	layout.push({
		blockName: "Content: AusSpeedruns Blue",
		blockType: "content",
		settings: {
			background: "blue",
			textColor: "auto",
			padding: "default",
			fullBleed: false,
		},
		columns: [
			{
				size: "half",
				richText: richText(
					headingNode("AusSpeedruns Blue", "h3"),
					paragraphNode([
						textNode(
							"The brand colours (Blue and Orange) are available as background options. Text automatically switches to white for readability.",
						),
					]),
				),
			},
			{
				size: "half",
				richText: richText(
					headingNode("Theme Aware", "h3"),
					paragraphNode([
						textNode(
							"All background options use CSS custom properties, so they respect the site's theme system. Adding a new colour is as simple as adding a CSS class and a select option.",
						),
					]),
				),
			},
		],
	});

	layout.push({
		blockName: "Content: Custom Background Colour",
		blockType: "content",
		settings: {
			background: "custom",
			customBackgroundColor: "#1a1a2e",
			textColor: "light",
			padding: "large",
			fullBleed: true,
		},
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode("Custom Background Colour", "h2"),
					paragraphNode([
						textNode(
							"For one-off sections that don't match a theme colour, editors can enter any valid CSS colour value. This section uses ",
						),
						textNode("#1a1a2e", CODE_FORMAT),
						textNode(
							" with light text manually selected. Use this sparingly — theme colours keep the site consistent.",
						),
					]),
				),
			},
		],
	});

	layout.push({
		blockName: "Content: Muted Compact",
		blockType: "content",
		settings: {
			background: "muted",
			textColor: "auto",
			padding: "small",
			fullBleed: false,
		},
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode("Compact Muted Section", "h4"),
					paragraphNode([
						textNode(
							"Small padding + muted background + contained (non-full-bleed) = a subtle info box. Great for disclaimers, fine print, or supplementary notes.",
						),
					]),
				),
			},
		],
	});

	if (mediaItems.length > 0) {
		layout.push({
			blockName: "Content: Background Image (Dark Overlay)",
			blockType: "content",
			settings: {
				background: "none",
				backgroundImage: img(0),
				backgroundImageOverlay: "dark50",
				textColor: "light",
				padding: "large",
				fullBleed: true,
			},
			columns: [
				{
					size: "full",
					richText: richText(
						headingNode("Background Image with Dark Overlay", "h2"),
						paragraphNode([
							textNode(
								"This section uses a full-bleed background image with a 50% dark overlay to keep text readable. The image covers the entire section just like a hero banner, but this is a ",
							),
							textNode("regular Content block", BOLD),
							textNode(
								". Use it for impactful section dividers, event promos, or any section that needs a dramatic visual punch.",
							),
						]),
					),
				},
			],
		});
	}

	if (mediaItems.length > 1) {
		layout.push({
			blockName: "Content: Background Image + Brand Colour",
			blockType: "content",
			settings: {
				background: "blue",
				backgroundImage: img(1),
				backgroundImageOverlay: "dark75",
				textColor: "light",
				padding: "large",
				fullBleed: false,
			},
			columns: [
				{
					size: "twoThirds",
					richText: richText(
						headingNode("Background Image + Brand Colour", "h3"),
						paragraphNode([
							textNode(
								"You can combine a background image with a background colour. The colour acts as a fallback while the image loads, and the overlay tints over everything. This block uses the AusSpeedruns Blue background as a base with a 75% dark overlay on the image.",
							),
						]),
					),
				},
				{
					size: "oneThird",
					richText: richText(
						headingNode("Use Cases", "h4"),
						listNode("bullet", [
							"Event promo sections",
							"Hero-style call-to-actions",
							"Testimonial backgrounds",
							"Section dividers with atmosphere",
						]),
					),
				},
			],
		});
	}

	if (mediaItems.length > 2) {
		layout.push({
			blockName: "Content: Background Image (Light Overlay, Contained)",
			blockType: "content",
			settings: {
				background: "none",
				backgroundImage: img(2),
				backgroundImageOverlay: "light50",
				textColor: "dark",
				padding: "large",
				fullBleed: false,
			},
			columns: [
				{
					size: "full",
					richText: richText(
						headingNode("Contained Background Image with Light Overlay", "h3"),
						paragraphNode([
							textNode("Not every background image needs to be full-bleed. This example stays "),
							textNode("contained", BOLD),
							textNode(
								" within the content width and uses a light overlay with dark text — great for a softer, less dramatic look. The border-radius from the background settings rounds the corners nicely.",
							),
						]),
					),
				},
			],
		});
	}

	if (mediaItems.length > 0) {
		layout.push({
			blockName: "Content: Text → Image → Text",
			blockType: "content",
			columns: [
				{
					size: "full",
					richText: richText(
						headingNode("Text + Image + Text (Single Column)", "h2"),
						paragraphNode([
							textNode(
								"You don't need separate blocks to mix text and images. Inside a single Content column you can write a paragraph, drop in an image, and continue writing below it. The image below is embedded using the ",
							),
							textNode("Media Block", BOLD),
							textNode(" feature inside the rich text editor — just click the "),
							textNode("/", CODE_FORMAT),
							textNode(' slash command and choose "Media Block".'),
						]),
						mediaBlockNode(img(0)),
						paragraphNode([
							textNode(
								"See? The text continues naturally after the image. This is exactly how a blog post or article would flow — paragraphs of text punctuated by images, all within ",
							),
							textNode("one single Content block", BOLD_ITALIC),
							textNode(". No need for separate Media blocks between Content blocks."),
						]),
						paragraphNode([textNode("You can also embed images inline using the Upload button: ")]),
						uploadNode(img(1)),
						paragraphNode([
							textNode(
								"The Upload node above gives you a simpler inline image without the full Media Block wrapper. Use whichever fits your layout.",
							),
						]),
					),
				},
			],
		});
	}

	if (mediaItems.length > 0) {
		layout.push({
			blockName: "Content: Image Left, Text Right",
			blockType: "content",
			columns: [
				{
					size: "half",
					richText: richText(mediaBlockNode(img(2))),
				},
				{
					size: "half",
					richText: richText(
						headingNode("Image Left, Text Right", "h3"),
						paragraphNode([
							textNode(
								"This is the classic image-beside-text layout. Put a Media Block in the left column and write your text in the right column. No custom block needed.",
							),
						]),
						paragraphNode([
							textNode("You can use "),
							textNode("half + half", BOLD),
							textNode(" for equal sizing, or "),
							textNode("oneThird + twoThirds", BOLD),
							textNode(
								" to give more space to the text. Flip the columns to put the image on the right instead.",
							),
						]),
						listNode("bullet", [
							"Works for product showcases",
							"Team member profiles",
							"Feature highlights with screenshots",
							"Event recaps with photos",
						]),
					),
				},
			],
		});

		layout.push({
			blockName: "Content: Text Left, Image Right",
			blockType: "content",
			settings: {
				background: "card",
				textColor: "auto",
				padding: "default",
				fullBleed: false,
			},
			columns: [
				{
					size: "twoThirds",
					richText: richText(
						headingNode("Text Left, Image Right", "h3"),
						paragraphNode([
							textNode(
								"Same concept, reversed. The text gets two-thirds of the width while the image sits in the remaining third. This also demonstrates combining an image layout with a Card background setting.",
							),
						]),
						quoteNode(
							"Pro tip: Pair image-beside-text layouts with background colours to create visually distinct sections without any custom blocks.",
						),
					),
				},
				{
					size: "oneThird",
					richText: richText(mediaBlockNode(img(3))),
				},
			],
		});
	}

	if (mediaItems.length >= 3) {
		layout.push({
			blockName: "Content: Image Gallery in Columns",
			blockType: "content",
			columns: [
				{
					size: "full",
					richText: richText(
						headingNode("Image Gallery Using Columns", "h2"),
						paragraphNode([
							textNode(
								"Need a quick image grid? Use multiple columns with a Media Block in each one. Add captions below via regular text. This replaces the need for a dedicated gallery block in many cases.",
							),
						]),
					),
				},
				{
					size: "oneThird",
					richText: richText(
						mediaBlockNode(img(0)),
						paragraphNode([
							textNode("Image One", BOLD),
							textNode(" — Caption text goes right below the image in the same column."),
						]),
					),
				},
				{
					size: "oneThird",
					richText: richText(
						mediaBlockNode(img(1)),
						paragraphNode([
							textNode("Image Two", BOLD),
							textNode(" — Each column is independent so you can mix image sizes freely."),
						]),
					),
				},
				{
					size: "oneThird",
					richText: richText(
						mediaBlockNode(img(2)),
						paragraphNode([
							textNode("Image Three", BOLD),
							textNode(" — Three columns of images creates a balanced gallery row."),
						]),
					),
				},
			],
		});

		layout.push({
			blockName: "Content: Two-Column Image Comparison",
			blockType: "content",
			settings: {
				background: "muted",
				textColor: "auto",
				padding: "default",
				fullBleed: false,
			},
			columns: [
				{
					size: "half",
					richText: richText(
						headingNode("Before", "h4"),
						mediaBlockNode(img(3)),
						paragraphNode([
							textNode(
								"Use two half-width columns for side-by-side comparisons — before/after shots, version comparisons, or any paired visual content.",
							),
						]),
					),
				},
				{
					size: "half",
					richText: richText(
						headingNode("After", "h4"),
						mediaBlockNode(img(4)),
						paragraphNode([
							textNode(
								"The muted background helps visually group the comparison. Each column can have its own heading, image, and description text.",
							),
						]),
					),
				},
			],
		});
	}

	return layout;
}
