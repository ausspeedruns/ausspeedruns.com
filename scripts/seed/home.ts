import type { BasePayload, RequiredDataFromCollectionSlug } from "payload";
import { buildHomeLayout, homeMeta } from "../../src/endpoints/seed/home-layout.ts";

const MS_PER_YEAR = 365 * 24 * 60 * 60 * 1000;

/** Homepage with the next upcoming event (with countdown) followed by the past year's events. */
export async function homePage(
	payload: BasePayload,
	now: Date = new Date(),
): Promise<RequiredDataFromCollectionSlug<"pages">> {
	const nowIso = now.toISOString();

	const upcoming = await payload.find({
		collection: "events",
		depth: 0,
		limit: 1,
		sort: "timeSettings.startTime",
		where: { "timeSettings.startTime": { greater_than_equal: nowIso } },
	});

	const past = await payload.find({
		collection: "events",
		depth: 0,
		limit: 6,
		sort: "-timeSettings.startTime",
		where: {
			and: [
				{ "timeSettings.startTime": { less_than: nowIso } },
				{ "timeSettings.startTime": { greater_than_equal: new Date(now.getTime() - MS_PER_YEAR).toISOString() } },
			],
		},
	});

	const eventBlocks = [
		...upcoming.docs.map((event) => ({
			blockType: "eventFeatureBlock" as const,
			event: event.id,
			showCountdown: true,
			showRaised: false,
			...(event.settings?.isAcceptingSubmissions ? { extraLinks: [{ label: "Submit a run", url: "/submit-game" }] } : {}),
		})),
		...past.docs.map((event) => ({
			blockType: "eventFeatureBlock" as const,
			event: event.id,
			showRaised: true,
		})),
	];

	return {
		slug: "home",
		_status: "published",
		title: "Home",
		meta: homeMeta,
		layout: [...eventBlocks, ...buildHomeLayout()],
	};
}
