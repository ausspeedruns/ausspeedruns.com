import { headingNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkArchiveSections({ posts }: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	const layout: KitchenSinkLayoutBlock[] = [
		{
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
		},
	];

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

	return layout;
}
