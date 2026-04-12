import type { Block } from "payload";

export const PostEventStatsBlockConfig: Block = {
	slug: "postEventStatsBlock",
	interfaceName: "PostEventStatsBlock",
	fields: [
		{
			name: "title",
			type: "text",
			defaultValue: "Quick stats",
		},
		{
			name: "totalRuns",
			type: "number",
			required: true,
		},
		{
			name: "uniqueRunners",
			type: "number",
			required: true,
		},
		{
			name: "totalRunDuration",
			type: "text",
			required: true,
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
