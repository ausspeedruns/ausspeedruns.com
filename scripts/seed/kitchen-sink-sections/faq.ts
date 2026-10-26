import { createLorem } from "../lorem.ts";
import { BOLD, ITALIC, linkNode, listNode, paragraphNode, quoteNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock } from "./types.ts";

export function buildKitchenSinkFaqSections(): KitchenSinkLayoutBlock[] {
	const lorem = createLorem(2200);

	return [
		{
			blockName: "FAQ: Many Questions, Rich Answers",
			demo: "Six questions whose answers use bold text, lists, links, a quote and multiple paragraphs.",
			blockType: "faqBlock",
			title: lorem.title(3),
			faqs: [
				{
					question: lorem.question(),
					answer: richText(
						paragraphNode([
							textNode(`${lorem.sentence()} `),
							textNode(lorem.words(3), BOLD),
							textNode(` ${lorem.sentence()}`),
						]),
					),
				},
				{
					question: lorem.question(),
					answer: richText(paragraphNode([textNode(lorem.sentence())]), listNode("bullet", lorem.items(4))),
				},
				{
					question: lorem.question(),
					answer: richText(
						paragraphNode([
							textNode(`${lorem.phrase(3)} `),
							linkNode(lorem.words(2), "/events"),
							textNode(` ${lorem.sentence()} `),
							linkNode(lorem.words(2), "https://example.com", true),
							textNode("."),
						]),
					),
				},
				{
					question: lorem.question(14),
					answer: richText(
						paragraphNode([textNode(lorem.paragraph(2))]),
						quoteNode(lorem.sentence(12)),
						paragraphNode([textNode(lorem.sentence(), ITALIC)]),
					),
				},
				{
					question: lorem.question(4),
					answer: richText(
						paragraphNode([textNode(lorem.paragraph(4))]),
						paragraphNode([textNode(lorem.paragraph(3))]),
					),
				},
				{
					question: lorem.question(),
					answer: richText(listNode("number", lorem.items(3))),
				},
			],
		},
		{
			blockName: "FAQ: Short, Plain Answers",
			demo: "Two questions with one-line answers and a custom title.",
			blockType: "faqBlock",
			title: lorem.title(2),
			faqs: Array.from({ length: 2 }, () => ({
				question: lorem.question(),
				answer: richText(paragraphNode([textNode(lorem.sentence())])),
			})),
		},
	];
}
