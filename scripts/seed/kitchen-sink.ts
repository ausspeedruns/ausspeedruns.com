import type { BasePayload, RequiredDataFromCollectionSlug } from "payload";

/**
 * Kitchen Sink Page
 *
 * This page demonstrates EVERY block type available in the page builder,
 * in as many configurations as possible. Use this as a reference for what
 * is possible when building pages in the CMS.
 *
 * Block types demonstrated:
 * 1.  Content        — multiple layouts & rich text features
 * 2.  Call to Action  — rich text + up to 2 buttons
 * 3.  Media Block     — single media display
 * 4.  Archive         — collection mode & individual selection mode
 * 5.  Image Carousel  — rotating gallery with intro text
 * 6.  Event Hero      — event relationship with heading override
 * 7.  Live Stream     — embedded Twitch stream
 * 8.  Donation Tracker — live donation totals for an event
 * 9.  Sponsor Grid    — logo grid with links
 * 10. Countdown       — countdown timer to a target date
 * 11. FAQ             — accordion-style Q&A
 * 12. Form Block      — embedded form with optional intro
 *
 * Hero types: highImpact is used on this page.
 * (mediumImpact and lowImpact work identically but without the full-bleed image.)
 */

// ─── Rich Text Helpers ───────────────────────────────────────────────────────
// These helpers cut the boilerplate of Lexical JSON nodes so the seed data
// stays readable. Every helper maps 1-to-1 to a Lexical node type.

function textNode(text: string, format: number = 0) {
	return {
		type: "text",
		detail: 0,
		format,
		mode: "normal" as const,
		style: "",
		text,
		version: 1,
	};
}

function linkNode(text: string, url: string, newTab = false) {
	return {
		type: "link",
		children: [textNode(text)],
		direction: "ltr" as const,
		fields: { linkType: "custom", newTab, url },
		format: "" as const,
		indent: 0,
		version: 3,
	};
}

function headingNode(text: string, tag: "h1" | "h2" | "h3" | "h4" = "h2") {
	return {
		type: "heading",
		children: [textNode(text)],
		direction: "ltr" as const,
		format: "" as const,
		indent: 0,
		tag,
		version: 1,
	};
}

function paragraphNode(children: object[]) {
	return {
		type: "paragraph",
		children,
		direction: "ltr" as const,
		format: "" as const,
		indent: 0,
		textFormat: 0,
		version: 1,
	};
}

function listNode(type: "bullet" | "number", items: string[]) {
	return {
		type: "list",
		children: items.map((item) => ({
			type: "listitem",
			children: [textNode(item)],
			direction: "ltr" as const,
			format: "" as const,
			indent: 0,
			value: 1,
			version: 1,
		})),
		direction: "ltr" as const,
		format: "" as const,
		indent: 0,
		listType: type,
		start: 1,
		tag: type === "number" ? "ol" : "ul",
		version: 1,
	};
}

function quoteNode(text: string) {
	return {
		type: "quote",
		children: [textNode(text)],
		direction: "ltr" as const,
		format: "" as const,
		indent: 0,
		version: 1,
	};
}

/** Block-level media node inside rich text (via BlocksFeature). */
function mediaBlockNode(mediaId: number | string) {
	return {
		type: "block",
		version: 2,
		format: "" as const,
		fields: {
			id: Math.random().toString(36).slice(2, 14),
			blockName: "",
			blockType: "mediaBlock",
			media: mediaId,
		},
	};
}

/** Inline upload node — an image embedded directly in rich text (via UploadFeature). */
function uploadNode(mediaId: number | string) {
	return {
		type: "upload",
		version: 3,
		format: "" as const,
		id: Math.random().toString(36).slice(2, 14),
		fields: null,
		relationTo: "media",
		value: mediaId,
	};
}

function richText(...children: object[]) {
	return {
		root: {
			type: "root",
			children,
			direction: "ltr" as const,
			format: "" as const,
			indent: 0,
			version: 1,
		},
	};
}

