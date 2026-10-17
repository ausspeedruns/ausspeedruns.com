import type { Block } from "payload";

export const VodHighlightsBlockConfig: Block = {
	slug: "vodHighlightsBlock",
	interfaceName: "VodHighlightsBlock",
	fields: [
		{ name: "title", type: "text", defaultValue: "Watch the runs" },
		{ name: "event", type: "relationship", relationTo: "events", required: true },
		{
			name: "specificRuns",
			type: "relationship",
			relationTo: "runs",
			hasMany: true,
			admin: {
				description:
					"Optional. Pick runs to feature; otherwise runs with a YouTube VOD are shown in schedule order.",
			},
		},
		{ name: "limit", type: "number", defaultValue: 6, min: 1, max: 48 },
		{
			name: "playlistUrl",
			type: "text",
			label: "Playlist / channel URL",
			admin: { description: "Shown as a 'view all' link." },
		},
	],
	labels: {
		singular: "VOD Highlights",
		plural: "VOD Highlights",
	},
};
