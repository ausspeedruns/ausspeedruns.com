import { getPayload } from "payload";
import config from "#payload-config";

import type { Event } from "#/payload-types";
import { countedRunsWhere } from "#/utilities/runDisplay";

export interface AllTimeStats {
	totalRaised: number;
	eventCount: number;
	runCount: number;
}

type EventStatsInput = Pick<Event, "id" | "timeSettings" | "postEvent">;

/** Events count once they've started; raised amounts are summed regardless. */
export function summariseEvents(events: EventStatsInput[], now: Date = new Date()) {
	const startedEventIds: Event["id"][] = [];
	let totalRaised = 0;

	for (const event of events) {
		totalRaised += event.postEvent?.raised ?? 0;
		const startTime = event.timeSettings?.startTime;
		if (startTime && new Date(startTime) <= now) startedEventIds.push(event.id);
	}

	return { totalRaised, startedEventIds };
}

export async function getAllTimeStats(now: Date = new Date()): Promise<AllTimeStats> {
	const payload = await getPayload({ config });

	const events = await payload.find({
		collection: "events",
		depth: 0,
		pagination: false,
		overrideAccess: false,
		where: { _status: { equals: "published" } },
		select: { timeSettings: true, postEvent: { raised: true } },
	});

	const { totalRaised, startedEventIds } = summariseEvents(events.docs as EventStatsInput[], now);

	let runCount = 0;
	if (startedEventIds.length > 0) {
		const runs = await payload.count({
			collection: "runs",
			where: {
				and: [{ event: { in: startedEventIds } }, countedRunsWhere],
			},
		});
		runCount = runs.totalDocs;
	}

	return { totalRaised, eventCount: startedEventIds.length, runCount };
}
