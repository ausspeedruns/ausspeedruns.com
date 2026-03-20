import { resolveUserRoles } from "#access/helpers.ts";
import { manageUsers } from "#access/manageUsers.ts";
import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
	slug: "orders",
	admin: {
		useAsTitle: "reference",
	},
	access: {
		create: manageUsers,
		delete: manageUsers,
		read: async ({ req: { user } }) => {
			if (!user) return false;

			const roles = await resolveUserRoles(user);
			if (roles.some((role) => role.canManageUsers)) {
				return true;
			}

			return {
				"user.id": { equals: user.id },
			};
		},
		update: manageUsers,
	},
	fields: [
		{ name: "reference", type: "text", required: true, unique: true },
		{
			name: "user",
			type: "relationship",
			relationTo: "users",
			required: true,
		},
		{
			name: "items",
			type: "array",
			fields: [
				{ name: "product", type: "relationship", relationTo: "products" },
				{ name: "variantLabel", type: "text" },
				{ name: "quantity", type: "number", required: true },
				{ name: "unitPriceInCents", type: "number", required: true },
			],
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
			name: "stripe",
			type: "group",
			fields: [
				{ name: "sessionId", type: "text" },
				{ name: "paymentIntentId", type: "text" },
			],
		},
		{
			name: "notes",
			type: "richText",
		},
	],
};
