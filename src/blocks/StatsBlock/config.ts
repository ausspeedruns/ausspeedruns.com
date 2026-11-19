import type { Block } from "payload";

export const StatsBlockConfig: Block = {
	slug: "statsBlock",
	imageURL: "/block-thumbnails/statsBlock.webp",
	imageAltText: "All-time AusSpeedruns stat cards",
	interfaceName: "StatsBlock",
	labels: {
		singular: "All-time Stats",
		plural: "All-time Stats",
	},
	fields: [
		{ name: "title", type: "text", defaultValue: "AusSpeedruns so far" },
		{ name: "description", type: "textarea" },
		{
			type: "row",
			fields: [
				{ name: "showRaised", type: "checkbox", label: "Total raised", defaultValue: true },
				{ name: "showEvents", type: "checkbox", label: "Events held", defaultValue: true },
				{ name: "showRuns", type: "checkbox", label: "Runs showcased", defaultValue: true },
			],
		},
		{
			name: "extraStats",
			type: "array",
			label: "Extra stats",
			admin: { description: "Manually entered stats, e.g. 'Charities supported'." },
			fields: [
				{
					type: "row",
					fields: [
						{ name: "label", type: "text", required: true },
						{ name: "value", type: "text", required: true },
					],
				},
			],
		},
	],
};
