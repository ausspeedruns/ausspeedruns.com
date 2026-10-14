import type { CollectionConfig } from "payload";

import { authenticated } from "#access/authenticated.ts";
import { isAdmin } from "#access/isAdmin.ts";
import { validateColour } from "#fields/validators.ts";

export const Roles: CollectionConfig<"roles"> = {
	slug: "roles",
	access: {
		create: isAdmin,
		delete: isAdmin,
		read: authenticated,
		update: isAdmin,
	},
	admin: {
		useAsTitle: "name",
		defaultColumns: ["name", "admin", "canManageContent", "canManageUsers"],
		group: "Users",
	},
	defaultPopulate: {
		name: true,
		colour: true,
		textColour: true,
		admin: true,
		canManageContent: true,
		canManageUsers: true,
	},
	fields: [
		{
			name: "name",
			type: "text",
			required: true,
			unique: true,
		},
		{
			type: "row",
			fields: [
				{
					name: "admin",
					type: "checkbox",
					defaultValue: false,
					admin: { description: "Full access, including managing roles." },
				},
				{
					name: "canManageContent",
					type: "checkbox",
					defaultValue: false,
					admin: { description: "Pages, posts, events, runs, submissions, volunteers and products." },
				},
				{
					name: "canManageUsers",
					type: "checkbox",
					defaultValue: false,
					admin: { description: "Users, orders and payment settings." },
				},
			],
		},
		{
			type: "row",
			fields: [
				{
					name: "colour",
					type: "text",
					validate: validateColour,
					admin: { description: "Badge background colour, e.g. #CC7722." },
				},
				{
					name: "textColour",
					type: "text",
					validate: validateColour,
					admin: { description: "Badge text colour, e.g. white." },
				},
			],
		},
		{
			name: "users",
			type: "join",
			collection: "users",
			on: "roles",
			admin: { defaultColumns: ["username", "name"] },
		},
	],
};
