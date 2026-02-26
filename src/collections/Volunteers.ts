import type { CollectionConfig } from "payload";

export const Volunteers: CollectionConfig = {
	slug: "volunteers",
	admin: {
		useAsTitle: "volunteer",
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
			options: [
				{
					label: "Runner Management",
					value: "runnerManagement",
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
					label: "Social Media",
					value: "socialMedia",
				},
			],
		},
		{
			name: "availability",
			type: "json",
		},
		{
			type: "tabs",
			tabs: [
				{
					label: "Host",
					fields: [
						{
							name: "eventHostTime",
							type: "number",
						},
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
					label: "Social Media",
					fields: [
						{
							name: "socialMediaExperience",
							type: "textarea",
						},
						{
							name: "socialMediaFavouriteMeme",
							type: "text",
						},
					],
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
