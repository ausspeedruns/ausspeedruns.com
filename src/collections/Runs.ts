import { anyone } from "#access/anyone.ts";
import { manageContent } from "#access/manageContent.ts";
import type { CollectionConfig } from "payload";

export const Runs: CollectionConfig = {
	slug: "runs",
	admin: {
		useAsTitle: "game",
	},
	access: {
		create: manageContent,
		delete: manageContent,
		read: anyone,
		update: manageContent,
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
			name: "runners",
			type: "relationship",
			relationTo: "users",
			hasMany: true,
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
			timezone: {
				defaultTimezone: "Australia/Melbourne",
				supportedTimezones: [
					{ label: "Melbourne", value: "Australia/Melbourne" },
					{ label: "Sydney", value: "Australia/Sydney" },
					{ label: "Adelaide", value: "Australia/Adelaide" },
					{ label: "Brisbane", value: "Australia/Brisbane" },
					{ label: "Perth", value: "Australia/Perth" },
					{ label: "Hobart", value: "Australia/Hobart" },
					{ label: "Darwin", value: "Australia/Darwin" },
					{ label: "New Zealand", value: "Pacific/Auckland" },
				],
			},
		},
		{
			name: "otherRunners",
			type: "text",
			admin: {
				description: "Comma-separated list of other runners who do not have a user account in the system.",
			},
		},
		{
			name: "submission",
			type: "relationship",
			relationTo: "submissions",
		},
		{
			name: "donationIncentives",
			type: "relationship",
			relationTo: "incentives",
			hasMany: true,
		},
		// TODO: Remove this field after migration is complete
		{
			name: "legacyKeystoneId",
			type: "text",
			unique: true,
		},
	],
};
