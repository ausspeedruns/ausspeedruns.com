import type { BasePayload } from "payload";
import { kitchenSinkPage } from "./kitchen-sink.ts";

export async function seed(payload: BasePayload) {
	await createPages(payload);

	await setupHeader(payload, -1);
}

async function createPages(payload: BasePayload) {
	await payload.create({
		collection: "pages",
		depth: 0,
		data: await kitchenSinkPage(payload),
	});
}

async function setupHeader(payload: BasePayload, aboutUsPageId: number) {
	// Create Nav Links
	await payload.updateGlobal({
		slug: "header",
		data: {
			navItems: [
				// Merch Link
				{
					link: {
						type: "custom",
						label: "Merch",
						url: "https://www.ausspeedruns.theprintbar.com/",
					},
				},
				// Past Events Link
				{
					link: {
						type: "custom",
						label: "Past Events",
						url: "/events",
					},
				},
				// About Us Link
				// {
				// 	link: {
				// 		type: "reference",
				// 		label: "About Us",
				// 		reference: {
				// 			relationTo: "pages",
				// 			value: aboutUsPageId
				// 		},
				// 	},
				// },
			],
		},
	});
}
