import type { CollectionConfig, Endpoint } from "payload";

import { canAccessTechSchedule } from "#access/helpers.ts";
import { manageContent } from "#access/manageContent.ts";
import { loadTechSchedule } from "#utilities/schedule/techSchedule.ts";
import { manageContentOrPublished } from "#access/manageContentOrPublished.ts";
import { preventCaseInsensitiveDuplicate } from "#hooks/preventCaseInsensitiveDuplicate.ts";
import { validateDateAfter, validateUrl, validateUrlSafe } from "#fields/validators.ts";
import { scheduleBlocksField } from "./Fields/ScheduleBlocks.ts";
import { DefaultTimeZone, TimeZoneOptions } from "./Fields/TimezoneSelect.ts";

/**
 * Full schedule for tech and stream graphics, with medley games nested under their medley.
 * GET /api/events/:shortName/tech-schedule — authenticate with `Authorization: users API-Key <key>`.
 */
const techScheduleEndpoint: Endpoint = {
	path: "/:shortName/tech-schedule",
	method: "get",
	handler: async (req) => {
		if (!(await canAccessTechSchedule(req))) {
			return Response.json({ error: "You need tech schedule access to use this endpoint." }, { status: 403 });
		}

		const shortName = String(req.routeParams?.shortName ?? "");
		const schedule = await loadTechSchedule(req, shortName);
		if (!schedule) return Response.json({ error: "Event not found." }, { status: 404 });

		return Response.json(schedule, { headers: { "Cache-Control": "no-store" } });
	},
};

export const Events: CollectionConfig<"events"> = {
	slug: "events",
	endpoints: [techScheduleEndpoint],
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
	hooks: {
		// Event URLs (/schedule/<shortName>) are matched case-insensitively
		beforeValidate: [preventCaseInsensitiveDuplicate("shortName", "An event with that short name already exists.")],
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
								scheduleBlocksField,
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
