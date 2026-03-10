import type { CollectionConfig } from "payload";

import { authenticated } from "#access/authenticated.ts";
import { isAdmin } from "#access/isAdmin.ts";
import { staff } from "#access/staff.ts";

export const Roles: CollectionConfig = {
	slug: "roles",
	access: {
		admin: staff,
		create: isAdmin,
		delete: isAdmin,
		read: authenticated,
		update: isAdmin,
	},
	admin: {
		useAsTitle: "name",
	},
	fields: [
		{
			name: "name",
			type: "text",
			required: true,
			unique: true,
		},
		{
			name: "users",
			type: "join",
			collection: "users",
			on: "roles",
		},
		{
			name: "admin",
			type: "checkbox",
			defaultValue: false,
		},
		{
			name: "canManageContent",
			type: "checkbox",
			defaultValue: false,
		},
		{
			name: "canManageUsers",
			type: "checkbox",
			defaultValue: false,
		},
		{
			name: "colour",
			type: "text",
		},
		{
			name: "textColour",
			type: "text",
		},
	],
};
