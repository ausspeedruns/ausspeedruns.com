import { slugField } from "payload";
import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone.ts";
import { manageContent } from "#access/manageContent.ts";

export const Categories: CollectionConfig = {
	slug: "categories",
	access: {
		create: manageContent,
		delete: manageContent,
		read: anyone,
		update: manageContent,
	},
	admin: {
		useAsTitle: "title",
	},
	fields: [
		{
			name: "title",
			type: "text",
			required: true,
		},
		slugField({
			position: undefined,
		}),
	],
};
