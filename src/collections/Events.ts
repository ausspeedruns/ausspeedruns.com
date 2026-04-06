import type { CollectionConfig } from "payload";
import { DefaultTimeZone } from "./Fields/TimezoneSelect.ts";

import { manageContentOrPublished } from "#access/manageContentOrPublished.ts";
import { manageContent } from "#access/manageContent.ts";

export const Events: CollectionConfig = {
	slug: "events",
	access: {
		create: manageContent,
		delete: manageContent,
		read: manageContentOrPublished,
		update: manageContent,
	},
	admin: {
		useAsTitle: "name",
	},
	versions: {
		drafts: {
			schedulePublish: true,
		},
	},
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
		},
		{
			name: "settings",
			type: "group",
			fields: [
				{
					name: "isAcceptingSubmissions",
					type: "checkbox",
				},
				{
					name: "isAcceptingBackups",
					type: "checkbox",
				},
				{
					name: "isAcceptingVolunteers",
					type: "checkbox",
				},
			],
		},
		{
			name: "timeSettings",
			type: "group",
			fields: [
				{
					name: "timezone",
					type: "text",
					// options: AllTimeZones,
					defaultValue: DefaultTimeZone,
				},
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
					admin: {
						date: {
							pickerAppearance: "dayAndTime",
							timeIntervals: 5,
						},
					},
				},
			],
		},
		{
			name: "submittedItems",
			type: "group",
			fields: [
				{
					name: "runs",
					type: "join",
					collection: "runs",
					on: "event",
				},
				// {
				// 	name: 'volunteers',
				// 	type: 'join',
				// 	collection: 'volunteers',
				// 	on: 'event',
				// 	hasMany: true,
				// },
			],
		},
		{
			name: "postEvent",
			type: "group",
			fields: [
				{
					name: "raised",
					type: "number",
				},
				{
					name: "postEventPage",
					type: "richText",
				},
			],
		},
		{
			name: "media",
			type: "group",
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
		{
			name: "submissions",
			type: "join",
			collection: "submissions",
			on: "event",
			hasMany: true,
		},
		{
			name: "runs",
			type: "join",
			collection: "runs",
			on: "event",
			hasMany: true,
		},
		{
			name: "submissionInstructions",
			type: "richText",
		},
		{
			name: "eventPage",
			type: "richText",
		},
		{
			name: "scheduleMetadata",
			type: "group",
			fields: [
				{
					name: "published",
					type: "checkbox",
				},
				{
					name: "horaro",
					type: "text",
				},
				{
					name: "oengus",
					type: "text",
				},
				{
					name: "scheduleBlocks",
					type: "array",
					fields: [
						{
							name: "name",
							type: "text",
						},
						{
							name: "colour",
							type: "text",
						},
						{
							name: "textColour",
							type: "text",
						},
						// {
						// 	name: "startRun",
						// 	type: "join",
						// 	collection: "runs",
						// 	on: "event",
						// },
						// {
						// 	name: "endRun",
						// 	type: "join",
						// 	collection: "runs",
						// 	on: "event",
						// },
					],
					label: "Schedule Blocks (for schedule visualiser)",
				},
			],
		},
		{
			name: "products",
			type: "relationship",
			relationTo: "products",
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
