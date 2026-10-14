import type { CollectionConfig } from "payload";

import { manageContent } from "#access/manageContent.ts";
import { manageContentOrPublished } from "#access/manageContentOrPublished.ts";
import { validateDateAfter, validateColour, validateUrl, validateUrlSafe } from "#fields/validators.ts";
import { DefaultTimeZone, TimeZoneOptions } from "./Fields/TimezoneSelect.ts";

export const Events: CollectionConfig<"events"> = {
	slug: "events",
	access: {
		create: manageContent,
		delete: manageContent,
		read: manageContentOrPublished,
		update: manageContent,
	},
	admin: {
		useAsTitle: "name",
		defaultColumns: ["name", "shortName", "timeSettings.startTime", "_status"],
		group: "Event Management",
	},
	versions: {
		drafts: {
			schedulePublish: true,
		},
	},
	fields: [
		{
			type: "row",
			fields: [
				{
					name: "name",
					type: "text",
					required: true,
				},
				{
					name: "shortName",
					type: "text",
					required: true,
					unique: true,
					index: true,
					validate: validateUrlSafe,
					admin: {
						description: "Used in URLs, e.g. /schedule/ASM2026.",
					},
				},
			],
		},
		{
			type: "tabs",
			tabs: [
				{
					label: "General",
					fields: [
						{
							name: "settings",
							type: "group",
							fields: [
								{
									type: "row",
									fields: [
										{
											name: "isAcceptingSubmissions",
											type: "checkbox",
										},
										{
											name: "isAcceptingBackups",
											type: "checkbox",
											admin: {
												description: "Allow backup-only submissions while main submissions are closed.",
											},
										},
										{
											name: "isAcceptingVolunteers",
											type: "checkbox",
										},
									],
								},
							],
						},
						{
							name: "timeSettings",
							type: "group",
							fields: [
								{
									name: "timezone",
									type: "select",
									options: TimeZoneOptions,
									defaultValue: DefaultTimeZone,
									required: true,
								},
								{
									type: "row",
									fields: [
										{
											name: "startTime",
											type: "date",
											admin: {
												date: {
													pickerAppearance: "dayAndTime",
													timeIntervals: 5,
												},
											},
										},
										{
											name: "endTime",
											type: "date",
											validate: validateDateAfter("startTime", "the start time"),
											admin: {
												date: {
													pickerAppearance: "dayAndTime",
													timeIntervals: 5,
												},
											},
										},
									],
								},
							],
						},
						{
							name: "eventPage",
							type: "richText",
						},
						{
							name: "submissionInstructions",
							type: "richText",
						},
					],
				},
				{
					label: "Schedule",
					fields: [
						{
							name: "scheduleMetadata",
							type: "group",
							fields: [
								{
									name: "published",
									type: "checkbox",
									admin: { description: "Make the schedule page publicly visible." },
								},
								{
									type: "row",
									fields: [
										{
											name: "horaro",
											type: "text",
											validate: validateUrl,
										},
										{
											name: "oengus",
											type: "text",
											validate: validateUrl,
										},
									],
								},
								{
									name: "scheduleBlocks",
									type: "array",
									label: "Schedule Blocks (for schedule visualiser)",
									fields: [
										{
											type: "row",
											fields: [
												{
													name: "name",
													type: "text",
													required: true,
												},
												{
													name: "colour",
													type: "text",
													validate: validateColour,
												},
												{
													name: "textColour",
													type: "text",
													validate: validateColour,
												},
											],
										},
									],
								},
							],
						},
					],
				},
				{
					label: "Media",
					fields: [
						{
							name: "media",
							type: "group",
							fields: [
								{
									type: "row",
									fields: [
										{
											name: "logo",
											type: "upload",
											relationTo: "media",
											label: "Logo (Light Mode / Default)",
										},
										{
											name: "logoDarkMode",
											type: "upload",
											relationTo: "media",
											label: "Logo (Dark Mode)",
										},
									],
								},
								{
									type: "row",
									fields: [
										{
											name: "hero",
											type: "upload",
											relationTo: "media",
										},
										{
											name: "embed",
											type: "upload",
											relationTo: "media",
										},
									],
								},
							],
						},
					],
				},
				{
					label: "Shop",
					fields: [
						{
							name: "products",
							type: "relationship",
							relationTo: "products",
							hasMany: true,
						},
					],
				},
				{
					label: "Post Event",
					fields: [
						{
							name: "postEvent",
							type: "group",
							fields: [
								{
									name: "raised",
									type: "number",
									min: 0,
									admin: { description: "Total raised for charity (AUD)." },
								},
								{
									name: "postEventPage",
									type: "richText",
								},
							],
						},
					],
				},
				{
					label: "Related",
					description: "Everything linked to this event.",
					fields: [
						{
							name: "submissions",
							type: "join",
							collection: "submissions",
							on: "event",
							admin: { defaultColumns: ["game", "category", "runner", "status"] },
						},
						{
							name: "runs",
							type: "join",
							collection: "runs",
							on: "event",
							defaultSort: "scheduledTime",
							admin: { defaultColumns: ["title", "scheduledTime", "estimate"] },
						},
						{
							name: "incentives",
							type: "join",
							collection: "incentives",
							on: "event",
							admin: { defaultColumns: ["title", "type", "run", "isActive"] },
						},
						{
							name: "volunteers",
							type: "join",
							collection: "volunteers",
							on: "event",
							admin: { defaultColumns: ["title", "role", "status"] },
						},
					],
				},
			],
		},
		{
			name: "generatedPostEventPage",
			type: "relationship",
			relationTo: "pages",
			admin: {
				position: "sidebar",
				readOnly: true,
				description: "System-managed page generated from this event.",
			},
		},
		{
			name: "generatePostEventPageAction",
			type: "ui",
			admin: {
				position: "sidebar",
				components: {
					Field: "./components/Events/GeneratePostEventPageButton",
				},
			},
		},
		// TODO: Remove this field after migration is complete
		{
			name: "legacyKeystoneId",
			type: "text",
			unique: true,
			admin: { readOnly: true, position: "sidebar" },
		},
	],
};
