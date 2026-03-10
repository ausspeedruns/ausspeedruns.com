import { anyone } from "#access/anyone.ts";
import { manageContent } from "#access/manageContent.ts";
import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
	slug: "products",
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
			name: "description",
			type: "textarea",
		},
		{
			name: "price",
			type: "number",
			required: true,
		},
		{
			name: "image",
			type: "upload",
			relationTo: "media",
		},
		{
			name: "isAvailable",
			type: "checkbox",
		},
	],
};
