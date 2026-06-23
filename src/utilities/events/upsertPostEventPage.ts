import type { Payload, PayloadRequest } from "payload";
import type { Event, Run } from "#/payload-types";

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

	const placeholderImageUrl = "https://placehold.co/1600x900/png?text=Add+Event+Photos";

	return [
		{
			blockType: "eventHeroBlock",
			event: event.id,
			heading: `${event.name} Recap`,
		},
		{
			blockType: "donationTrackerBlock",
			event: event.id,
			title: "How much was raised",
		},
		{
			blockType: "postEventStatsBlock",
			title: "Quick stats",
			totalRuns: summary.totalRuns,
			uniqueRunners: summary.uniqueRunnerCount,
			totalRunDuration: summary.totalRunDurationLabel,
			scheduleUrl,
			scheduleLabel: "View schedule",
		},
		{
			blockType: "sponsorGridBlock",
			title: "Sponsors",
			sponsors: [],
		},
		{
			blockType: "eventImagesBlock",
			richText: null,
			images: [
				{
					sourceType: "external",
					externalUrl: placeholderImageUrl,
					caption: "Replace this placeholder with event photos",
				},
			],
		},
	];
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

	const runs = runsResult.docs as Run[];
	const layout = buildLayout(eventDoc, runs);

	const slugBase = slugify(eventDoc.shortName || eventDoc.name || `event-${eventDoc.id}`) || `event-${eventDoc.id}`;
	const slug = `${slugBase}-post-event`;
	const title = `${eventDoc.name} Post-Event`;

	const linkedPageID =
		typeof eventDoc.generatedPostEventPage === "object" && eventDoc.generatedPostEventPage !== null
			? eventDoc.generatedPostEventPage.id
			: eventDoc.generatedPostEventPage;

	if (linkedPageID) {
		const updatedPage = (await payload.update({
			collection: "pages",
			id: linkedPageID,
			data: {
				title,
				slug,
				layout: layout as any,
			},
			req,
		})) as { id: number | string };

		return {
			action: "updated",
			pageID: updatedPage.id,
			slug,
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
				layout: layout as any,
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
			hero: {
				type: "none",
			},
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
