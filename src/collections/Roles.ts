import type { CollectionConfig } from "payload";

export const Roles: CollectionConfig = {
	slug: "roles",
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
