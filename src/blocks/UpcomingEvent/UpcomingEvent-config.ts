import type { Block } from "payload";

import { FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical";

export const UpcomingEvent: Block = {
	slug: "upcomingEvent",
	interfaceName: "UpcomingEventBlock",
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
			name: "eventStartDate",
			type: "date",
			label: "Event Start Date",
			required: true,
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
			name: "eventDates",
			type: "text",
			label: "Event Dates",
		},
		{
			name: "eventBackgroundImage",
			type: "upload",
			relationTo: "media",
			label: "Event Background Image",
			required: true,
		},
	],
	labels: {
		plural: "Upcoming Events",
		singular: "Upcoming Event",
	},
};
