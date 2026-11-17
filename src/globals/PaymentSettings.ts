import type { GlobalConfig } from "payload";

import { anyone } from "#access/anyone.ts";
import { manageUsers } from "#access/manageUsers.ts";

export const PaymentSettings: GlobalConfig = {
	slug: "paymentSettings",
	label: "Payment Settings",
	admin: {
		group: "Shop",
	},
	access: {
		read: anyone,
		update: manageUsers,
	},
	fields: [
		{
			name: "bankTransfer",
			type: "group",
			admin: {
				description: "Shown to people after they place a bank transfer order.",
			},
			fields: [
				{
					name: "accountName",
					type: "text",
					required: true,
					defaultValue: "AusSpeedruns",
				},
				{
					type: "row",
					fields: [
						{
							name: "bsb",
							label: "BSB",
							type: "text",
							required: true,
							defaultValue: "085-005",
							validate: (value: unknown) =>
								typeof value === "string" && /^\d{3}-?\d{3}$/.test(value.trim())
									? true
									: "BSB must be 6 digits, e.g. 085-005.",
						},
						{
							name: "accountNumber",
							type: "text",
							required: true,
							defaultValue: "29-602-3097",
						},
					],
				},
				{
					name: "instructions",
					type: "textarea",
					admin: {
						description: "Optional extra instructions, e.g. how long until the order is confirmed.",
					},
				},
			],
		},
	],
};
