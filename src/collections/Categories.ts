import { slugField } from "payload";
import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone.ts";
import { authenticated } from "../access/authenticated.ts";

export const Categories: CollectionConfig = {
	slug: "categories",
	access: {
		create: authenticated,
		delete: authenticated,
		read: anyone,
		update: authenticated,
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
