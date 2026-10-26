import type { Block, Field } from "payload";

import { BlocksFeature, FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical";

import { link } from "#fields/link.ts";
import { MediaBlock as MediaBlockConfig } from "#blocks/MediaBlock/config.ts";

const columnFields: Field[] = [
	{
		name: "size",
		type: "select",
		defaultValue: "oneThird",
		options: [
			{
				label: "One Third",
				value: "oneThird",
			},
			{
				label: "Half",
				value: "half",
			},
			{
				label: "Two Thirds",
				value: "twoThirds",
			},
			{
				label: "Full",
				value: "full",
			},
		],
	},
	{
		name: "richText",
		type: "richText",
		editor: lexicalEditor({
			features: ({ rootFeatures, defaultFeatures }) => {
				return [
					...rootFeatures,
					...defaultFeatures,
					BlocksFeature({ blocks: [MediaBlockConfig] }),
					FixedToolbarFeature(),
					InlineToolbarFeature(),
				];
			},
		}),
		label: false,
	},
	{
		name: "enableLink",
		type: "checkbox",
	},
	link({
		overrides: {
			admin: {
				condition: (_data, siblingData) => {
					return Boolean(siblingData?.enableLink);
				},
			},
		},
	}),
];

export const Content: Block = {
	slug: "content",
	interfaceName: "ContentBlock",
	fields: [
		{
			name: "columns",
			type: "array",
			admin: {
				initCollapsed: true,
			},
			fields: columnFields,
		},
		{
			name: "settings",
			type: "group",
			label: "Block Styling",
			admin: {
				description: "Control the visual appearance of this content section.",
			},
			fields: [
				{
					name: "background",
					type: "select",
					label: "Background",
					defaultValue: "none",
					options: [
						{ label: "None (transparent)", value: "none" },
						{ label: "Card", value: "card" },
						{ label: "Muted", value: "muted" },
						{ label: "Primary", value: "primary" },
						{ label: "Secondary", value: "secondary" },
						{ label: "AusSpeedruns Blue", value: "blue" },
						{ label: "AusSpeedruns Orange", value: "orange" },
						{ label: "Custom Colour", value: "custom" },
					],
				},
				{
					name: "customBackgroundColor",
					type: "text",
					label: "Custom Background Colour",
					admin: {
						condition: (_data, siblingData) => siblingData?.background === "custom",
						description: "Any valid CSS colour value (e.g. #1a1a2e, rgb(26,26,46), hsl(240 50% 14%)).",
					},
				},
				{
					name: "backgroundImage",
					type: "upload",
					relationTo: "media",
					label: "Background Image",
					admin: {
						description:
							"Upload an image to use as the section background. Works alongside or instead of a background colour.",
					},
				},
				{
					name: "backgroundImageOverlay",
					type: "select",
					label: "Image Overlay",
					defaultValue: "dark50",
					admin: {
						condition: (_data, siblingData) => Boolean(siblingData?.backgroundImage),
						description: "A semi-transparent overlay on top of the background image to keep text readable.",
					},
					options: [
						{ label: "None", value: "none" },
						{ label: "Dark 25%", value: "dark25" },
						{ label: "Dark 50%", value: "dark50" },
						{ label: "Dark 75%", value: "dark75" },
						{ label: "Light 25%", value: "light25" },
						{ label: "Light 50%", value: "light50" },
					],
				},
				{
					name: "textColor",
					type: "select",
					label: "Text Colour",
					defaultValue: "auto",
					admin: {
						description:
							"Auto picks light or dark text based on the background. Override if auto gets it wrong.",
					},
					options: [
						{ label: "Auto (inherits from page)", value: "auto" },
						{ label: "Light", value: "light" },
						{ label: "Dark", value: "dark" },
					],
				},
				{
					name: "padding",
					type: "select",
					label: "Vertical Padding",
					defaultValue: "default",
					options: [
						{ label: "None", value: "none" },
						{ label: "Small", value: "small" },
						{ label: "Default", value: "default" },
						{ label: "Large", value: "large" },
					],
				},
				{
					name: "fullBleed",
					type: "checkbox",
					label: "Full-Bleed Background",
					defaultValue: false,
					admin: {
						description: "When enabled, the background extends edge-to-edge. The content remains centred.",
						condition: (_data, siblingData) =>
							(Boolean(siblingData?.background) && siblingData?.background !== "none") ||
							Boolean(siblingData?.backgroundImage),
					},
				},
			],
		},
	],
};
