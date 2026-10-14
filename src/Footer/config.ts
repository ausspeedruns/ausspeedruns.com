import type { GlobalConfig } from "payload";

import { manageContent } from "#access/manageContent.ts";
import { link } from "#fields/link.ts";
import { revalidateFooter } from "./hooks/revalidateFooter.ts";

export const Footer: GlobalConfig = {
	slug: "footer",
	admin: {
		group: "Content",
	},
	access: {
		read: () => true,
		update: manageContent,
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
					RowLabel: "./Footer/RowLabel#RowLabel",
				},
			},
		},
	],
	hooks: {
		afterChange: [revalidateFooter],
	},
};
