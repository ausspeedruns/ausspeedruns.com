import type { Block } from "payload";

export const EventFeatureBlockConfig: Block = {
	slug: "eventFeatureBlock",
	imageURL: "/block-thumbnails/eventFeatureBlock.webp",
	imageAltText: "Compact event card with logo and amount raised",
	interfaceName: "EventFeatureBlock",
	labels: {
		singular: "Event Feature",
		plural: "Event Features",
	},
	fields: [
		{ name: "event", type: "relationship", relationTo: "events", required: true },
		{
			name: "description",
			type: "textarea",
			admin: { description: "Optional short text shown under the event name." },
		},
		{
			type: "row",
			fields: [
				{ name: "showDates", type: "checkbox", label: "Show dates", defaultValue: true },
				{
					name: "showCountdown",
					type: "checkbox",
					label: "Show countdown",
					defaultValue: false,
					admin: { description: "Counts down to the event start. Hidden once the event starts." },
				},
				{
					name: "showRaised",
					type: "checkbox",
					label: "Show amount raised",
					defaultValue: true,
					admin: { description: "Only shown when the event has a raised amount." },
				},
			],
		},
		{
			type: "row",
			fields: [
				{
					name: "buttonLabel",
					type: "text",
					admin: { description: "Defaults to the event short name." },
				},
				{
					name: "buttonUrl",
					type: "text",
					admin: { description: "Defaults to /{event short name}." },
				},
			],
		},
		{
			name: "extraLinks",
			type: "array",
			label: "Extra buttons",
			fields: [
				{ name: "label", type: "text", required: true },
				{ name: "url", type: "text", required: true },
			],
		},
	],
};
