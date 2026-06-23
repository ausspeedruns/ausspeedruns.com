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
			name: "images",
			type: "array",
			fields: [
				{
					name: "image",
					type: "upload",
					relationTo: "media",
				},
			],
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
				{
					name: "priceInCents",
					type: "number",
					required: true,
					min: 0,
					admin: { step: 1 },
					validate: (
						value: number | null | undefined,
						{ siblingData }: { siblingData: { stripePriceId?: string | null } },
					) => {
						if (siblingData.stripePriceId) {
							return true; // If stripePriceId is set, we assume the price is managed in Stripe and skip validation
						}
						if (value === undefined || value === null) {
							return "Price is required if no Stripe Price ID is provided.";
						}
						if (value < 0) {
							return "Price cannot be negative.";
						}
						if (!Number.isInteger(value)) {
							return "Price must be an integer representing cents.";
						}

						return true;
					},
				},
				{ name: "stock", type: "number" },
				{
					name: "stripePriceId",
					type: "text",
					admin: { description: "Optional — auto-created if blank" },
				},
				{
					name: "bankTransferDetails",
					type: "group",
					fields: [
						{ name: "allowBankTransfer", type: "checkbox" },
						{ name: "accountName", type: "text", defaultValue: "AusSpeedruns" },
						{ name: "bsb", type: "text", defaultValue: "085-005" },
						{ name: "accountNumber", type: "text", defaultValue: "30-192-8208" },
					],
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
	],
};
