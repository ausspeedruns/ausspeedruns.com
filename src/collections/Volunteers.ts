import { authenticated } from "#access/authenticated.ts";
import { sameUserOrManageContent } from "#access/field/sameUserOrManageContent.ts";
import type { CollectionConfig } from "payload";

export const Volunteers: CollectionConfig = {
	slug: "volunteers",
	admin: {
		useAsTitle: "volunteer",
	},
	access: {
		create: authenticated,
		delete: sameUserOrManageContent,
		read: sameUserOrManageContent,
		update: sameUserOrManageContent,
	},
	fields: [
		{
			name: "volunteer",
			type: "relationship",
			relationTo: "users",
		},
		{
			name: "event",
			type: "relationship",
			relationTo: "events",
		},
		{
			name: "role",
			type: "select",
			required: true,
			hasMany: true,
			options: [
				{
					label: "Front Desk",
					value: "frontDesk",
				},
				{
					label: "Host",
					value: "host",
				},
				{
					label: "Tech",
					value: "tech",
				},
				{
					label: "Stage Hand",
					value: "stageHand",
				},
			],
		},
		{
			name: "availability",
			type: "array",
			fields: [
				{
					name: "time",
					type: "text",
				},
			],
		},
		{
			name: "maximumTime",
			type: "number",
		},
		{
			type: "tabs",
			tabs: [
				{
					label: "Host",
					fields: [
						{
							name: "maxDailyHostTime",
							type: "number",
						},
						{
							name: "hostSpecificGame",
							type: "text",
						},
						{
							name: "hostSpecificRunner",
							type: "text",
						},
						{
							name: "hostOtherInformation",
							type: "textarea",
						},
					],
				},
				{
					label: "Tech",
					fields: [
						{
							name: "techExperience",
							type: "textarea",
						},
					],
				},
				{
					label: "Stage Hand",
					description: "Currently only requires their availability.",
					fields: [],
				},
				{
					label: "Runner Management",
					description: "Currently only requires their availability.",
					fields: [],
				},
			],
		},
	],
};
