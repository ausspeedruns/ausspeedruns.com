import type { Payload, PayloadRequest } from "payload";
import type { Event, Run } from "#/payload-types";

import { isGameRun } from "#/utilities/runDisplay.ts";
import { buildPostEventSummary } from "./postEventSummary.ts";

interface UpsertPostEventPageOptions {
	eventId: number | string;
	payload: Payload;
	req: PayloadRequest;
}

interface UpsertPostEventPageResult {
	action: "created" | "updated";
	pageID: number | string;
	slug: string;
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-{2,}/g, "-");
}

function buildDefaultScheduleUrl(event: Event): string | null {
	const oengus = event.scheduleMetadata?.oengus?.trim();
	if (oengus) {
		return oengus;
	}

	const horaro = event.scheduleMetadata?.horaro?.trim();
	if (horaro) {
		return horaro;
	}

	if (event.shortName) {
		return `/schedule/${event.shortName}`;
	}

	return null;
}

function buildLayout(event: Event, runs: Run[]) {
	const summary = buildPostEventSummary(runs);
	const scheduleUrl = buildDefaultScheduleUrl(event);
	const hasVods = runs.some((run) => Boolean(run.youtube));

	const heroLinks: { label: string; url: string }[] = [];
	if (scheduleUrl) heroLinks.push({ label: "Schedule", url: scheduleUrl });
	if (event.shortName) heroLinks.push({ label: "Incentives", url: `/incentives/${event.shortName}` });

	return [
		{
			blockType: "eventHeroBlock",
			event: event.id,
			heading: `${event.name} Recap`,
			showDates: true,
			showRecapStats: true,
			links: heroLinks,
		},
		{
			blockType: "donationTrackerBlock",
			event: event.id,
			title: "Incentive results",
			displayMode: "results",
		},
		...(hasVods
			? [
					{
						blockType: "vodHighlightsBlock",
						event: event.id,
						title: "Watch the runs",
						limit: 6,
					},
				]
			: []),
		{
			blockType: "postEventStatsBlock",
			title: "The runs",
			event: event.id,
			showStats: false,
			showRunList: true,
			totalRuns: summary.totalRuns,
			uniqueRunners: summary.uniqueRunnerCount,
			totalRunDuration: summary.totalRunDurationLabel,
			scheduleUrl,
			scheduleLabel: "View schedule",
		},
		{
			blockType: "eventImagesBlock",
			title: "Photos",
			richText: null,
			images: [],
			galleryUrl: null,
			galleryLabel: "View the full photo gallery",
		},
		{
			blockType: "sponsorGridBlock",
			title: "Thank you to our sponsors",
			sponsors: [],
		},
	];
}

type GeneratedBlock = ReturnType<typeof buildLayout>[number];

// Blocks that editors fill in by hand (photos, sponsors) are kept when the page is regenerated.
const EDITOR_BLOCK_TYPES = new Set(["eventImagesBlock", "sponsorGridBlock"]);

function isLegacyPlaceholderGallery(block: { blockType?: string; images?: unknown }): boolean {
	if (block.blockType !== "eventImagesBlock" || !Array.isArray(block.images) || block.images.length === 0) return false;
	return block.images.every(
		(image) => typeof image?.externalUrl === "string" && image.externalUrl.includes("placehold.co"),
	);
}

async function preserveEditorBlocks(
	payload: Payload,
	req: PayloadRequest,
	pageID: number | string,
	layout: GeneratedBlock[],
): Promise<unknown[]> {
	let existingLayout: { blockType?: string }[] = [];

	try {
		const page = await payload.findByID({ collection: "pages", id: pageID, depth: 0, req });
		existingLayout = (page?.layout ?? []) as { blockType?: string }[];
	} catch {
		return layout;
	}

	return layout.map((block) => {
		if (!EDITOR_BLOCK_TYPES.has(block.blockType)) return block;
		const existing = existingLayout.find((candidate) => candidate.blockType === block.blockType);
		return existing && !isLegacyPlaceholderGallery(existing) ? existing : block;
	});
}

export async function upsertPostEventPage({
	eventId,
	payload,
	req,
}: UpsertPostEventPageOptions): Promise<UpsertPostEventPageResult> {
	const eventDoc = (await payload.findByID({
		collection: "events",
		id: eventId,
		depth: 1,
		req,
	})) as Event;

	if (!eventDoc) {
		throw new Error("Event not found.");
	}

	const runsResult = await payload.find({
		collection: "runs",
		where: {
			event: {
				equals: eventDoc.id,
			},
		},
		limit: 1000,
		depth: 1,
		req,
	});

	const runs = (runsResult.docs as Run[]).filter(isGameRun);
	const layout = buildLayout(eventDoc, runs);

	const slugBase = slugify(eventDoc.shortName || eventDoc.name || `event-${eventDoc.id}`) || `event-${eventDoc.id}`;
	const slug = `${slugBase}-post-event`;
	const title = `${eventDoc.name} Post-Event`;

	const linkedPageID =
		typeof eventDoc.generatedPostEventPage === "object" && eventDoc.generatedPostEventPage !== null
			? eventDoc.generatedPostEventPage.id
			: eventDoc.generatedPostEventPage;

	if (linkedPageID) {
		// Keep any title/slug the editors have since changed; only the layout is regenerated.
		const updatedPage = (await payload.update({
			collection: "pages",
			id: linkedPageID,
			data: {
				layout: (await preserveEditorBlocks(payload, req, linkedPageID, layout)) as any,
			},
			req,
		})) as { id: number | string; slug?: string | null };

		return {
			action: "updated",
			pageID: updatedPage.id,
			slug: updatedPage.slug || slug,
		};
	}

	const existingBySlug = await payload.find({
		collection: "pages",
		where: {
			slug: {
				equals: slug,
			},
		},
		limit: 1,
		depth: 0,
		req,
	});

	if (existingBySlug.docs[0]) {
		const existingPage = existingBySlug.docs[0];

		await payload.update({
			collection: "events",
			id: eventDoc.id,
			data: {
				generatedPostEventPage: existingPage.id,
			},
			req,
		});

		const updatedPage = (await payload.update({
			collection: "pages",
			id: existingPage.id,
			data: {
				title,
				slug,
				layout: (await preserveEditorBlocks(payload, req, existingPage.id, layout)) as any,
			},
			req,
		})) as { id: number | string };

		return {
			action: "updated",
			pageID: updatedPage.id,
			slug,
		};
	}

	const createdPage = await payload.create({
		collection: "pages",
		data: {
			title,
			slug,
			layout: layout as any,
			publishedAt: new Date().toISOString(),
		},
		draft: false,
		req,
	});

	await payload.update({
		collection: "events",
		id: eventDoc.id,
		data: {
			generatedPostEventPage: createdPage.id,
		},
		req,
	});

	return {
		action: "created",
		pageID: createdPage.id,
		slug,
	};
}