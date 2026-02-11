import type { Block } from "payload";

import { FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical";

export const RecentEvent: Block = {
	slug: "recentEvent",
	interfaceName: "RecentEventBlock",
	fields: [
		{
			name: "richText",
			type: "richText",
			editor: lexicalEditor({
				features: ({ rootFeatures, defaultFeatures }) => {
					return [...rootFeatures, ...defaultFeatures, InlineToolbarFeature(), FixedToolbarFeature()];
				},
			}),
			label: false,
		},
		{
			name: "eventLogo",
			type: "upload",
			relationTo: "media",
			label: "Event Logo",
			required: true,
		},
		{
			name: "eventName",
			type: "text",
			label: "Event Name",
			required: true,
		},
		{
			name: "eventRaised",
			type: "text",
			label: "Event Raised",
			required: true,
		},
		{
			name: "eventBackgroundImage",
			type: "upload",
			relationTo: "media",
			label: "Event Background Image",
			required: true,
		}
	],
	labels: {
		plural: "Recent Events",
		singular: "Recent Event",
	},
};
