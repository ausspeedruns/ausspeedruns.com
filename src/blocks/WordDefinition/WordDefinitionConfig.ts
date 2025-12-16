import type { Block } from "payload";

import { FixedToolbarFeature, HeadingFeature, InlineToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical";

export const WordDefinition: Block = {
	slug: "wordDefinition",
	interfaceName: "WordDefinitionBlock",
	fields: [
		{
			name: "word",
			type: "text",
			required: true,
			label: "Word",
		},
		{
			name: "pronunciation",
			type: "text",
			label: "Pronunciation",
		},
		{
			name: "definition",
			type: "richText",
			editor: lexicalEditor({
				features: ({ rootFeatures }) => {
					return [
						...rootFeatures,
						HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
						FixedToolbarFeature(),
						InlineToolbarFeature(),
					];
				},
			}),
			label: "Definition",
		},
	],
	labels: {
		plural: "Word Definitions",
		singular: "Word Definition",
	},
};
