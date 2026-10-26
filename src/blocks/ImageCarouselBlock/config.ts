import type { Block } from "payload";

import { FixedToolbarFeature, HeadingFeature, InlineToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical";

export const ImageCarousel: Block = {
	slug: "imageCarousel",
	interfaceName: "ImageCarouselBlock",
	fields: [
		{
			name: "richText",
			type: "richText",
			editor: lexicalEditor({
				features: ({ rootFeatures, defaultFeatures }) => {
					return [
						...rootFeatures,
						...defaultFeatures,
						HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
						FixedToolbarFeature(),
						InlineToolbarFeature(),
					];
				},
			}),
			label: false,
		},
		{
			name: "images",
			type: "array",
			label: "Images",
			minRows: 1,
			fields: [
				{
					name: "media",
					type: "upload",
					relationTo: "media",
					required: true,
				},
			],
		},
	],
	labels: {
		plural: "Image Carousels",
		singular: "Image Carousel",
	},
};
