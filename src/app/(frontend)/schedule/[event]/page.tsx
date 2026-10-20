import payloadConfig from "#payload-config";

import styles from "./page.module.css";
import { notFound } from "next/navigation";
import { Schedule } from "./schedule";
import type { Metadata } from "next";
import { getPayload } from "payload";
import dayjs from "dayjs";
import { getGameName, isGameRun } from "#utilities/runDisplay.ts";

export type Block = {
	name: string;
	colour: string;
	textColour: string;
	startRunId: string;
	endRunId?: string;
};

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

	const start = dayjs(event.timeSettings?.startTime).format("D MMMM YYYY");
	const end = dayjs(event.timeSettings?.endTime).format("D MMMM YYYY");
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
		},
		populate: {
			users: {
				username: true,
			},
			incentives: {
				title: true,
				data: true,
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
				scheduleBlocks={event.scheduleMetadata?.scheduleBlocks ?? []}
				shortName={event.shortName}
				runs={
					runsRequest.docs.flatMap((run, i) => {
						if (typeof run === "number") return [];
						if (!run.scheduledTime) return [];

						return {
							id: run.id,
							type: run.type ?? "run",
							game: isGameRun(run) ? getGameName(run.game) : (run.title ?? ""),
							estimate: run.estimate,
							scheduledTime: run.scheduledTime,
							platform: run.platform ?? "",
							category: run.category ?? "",
							runners:
								run.runners
									?.filter((runner) => typeof runner === "object")
									.map((runner) => runner.username) || [],
							coop: run.isCoop ?? false,
							race: run.isRace ?? false,
							donationIncentives:
								run.incentives?.docs?.filter((incentive) => typeof incentive === "object") ?? [],
							displayIndex: i,
						};
					}) ?? []
				}
			/>
		</main>
	);
}
