import type { Block } from "payload";

import { FixedToolbarFeature, HeadingFeature, InlineToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical";

const sourceOptions = [
	{ label: "Uploaded media", value: "upload" },
	{ label: "External URL", value: "external" },
];

export const EventImagesBlockConfig: Block = {
	slug: "eventImagesBlock",
	interfaceName: "EventImagesBlock",
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
					name: "sourceType",
					type: "radio",
					defaultValue: "upload",
					options: sourceOptions,
					admin: {
						layout: "horizontal",
					},
				},
				{
					name: "uploadMedia",
					type: "upload",
					relationTo: "media",
					admin: {
						condition: (_, siblingData) => siblingData?.sourceType === "upload",
					},
					validate: (
						value: unknown,
						{ siblingData }: { siblingData?: { sourceType?: "upload" | "external" } },
					) => {
						if (siblingData?.sourceType === "upload" && !value) {
							return "Please select an uploaded image.";
						}

						return true;
					},
				},
				{
					name: "externalUrl",
					type: "text",
					label: "External image URL",
					admin: {
						condition: (_, siblingData) => siblingData?.sourceType === "external",
						description: "Use for images hosted in offsite photo apps.",
					},
					validate: (
						value: unknown,
						{ siblingData }: { siblingData?: { sourceType?: "upload" | "external" } },
					) => {
						if (siblingData?.sourceType !== "external") {
							return true;
						}

						if (!value || typeof value !== "string") {
							return "Please provide an external image URL.";
						}

						try {
							new URL(value);
							return true;
						} catch {
							return "Please enter a valid URL.";
						}
					},
				},
				{
					name: "caption",
					type: "text",
					label: "Caption",
				},
			],
		},
	],
	labels: {
		plural: "Event Images",
		singular: "Event Images",
	},
};
