import type { Block } from "payload";

export const PostEventStatsBlockConfig: Block = {
	slug: "postEventStatsBlock",
	interfaceName: "PostEventStatsBlock",
	fields: [
		{
			name: "title",
			type: "text",
			defaultValue: "The runs",
		},
		{
			name: "event",
			type: "relationship",
			relationTo: "events",
			admin: {
				description: "When set, stats and the run list are calculated from the event's runs.",
			},
		},
		{
			name: "showStats",
			type: "checkbox",
			label: "Show stats cards",
			defaultValue: true,
		},
		{
			name: "showRunList",
			type: "checkbox",
			label: "Show run list",
			defaultValue: true,
			admin: {
				condition: (_, siblingData) => Boolean(siblingData?.event),
			},
		},
		{
			type: "collapsible",
			label: "Manual stats (used when no event is selected)",
			admin: { initCollapsed: true },
			fields: [
				{ name: "totalRuns", type: "number" },
				{ name: "uniqueRunners", type: "number" },
				{ name: "totalRunDuration", type: "text" },
			],
		},
		{
			name: "scheduleUrl",
			type: "text",
		},
		{
			name: "scheduleLabel",
			type: "text",
			defaultValue: "View schedule",
		},
	],
	labels: {
		singular: "Post-Event Stats",
		plural: "Post-Event Stats",
	},
};