// Lexical format bit-flags
const BOLD = 1;
const ITALIC = 2;
const STRIKETHROUGH = 4;
const UNDERLINE = 8;
const CODE_FORMAT = 16;
const BOLD_ITALIC = BOLD | ITALIC; // 3

// ─── Page Generator ──────────────────────────────────────────────────────────

export async function kitchenSinkPage(payload: BasePayload): Promise<RequiredDataFromCollectionSlug<"pages">> {
	// ── Gather reusable data ────────────────────────────────────────────────
	const mediaItems = (
		await payload.find({
			collection: "media",
			limit: 10,
			sort: "-createdAt",
		})
	).docs;

	/** Safe media-id getter that wraps around the available items. */
	const img = (index: number) => mediaItems[index % mediaItems.length]?.id;

	// Try to find an event (needed by eventHeroBlock & donationTrackerBlock)
	const events = (await payload.find({ collection: "events", limit: 1 })).docs;
	const eventId = events[0]?.id;

	// Try to find a form (needed by formBlock)
	const forms = (await payload.find({ collection: "forms", limit: 1 })).docs;
	const formId = forms[0]?.id;

	// Try to find posts (needed by the archive "selection" mode)
	const posts = (await payload.find({ collection: "posts", limit: 3 })).docs;

	// ── HERO (highImpact) ───────────────────────────────────────────────────
	const heroData: any = {
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

	// ── LAYOUT BLOCKS ───────────────────────────────────────────────────────
	const layout: any[] = [];

	// =====================================================================
	//  1 · CONTENT — Full-width intro heading
	// =====================================================================
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

	// =====================================================================
	//  2 · CONTENT — Three equal columns (oneThird × 3)
	// =====================================================================
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

	// =====================================================================
	//  3 · CONTENT — Two equal columns (half + half)
	// =====================================================================
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

	// =====================================================================
	//  4 · CONTENT — Two-thirds + One-third
	// =====================================================================
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

	// =====================================================================
	//  5 · CONTENT — One-third + Two-thirds (reversed)
	// =====================================================================
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

	// =====================================================================
	//  6 · CONTENT — Full-width rich text showcase (every formatting option)
	// =====================================================================
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

	// =====================================================================
	//  7 · CONTENT — Columns with CTA links enabled
	// =====================================================================
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

	// =====================================================================
	//  8 · CONTENT — Four columns wrapping (oneThird × 4)
	// =====================================================================
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

	// =====================================================================
	//  9 · CONTENT — Mixed column widths (half + oneThird)
	// =====================================================================
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

	// =====================================================================
	//  10 · CONTENT — Stacked full-width sections in one block
	// =====================================================================
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

	// =====================================================================
	//  11 · CONTENT — Block Styling: Card Background
	// =====================================================================
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

	// =====================================================================
	//  11b · CONTENT — Block Styling: Primary Background, Full-Bleed
	// =====================================================================
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

	// =====================================================================
	//  11c · CONTENT — Block Styling: Brand Colour (Blue)
	// =====================================================================
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

	// =====================================================================
	//  11d · CONTENT — Block Styling: Custom Colour
	// =====================================================================
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

	// =====================================================================
	//  11e · CONTENT — Block Styling: Muted + Small Padding + No bleed
	// =====================================================================
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

	// =====================================================================
	//  11f · CONTENT — Background Image with Dark Overlay
	// =====================================================================
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

	// =====================================================================
	//  11g · CONTENT — Background Image with Colour + Columns
	// =====================================================================
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

	// =====================================================================
	//  11h · CONTENT — Background Image with Light Overlay (contained)
	// =====================================================================
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

	// =====================================================================
	//  11i · CONTENT — Text, Image, Text (rich text media flow)
	// =====================================================================
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

	// =====================================================================
	//  11j · CONTENT — Image Left, Text Right
	// =====================================================================
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

		// Reversed: Text Left, Image Right
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

	// =====================================================================
	//  11k · CONTENT — Image Gallery in Columns
	// =====================================================================
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

		// Two-column image comparison
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

	// =====================================================================
	//  12 · CALL TO ACTION
	// =====================================================================
	layout.push({
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
	});

	// =====================================================================
	//  13 · MEDIA BLOCK
	// =====================================================================
	if (mediaItems.length > 0) {
		layout.push({
			blockName: "Media Block",
			blockType: "mediaBlock",
			media: img(1),
		});
	}

	// =====================================================================
	//  14 · ARCHIVE — Populated by collection
	// =====================================================================
	layout.push({
		blockName: "Archive: Auto-populated from Posts Collection",
		blockType: "archive",
		categories: [],
		populateBy: "collection",
		relationTo: "posts",
		limit: 6,
		introContent: richText(
			headingNode("Archive Block — Collection Mode", "h3"),
			paragraphNode([
				textNode(
					"This Archive block auto-populates from the Posts collection. It displays up to 6 posts with pagination. You can also filter by category.",
				),
			]),
		),
	});

	// =====================================================================
	//  15 · ARCHIVE — Individual selection
	// =====================================================================
	if (posts.length > 0) {
		layout.push({
			blockName: "Archive: Hand-picked Posts",
			blockType: "archive",
			populateBy: "selection",
			selectedDocs: posts.map((post) => ({
				relationTo: "posts" as const,
				value: post.id,
			})),
			introContent: richText(
				headingNode("Archive Block — Selection Mode", "h3"),
				paragraphNode([
					textNode(
						"Instead of auto-populating, you can hand-pick specific posts to display. This is useful for curated collections or featured content sections.",
					),
				]),
			),
		});
	}

	// =====================================================================
	//  16 · IMAGE CAROUSEL
	// =====================================================================
	if (mediaItems.length >= 3) {
		layout.push({
			blockName: "Image Carousel",
			blockType: "imageCarousel",
			richText: richText(
				headingNode("Image Carousel", "h3"),
				paragraphNode([
					textNode(
						"The Image Carousel block displays a rotating gallery of images with optional introductory rich text content above it.",
					),
				]),
			),
			images: mediaItems.slice(0, 5).map((m) => ({ media: m.id })),
		});
	}

	// =====================================================================
	//  17 · EVENT HERO BLOCK
	// =====================================================================
	if (eventId) {
		layout.push({
			blockName: "Event Hero Block",
			blockType: "eventHeroBlock",
			event: eventId,
			heading: "AusSpeedruns Marathon 2026",
		});
	} else {
		layout.push({
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
		});
	}

	// =====================================================================
	//  18 · LIVE STREAM BLOCK
	// =====================================================================
	layout.push({
		blockName: "Live Stream Block",
		blockType: "liveStreamBlock",
		title: "Watch Live",
		twitchChannel: "ausspeedruns",
	});

	// =====================================================================
	//  19 · DONATION TRACKER BLOCK
	// =====================================================================
	if (eventId) {
		layout.push({
			blockName: "Donation Tracker Block",
			blockType: "donationTrackerBlock",
			event: eventId,
			title: "Donation Progress",
		});
	} else {
		layout.push({
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
		});
	}

	// =====================================================================
	//  20 · SPONSOR GRID BLOCK
	// =====================================================================
	layout.push({
		blockName: "Sponsor Grid Block",
		blockType: "sponsorGridBlock",
		title: "Our Amazing Sponsors",
		sponsors:
			mediaItems.length >= 4
				? [
						{ name: "Sponsor Alpha", logo: img(0), link: "https://example.com/alpha" },
						{ name: "Sponsor Beta", logo: img(1), link: "https://example.com/beta" },
						{ name: "Sponsor Gamma", logo: img(2), link: "https://example.com/gamma" },
						{ name: "Sponsor Delta", logo: img(3), link: "https://example.com/delta" },
					]
				: [{ name: "Example Sponsor", logo: img(0), link: "https://example.com" }],
	});

	// =====================================================================
	//  21 · COUNTDOWN BLOCK
	// =====================================================================
	layout.push({
		blockName: "Countdown Block",
		blockType: "countdownBlock",
		title: "Next Event Starts In",
		targetDate: "2026-07-01T10:00:00.000Z",
		finishedMessage: "The event is LIVE! Head to the stream!",
	});

	// =====================================================================
	//  22 · FAQ BLOCK
	// =====================================================================
	layout.push({
		blockName: "FAQ Block",
		blockType: "faqBlock",
		title: "Frequently Asked Questions",
		faqs: [
			{
				question: "What is a speedrun?",
				answer: richText(
					paragraphNode([
						textNode("A speedrun is playing a video game with the goal of completing it as "),
						textNode("fast as possible", BOLD),
						textNode(
							". Speedrunners use various techniques, glitches, and optimised routes to achieve the lowest possible time.",
						),
					]),
				),
			},
			{
				question: "How can I get involved with AusSpeedruns?",
				answer: richText(
					paragraphNode([textNode("There are many ways to participate:")]),
					listNode("bullet", [
						"Submit a run for an upcoming event",
						"Volunteer to help during a marathon",
						"Donate to charity during a live event",
						"Join our Discord community",
					]),
				),
			},
			{
				question: "When is the next event?",
				answer: richText(
					paragraphNode([
						textNode("Check the "),
						linkNode("events page", "/events"),
						textNode(
							" for upcoming event dates and details. We typically run several events per year, including our flagship marathon.",
						),
					]),
				),
			},
			{
				question: "Are events in-person or online?",
				answer: richText(
					paragraphNode([
						textNode("We run both! Our major marathons are usually "),
						textNode("in-person", BOLD),
						textNode(
							" events held in Australian cities, while smaller events and community showcases may be ",
						),
						textNode("online", BOLD),
						textNode(". All events are streamed live on "),
						linkNode("Twitch", "https://twitch.tv/ausspeedruns", true),
						textNode("."),
					]),
				),
			},
			{
				question: "Where does the donation money go?",
				answer: richText(
					paragraphNode([
						textNode(
							"100% of donations go directly to our charity partner. AusSpeedruns covers operational costs through sponsorships and merchandise sales.",
						),
					]),
				),
			},
		],
	});

	// =====================================================================
	//  23 · FORM BLOCK
	// =====================================================================
	if (formId) {
		layout.push({
			blockName: "Form Block",
			blockType: "formBlock",
			form: formId,
			enableIntro: true,
			introContent: richText(
				headingNode("Contact Us", "h3"),
				paragraphNode([
					textNode(
						"The Form Block embeds a form created in the Forms collection. It supports an optional intro content area above the form fields.",
					),
				]),
			),
		});
	} else {
		layout.push({
			blockName: "Form Block (placeholder — no forms found)",
			blockType: "content",
			columns: [
				{
					size: "full",
					richText: richText(
						headingNode("Form Block", "h3"),
						paragraphNode([
							textNode("The "),
							textNode("formBlock", CODE_FORMAT),
							textNode(" requires a Form relationship. Create a Form in the admin dashboard ("),
							linkNode("Forms collection", "/admin/collections/forms"),
							textNode("), then add this block to display it on a page with optional intro content."),
						]),
					),
				},
			],
		});
	}

	// =====================================================================
	//  24 · CONTENT — Final summary (proving Content can replace blocks)
	// =====================================================================
	layout.push({
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
	});

	// ── Return the complete page ────────────────────────────────────────────
	return {
		slug: "kitchen-sink",
		_status: "published",
		title: "Kitchen Sink",
		meta: {
			description:
				"A comprehensive demonstration of every block type and configuration available in the AusSpeedruns page builder. Use this as a reference for your team.",
			image: img(0),
			title: "Kitchen Sink — Every Block & Configuration",
		},
		hero: heroData,
		layout,
	};
}
