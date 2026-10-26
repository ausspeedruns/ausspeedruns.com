import type { Block } from "payload";

export const RandomRunBlockConfig: Block = {
	slug: "randomRunBlock",
	interfaceName: "RandomRunBlock",
	fields: [
		{
			name: "specificEvent",
			type: "relationship",
			relationTo: "events",
			required: true,
			label: "Specific Event",
		},
		{
			name: "specificRuns",
			type: "relationship",
			relationTo: "runs",
			hasMany: true,
		},
	],
};
