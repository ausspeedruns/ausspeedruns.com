import type { BasePayload } from "payload";
import { kitchenSinkPage } from "./kitchen-sink.ts";
import { seedKitchenSinkData } from "./kitchen-sink-data.ts";
import { homePage } from "./home.ts";
import { upcomingEventTemplatePage } from "./upcoming-event-template.ts";
import { seedSegmentTypes } from "./segment-types.ts";
import { aboutUsPage } from "./about-us.ts";

export async function seed(payload: BasePayload) {
	await seedSegmentTypes(payload);
	await seedKitchenSinkData(payload);
	const { aboutUsPageId } = await createPages(payload);

	await setupHeader(payload, aboutUsPageId);
}

async function createPages(payload: BasePayload) {
	const aboutUs = await payload.create({
		collection: "pages",
		depth: 0,
		draft: true,
		data: aboutUsPage(),
	});

	await payload.create({
		collection: "pages",
		depth: 0,
		data: await homePage(payload),
	});

	await payload.create({
		collection: "pages",
		depth: 0,
		data: await kitchenSinkPage(payload),
	});

	const upcomingEventTemplate = await upcomingEventTemplatePage(payload);
	if (upcomingEventTemplate) {
		await payload.create({
			collection: "pages",
			depth: 0,
			draft: true,
			data: upcomingEventTemplate,
		});
	}

	return { aboutUsPageId: aboutUs.id };
}

async function setupHeader(payload: BasePayload, aboutUsPageId: number) {
	// Create Nav Links
	await payload.updateGlobal({
		slug: "header",
		// Runs outside Next.js, where revalidateTag would throw
		context: { disableRevalidate: true },
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
				{
					link: {
						type: "reference",
						label: "About Us",
						reference: {
							relationTo: "pages",
							value: aboutUsPageId,
						},
					},
				},
			],
		},
	});
}
