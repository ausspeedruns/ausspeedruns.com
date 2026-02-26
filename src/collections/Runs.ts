import type { CollectionConfig } from "payload";

export const Runs: CollectionConfig = {
	slug: "runs",
	admin: {
		useAsTitle: "game",
	},
	fields: [
		{
			name: "game",
			type: "text",
			required: true,
		},
		{
			name: "category",
			type: "text",
			required: true,
		},
		{
			name: "platform",
			type: "text",
			required: true,
		},
		{
			name: "runner",
			type: "relationship",
			relationTo: "users",
		},
		{
			name: "estimate",
			type: "text",
			required: true,
		},
		{
			name: "time",
			type: "text",
		},
		{
			name: "event",
			type: "relationship",
			relationTo: "events",
		},
		{
			name: "youtube",
			type: "text",
		},
		{
			name: "twitch",
			type: "text",
		},
		{
			name: "specialRequirements",
			type: "textarea",
		},
		{
			name: "isRace",
			type: "checkbox",
		},
		{
			name: "isCoop",
			type: "checkbox",
		},
		{
			name: "techPlatform",
			type: "text",
		},
		{
			name: "scheduledTime",
			type: "date",
			admin: {
				date: {
					pickerAppearance: "dayAndTime",
					timeIntervals: 5,
				},
			},
		},
		{
			name: "racers",
			type: "text",
		},
		{
			name: "submission",
			type: "relationship",
			relationTo: "submissions",
		},
		// TODO: Remove this field after migration is complete
		{
			name: "legacyKeystoneId",
			type: "text",
			unique: true,
		},
	],
};
