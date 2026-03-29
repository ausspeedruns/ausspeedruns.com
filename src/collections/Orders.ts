import { manageUsersField } from "#access/field/manageUsersField.ts";
import { resolveUserRoles } from "#access/helpers.ts";
import { manageUsers } from "#access/manageUsers.ts";
import type { CollectionConfig } from "payload";
import { customAlphabet } from "nanoid";

export const Orders: CollectionConfig = {
	slug: "orders",
	admin: {
		useAsTitle: "reference",
	},
	access: {
		create: manageUsers,
		delete: manageUsers,
		read: async ({ req: { user } }) => {
			// Only allow users to read their own orders, unless they have a role that can manage users
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
	hooks: {
		beforeValidate: [
			({ data, operation }) => {
				const mutableData: any = data;

				// Only generate a reference when creating a new order
				if (operation === "create" && !mutableData?.reference) {
					mutableData.reference = createOrderReference();
				}

				// Calculate totalInCents from items
				if (mutableData?.items) {
					mutableData.totalInCents = calculateTotalInCents(mutableData.items);
				}

				// Populate product snapshots for easier access later (e.g., in admin UI)
				if (mutableData?.items) {
					mutableData.items = getProductSnapshots(mutableData.items);
				}

				return mutableData;
			},
		],
	},
	fields: [
		{ name: "reference", type: "text", unique: true, index: true, admin: { position: "sidebar", readOnly: true } },
		{
			name: "user",
			type: "relationship",
			relationTo: "users",
			required: true,
			index: true,
		},
		{
			name: "items",
			type: "array",
			required: true,
			fields: [
				{ name: "product", type: "relationship", relationTo: "products", required: true },
				{ name: "productName", type: "text", admin: { readOnly: true } },
				{ name: "variantLabel", type: "text", admin: { readOnly: true } },
				{ name: "quantity", type: "number", required: true, min: 1 },
				{ name: "unitPriceInCents", type: "number", required: true, admin: { readOnly: true } },
			],
		},
		{
			name: "totalInCents",
			type: "number",
			required: true,
		},
		{
			name: "status",
			type: "select",
			index: true,
			required: true,
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
			required: true,
			options: [
				{ label: "Bank Transfer", value: "bankTransfer" },
				{ label: "Stripe", value: "stripe" },
				{ label: "Other (Write in notes)", value: "other" },
			],
		},
		{
			name: "stripe",
			type: "group",
			admin: {
				condition: (data) => data?.purchaseType === "stripe",
			},
			fields: [
				{ name: "sessionId", type: "text" },
				{ name: "paymentIntentId", type: "text" },
			],
		},
		{
			name: "notes",
			type: "textarea",
			access: {
				read: manageUsersField,
			},
		},
	],
};

const nanoid = customAlphabet("23456789ABCDEFGHJKMNPQRSTUVWXYZ", 10);
function createOrderReference() {
	return `ORD-${nanoid()}`; // Outputs e.g., ORD-7FX3M9K2
}

function calculateTotalInCents(items: { quantity: number; unitPriceInCents: number }[]) {
	return items.reduce((sum, item) => sum + item.quantity * item.unitPriceInCents, 0);
}

function getProductSnapshots(
	items: { product: string; variantLabel: string; quantity: number; unitPriceInCents: number }[],
) {
	return items.map((item) => ({
		product: item.product,
		variantLabel: item.variantLabel,
		quantity: item.quantity,
		unitPriceInCents: item.unitPriceInCents,
	}));
}
