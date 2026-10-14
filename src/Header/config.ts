import type { GlobalConfig } from "payload";

import { manageContent } from "#access/manageContent.ts";
import { link } from "#fields/link.ts";
import { revalidateHeader } from "./hooks/revalidateHeader.ts";

export const Header: GlobalConfig = {
	slug: "header",
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
					RowLabel: "./Header/RowLabel#RowLabel",
				},
			},
		},
	],
	hooks: {
		// afterChange: [revalidateHeader],
	},
};
