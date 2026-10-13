import { anyone } from "#access/anyone.ts";
import { manageContent } from "#access/manageContent.ts";
import type { CollectionConfig } from "payload";

export const Games: CollectionConfig = {
	slug: "games",
	admin: {
		useAsTitle: "name",
	},
	access: {
		create: manageContent,
		delete: manageContent,
		read: anyone,
		update: manageContent,
	},
	fields: [
		{
			name: "name",
			type: "text",
			required: true,
		},
		{
			name: "year",
			type: "number",
		},
		{
			name: "platform",
			type: "text",
			hasMany: true,
		},
		{
			name: "techPlatform",
			type: "text",
			hasMany: true,
		},
		{
			name: "stream",
			type: "group",
			fields: [
				{
					name: "displayName",
					type: "textarea",
				},
				{
					name: "aspectRatio",
					type: "text",
				},
			],
		},
		{
			name: "runs",
			type: "join",
			collection: "runs",
			on: "game",
		},
	],
};
