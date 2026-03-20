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
			name: "slug",
			type: "text",
			required: true,
			unique: true,
		},
		{
			name: "description",
			type: "richText",
		},
		{
			name: "image",
			type: "upload",
			relationTo: "media",
		},
		{
			name: "type",
			type: "select",
			required: true,
			options: [
				{ label: "Ticket", value: "ticket" },
				{ label: "Merchandise", value: "merchandise" },
			],
		},
		{
			name: "variants",
			type: "array",
			required: true,
			minRows: 1,
			fields: [
				{ name: "label", type: "text", required: true },
				{ name: "priceInCents", type: "number", required: true },
				{ name: "stock", type: "number" },
				{
					name: "stripePriceId",
					type: "text",
					admin: { description: "Optional — auto-created if blank" },
				},
			],
		},
		{
			name: "availableFrom",
			type: "date",
			admin: { date: { pickerAppearance: "dayAndTime" } },
		},
		{
			name: "availableUntil",
			type: "date",
			admin: { date: { pickerAppearance: "dayAndTime" } },
		},
		{
			name: "allowBankTransfer",
			type: "checkbox",
			defaultValue: true,
		},
		{
			name: "active",
			type: "checkbox",
			defaultValue: true,
		},
	],
};
