import type { Block } from "payload";

export const FAQBlockConfig: Block = {
	slug: "faqBlock",
	imageURL: "/block-thumbnails/faqBlock.webp",
	imageAltText: "Expandable FAQ questions",
	interfaceName: "FAQBlock",
	fields: [
		{ name: "title", type: "text", label: "Title", defaultValue: "Frequently Asked Questions" },
		{
			name: "faqs",
			type: "array",
			label: "FAQs",
			fields: [
				{ name: "question", type: "text", required: true },
				{ name: "answer", type: "richText", required: true },
			],
		},
	],
};
