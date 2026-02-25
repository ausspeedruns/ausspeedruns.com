import type { CollectionConfig } from "payload";
import { AllTimeZones, DefaultTimeZone } from "./Fields/TimezoneSelect.ts";

import { authenticated } from "#access/authenticated.ts";
import { authenticatedOrEventLive } from "#access/authenticatedOrEventLive.ts";

export const Events: CollectionConfig = {
	slug: "events",
	access: {
		create: authenticated,
		delete: authenticated,
		read: authenticatedOrEventLive,
		update: authenticated,
	},
	admin: {
		useAsTitle: "name",
	},
	fields: [
		{
			name: "name",
			type: "text",
			required: true,
		},
		{
			name: "shortname",
			type: "text",
			required: true,
		},
		{
			name: "settings",
			type: "group",
			fields: [
				{
					name: "isPublished",
					type: "checkbox",
				},
				{
					name: "isAcceptingSubmissions",
					type: "checkbox",
				},
				{
					name: "isAcceptingBackups",
					type: "checkbox",
				},
				{
					name: "isScheduleReleased",
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
					name: "horaro",
					type: "text",
				},
				{
					name: "oengus",
					type: "text",
				},
				{
					name: "scheduleBlocks",
					type: "json",
				},
			],
		},
		// TODO: Remove this field after migration is complete
		{
			name: "legacyKeystoneId",
			type: "text",
			unique: true,
		},
	],
};
