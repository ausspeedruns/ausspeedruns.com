import payloadConfig from "#payload-config";

import styles from "./page.module.css";
import { notFound } from "next/navigation";
import { Schedule } from "./schedule";
import type { Metadata } from "next";
import { getPayload } from "payload";
import { format } from "date-fns";
import type { Incentive, Run as RunDoc } from "#/payload-types";
import { relationId } from "#access/helpers.ts";
import { getGameName, getRunDisplayName } from "#utilities/runDisplay.ts";
import { sortChildren } from "#utilities/runs/medley.ts";
import { toScheduleBlocks, type EventBlockData } from "#utilities/schedule/blocks.ts";
import type { MedleyGame, Run } from "./schedule-types";

function usernames(run: RunDoc): string[] {
	return run.runners?.filter((runner) => typeof runner === "object").map((runner) => runner.username) ?? [];
}

function otherRunners(run: RunDoc): string[] {
	return (run.otherRunners ?? "")
		.split(",")
		.map((name) => name.trim())
		.filter(Boolean);
}

function incentivesOf(run: RunDoc) {
	return (run.incentives?.docs ?? []).filter((incentive): incentive is Incentive => typeof incentive === "object");
}

/** Builds the public schedule: top-level entries in time order, with medley games nested under their medley. */
function toScheduleRuns(docs: RunDoc[]): Run[] {
	const childrenByParent = new Map<number, RunDoc[]>();
	for (const run of docs) {
		const parentId = relationId(run.parent);
		if (parentId !== null) childrenByParent.set(parentId, [...(childrenByParent.get(parentId) ?? []), run]);
	}

	return docs
		.filter((run) => relationId(run.parent) === null && run.scheduledTime)
		.map((run, i) => {
			const children: MedleyGame[] = sortChildren(childrenByParent.get(run.id) ?? []).map((child) => ({
				id: child.id,
				game: getGameName(child.game),
				category: child.category ?? "",
				platform: child.platform ?? "",
				estimate: child.estimate,
				scheduledTime: child.scheduledTime ?? null,
				runners: usernames(child),
				otherRunners: otherRunners(child),
				race: child.isRace ?? false,
				coop: child.isCoop ?? false,
				donationIncentives: incentivesOf(child),
			}));
			const segmentType = run.segmentType && typeof run.segmentType === "object" ? run.segmentType : null;

			return {
				id: run.id,
				type: run.type ?? "run",
				game: getRunDisplayName(run),
				estimate: run.estimate,
				scheduledTime: run.scheduledTime as string,
				platform: run.platform || [...new Set(children.map((child) => child.platform).filter(Boolean))].join(", "),
				category: run.category ?? "",
				runners: usernames(run),
				otherRunners: otherRunners(run),
				coop: run.isCoop ?? false,
				race: run.isRace ?? false,
				donationIncentives: incentivesOf(run),
				displayIndex: i,
				...(run.type === "medley" ? { children } : {}),
				...(segmentType
					? { segmentType: { name: segmentType.name, colour: segmentType.colour, textColour: segmentType.textColour } }
					: {}),
			};
		});
}

interface URLProps {
	params: Promise<{
		event?: string;
	}>;
}

export async function generateMetadata({ params }: URLProps): Promise<Metadata> {
	const { event: eventShortName } = await params;

	const payload = await getPayload({ config: payloadConfig });
	const event = await payload
		.find({
			collection: "events",
			where: {
				shortName: {
					equals: eventShortName,
				},
			},
		})
		.then((res) => res.docs[0]);

	if (!event) {
		return {
			title: "Schedule",
			description: "AusSpeedruns Schedule",
			openGraph: {
				title: "Schedule",
				description: "AusSpeedruns Schedule",
			},
		};
	}

	const start = format(event.timeSettings?.startTime ?? new Date(), "d MMMM yyyy");
	const end = format(event.timeSettings?.endTime ?? new Date(), "d MMMM yyyy");
	const duration = `${start} – ${end}`;
	const title = `${event.shortName} Schedule`;
	const description = `Schedule for ${event.shortName} running from ${duration}`;

	const mediaUrl =
		event.media?.embed && typeof event.media.embed !== "number" && event.media.embed.url
			? event.media.embed.url
			: undefined;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images: mediaUrl ? [mediaUrl] : undefined,
		},
		twitter: {
			images: mediaUrl ? [mediaUrl] : undefined,
		},
	};
}

export default async function EventSchedule({ params }: URLProps) {
	const { event: eventShortName } = await params;

	const payload = await getPayload({ config: payloadConfig });
	const eventRequest = await payload.find({
		collection: "events",
		limit: 1,
		pagination: false,
		depth: 1,
		where: {
			shortName: {
				equals: eventShortName,
			},
		},
		// Blocks only need run IDs
		populate: { runs: { title: true } },
	});

	const event = eventRequest.docs[0];

	if (!event || !event.scheduleMetadata?.published) {
		return notFound();
	}

	const runsRequest = await payload.find({
		collection: "runs",
		pagination: false,
		depth: 2,
		overrideAccess: true,
		sort: "scheduledTime",
		where: {
			event: {
				equals: event.id,
			},
		},
		joins: {
			incentives: { limit: 0 },
			children: false,
		},
		populate: {
			users: {
				username: true,
			},
			incentives: {
				title: true,
				data: true,
			},
			"segment-types": {
				name: true,
				colour: true,
				textColour: true,
			},
			runs: {
				type: true,
			},
		},
	});

	return (
		<main className={styles.content}>
			<Schedule
				eventId={event.id}
				time={{
					start: event.timeSettings?.startTime || "",
					end: event.timeSettings?.endTime || "",
					timezone: event.timeSettings?.timezone || "",
				}}
				logo={event.media?.logo}
				horaro={event.scheduleMetadata?.horaro || ""}
				oengus={event.scheduleMetadata?.oengus || ""}
				scheduleBlocks={toScheduleBlocks(event.scheduleMetadata?.scheduleBlocks as EventBlockData[] | undefined)}
				shortName={event.shortName}
				runs={toScheduleRuns(runsRequest.docs)}
			/>
		</main>
	);
}
