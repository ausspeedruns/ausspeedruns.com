import { createLorem } from "../lorem.ts";
import { headingNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkArchiveSections({
	posts,
	categoryIds,
}: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	const lorem = createLorem(700);
	const intro = (tag: "h2" | "h3" = "h3") =>
		richText(headingNode(lorem.title(3), tag), paragraphNode([textNode(lorem.sentence())]));

	const layout: KitchenSinkLayoutBlock[] = [
		{
			blockName: "Archive: All Posts (collection, limit 6)",
			demo: "Populate by: Collection. Shows the latest 6 posts, with intro text.",
			blockType: "archive",
			populateBy: "collection",
			relationTo: "posts",
			categories: [],
			limit: 6,
			introContent: intro("h2"),
		},
	];

	if (categoryIds.length > 0) {
		layout.push({
			blockName: "Archive: Filtered by Category (collection, limit 3)",
			demo: "Populate by: Collection, filtered to one category and limited to 3 posts.",
			blockType: "archive",
			populateBy: "collection",
			relationTo: "posts",
			categories: [categoryIds[0]],
			limit: 3,
			introContent: intro(),
		});
	}

	if (posts.length > 0) {
		layout.push(
			{
				blockName: "Archive: Hand-picked Posts (selection)",
				demo: "Populate by: Individual Selection. Three hand-picked posts.",
				blockType: "archive",
				populateBy: "selection",
				selectedDocs: posts.slice(0, 3).map((post) => ({ relationTo: "posts" as const, value: post.id })),
				introContent: intro(),
			},
			{
				blockName: "Archive: Single Post, No Intro (selection)",
				demo: "Individual Selection of a single post, with no intro text.",
				blockType: "archive",
				populateBy: "selection",
				selectedDocs: [{ relationTo: "posts" as const, value: posts[posts.length - 1].id }],
			},
		);
	}

	return layout;
}
