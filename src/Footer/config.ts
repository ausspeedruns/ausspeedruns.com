import type { GlobalConfig } from "payload";

import { link } from "#fields/link.ts";
import { revalidateFooter } from "./hooks/revalidateFooter.ts";

export const Footer: GlobalConfig = {
	slug: "footer",
	access: {
		read: () => true,
	},
	fields: [
		{
			name: "navItems",
			type: "array",
			fields: [
				link({
					appearances: false,
				}),
			],
			maxRows: 6,
			admin: {
				initCollapsed: true,
				components: {
					RowLabel: "@/Footer/RowLabel#RowLabel",
				},
			},
		},
	],
	hooks: {
		afterChange: [revalidateFooter],
	},
};
