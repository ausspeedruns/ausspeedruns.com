import { authenticated } from "#access/authenticated.ts";
import { sameUserOrManageContent } from "#access/field/sameUserOrManageContent.ts";
import type { CollectionConfig } from "payload";

export const Submissions: CollectionConfig = {
	slug: "submissions",
	admin: {
		useAsTitle: "game",
	},
	access: {
		create: authenticated,
		delete: sameUserOrManageContent,
		read: sameUserOrManageContent,
		update: sameUserOrManageContent,
	},
	fields: [
		{
			name: "runner",
			type: "relationship",
			relationTo: "users",
			required: true,
		},
		{
			name: "game",
			type: "text",
			required: true,
		},
		{
			name: "ageRating",
			type: "select",
			options: [
				{ label: "G, PG or M", value: "m_or_lower" },
				{ label: "MA15+", value: "ma15" },
				{ label: "R18+", value: "r18" },
			],
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
			name: "techPlatform",
			type: "text",
		},
		{
			name: "estimate",
			type: "text",
			required: true,
		},
		{
			name: "possibleEstimate",
			type: "text",
		},
		{
			name: "possibleEstimateReason",
			type: "text",
		},
		{
			name: "event",
			type: "relationship",
			relationTo: "events",
		},
		{
			name: "specialRequirements",
			type: "textarea",
		},
		{
			name: "donationIncentives",
			type: "json",
		},
		{
			name: "raceType",
			type: "select",
			options: [
				{
					label: "No Race",
					value: "noRace",
				},
				{
					label: "Possible Solo",
					value: "solo",
				},
				{
					label: "Only Race/Coop",
					value: "only",
				},
			],
			defaultValue: "noRace",
		},
		{
			name: "racer",
			type: "text",
		},
		{
			name: "isCoop",
			type: "checkbox",
		},
		{
			name: "video",
			type: "text",
		},
		{
			name: "status",
			type: "select",
			options: [
				{
					label: "Pending",
					value: "pending",
				},
				{
					label: "Accepted",
					value: "accepted",
				},
				{
					label: "Rejected",
					value: "rejected",
				},
				{
					label: "Backup",
					value: "backup",
				},
			],
			defaultValue: "pending",
		},
		{
			name: "availability",
			type: "json",
		},
		{
			name: "canBackup",
			type: "checkbox",
		},
		// TODO: Remove this field after migration is complete
		{
			name: "legacyKeystoneId",
			type: "text",
			unique: true,
		},
	],
};
