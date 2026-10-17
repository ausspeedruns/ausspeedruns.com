import type { Block } from "payload";

export const EventHeroBlockConfig: Block = {
	slug: "eventHeroBlock",
	interfaceName: "EventHeroBlock",
	fields: [
		{ name: "event", type: "relationship", relationTo: "events", required: true, label: "Event" },
		{ name: "heading", type: "text", label: "Heading Override" },
		{ name: "subheading", type: "text", label: "Subheading" },
		{
			name: "showDates",
			type: "checkbox",
			label: "Show event dates",
			defaultValue: true,
		},
		{
			name: "showRecapStats",
			type: "checkbox",
			label: "Show recap stats",
			defaultValue: false,
			admin: {
				description: "Shows total raised, runs, runners and hours of content, calculated from the event.",
			},
		},
		{
			name: "links",
			type: "array",
			label: "Buttons",
			fields: [
				{ name: "label", type: "text", required: true },
				{ name: "url", type: "text", required: true },
			],
		},
	],
};
