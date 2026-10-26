import { createLorem } from "../lorem.ts";
import { BOLD, headingNode, listNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkCtaSections({ posts }: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	const lorem = createLorem(600);
	const firstPost = posts[0];

	return [
		{
			blockName: "Call to Action: Two Links (default + outline)",
			demo: "Rich text with two buttons: a Default-style custom link and an Outline-style external link that opens in a new tab.",
			blockType: "cta",
			richText: richText(
				headingNode(lorem.title(4), "h3"),
				paragraphNode([
					textNode(`${lorem.sentence()} `),
					textNode(lorem.words(2), BOLD),
					textNode(` ${lorem.sentence()}`),
				]),
			),
			links: [
				{ link: { type: "custom", appearance: "default", label: lorem.title(2), url: "/events" } },
				{
					link: {
						type: "custom",
						appearance: "outline",
						label: lorem.title(2),
						url: "https://example.com",
						newTab: true,
					},
				},
			],
		},
		{
			blockName: "Call to Action: Single Internal Link",
			demo: "One Default-style button linking to a post as an internal reference.",
			blockType: "cta",
			richText: richText(headingNode(lorem.title(3), "h2"), paragraphNode([textNode(lorem.sentence())])),
			links: [
				{
					link: firstPost
						? {
								type: "reference",
								appearance: "default",
								label: lorem.title(3),
								reference: { relationTo: "posts", value: firstPost.id },
							}
						: { type: "custom", appearance: "default", label: lorem.title(3), url: "/posts" },
				},
			],
		},
		{
			blockName: "Call to Action: Single Outline Link, Long Text",
			demo: "Longer text with a list and a single Outline-style button.",
			blockType: "cta",
			richText: richText(
				headingNode(lorem.title(5), "h4"),
				paragraphNode([textNode(lorem.paragraph(3))]),
				listNode("bullet", lorem.items(3)),
			),
			links: [{ link: { type: "custom", appearance: "outline", label: lorem.title(1), url: "/events" } }],
		},
		{
			blockName: "Call to Action: Text Only (no links)",
			demo: "No buttons at all, just the rich text area.",
			blockType: "cta",
			richText: richText(headingNode(lorem.title(3), "h3"), paragraphNode([textNode(lorem.sentence())])),
			links: [],
		},
	];
}
