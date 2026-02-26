import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
	slug: "orders",
	admin: {
		useAsTitle: "orderId",
	},
	fields: [
		{
			name: "orderId",
			type: "text",
			required: true,
		},
		{
			name: "user",
			type: "relationship",
			relationTo: "users",
			required: true,
		},
		{
			name: "products",
			type: "relationship",
			relationTo: "products",
			hasMany: true,
		},
		{
			name: "status",
			type: "select",
			options: [
				{ label: "Pending", value: "pending" },
				{ label: "Completed", value: "completed" },
				{ label: "Collected", value: "collected" },
				{ label: "Cancelled", value: "cancelled" },
			],
			defaultValue: "pending",
		},
		{
			name: "purchaseType",
			type: "select",
			options: [
				{ label: "Bank Transfer", value: "bankTransfer" },
				{ label: "Stripe", value: "stripe" },
				{ label: "Other (Write in notes)", value: "other" },
			],
		},
		{
			name: "stripePaymentId",
			type: "text",
		},
		{
			name: "notes",
			type: "textarea",
		},
	],
};
