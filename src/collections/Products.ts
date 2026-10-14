import { slugField, type CollectionConfig } from "payload";

import { anyone } from "#access/anyone.ts";
import { manageContent } from "#access/manageContent.ts";
import { validateDateAfter } from "#fields/validators.ts";

export const Products: CollectionConfig<"products"> = {
	slug: "products",
	admin: {
		useAsTitle: "name",
		defaultColumns: ["name", "type", "availableFrom", "availableUntil"],
		group: "Shop",
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
		slugField({ useAsSlug: "name" }),
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
			name: "description",
			type: "richText",
		},
		{
			name: "images",
			type: "array",
			fields: [
				{
					name: "image",
					type: "upload",
					relationTo: "media",
					required: true,
				},
			],
		},
		{
			name: "variants",
			type: "array",
			required: true,
			minRows: 1,
			admin: {
				components: {
					RowLabel: "./components/Products/VariantRowLabel#VariantRowLabel",
				},
			},
			fields: [
				{
					type: "row",
					fields: [
						{ name: "label", type: "text", required: true },
						{
							name: "priceInCents",
							label: "Price (cents)",
							type: "number",
							required: true,
							min: 0,
							admin: { step: 1, description: "e.g. 3000 = $30.00" },
							validate: (value: number | null | undefined) => {
								if (value === undefined || value === null) return "Price is required.";
								if (value < 0) return "Price cannot be negative.";
								if (!Number.isInteger(value)) return "Price must be a whole number of cents.";
								return true;
							},
						},
						{
							name: "stock",
							type: "number",
							min: 0,
							admin: {
								step: 1,
								description: "Leave blank for unlimited. Decremented automatically when orders complete.",
							},
						},
					],
				},
			],
		},
		{
			name: "payment",
			type: "group",
			fields: [
				{
					type: "row",
					fields: [
						{ name: "allowStripe", label: "Allow card payments (Stripe)", type: "checkbox", defaultValue: true },
						{
							name: "allowBankTransfer",
							label: "Allow bank transfer",
							type: "checkbox",
							defaultValue: false,
						},
					],
				},
			],
		},
		{
			type: "row",
			fields: [
				{
					name: "availableFrom",
					type: "date",
					admin: { date: { pickerAppearance: "dayAndTime" } },
				},
				{
					name: "availableUntil",
					type: "date",
					validate: validateDateAfter("availableFrom", "Available From"),
					admin: { date: { pickerAppearance: "dayAndTime" } },
				},
			],
		},
	],
};
