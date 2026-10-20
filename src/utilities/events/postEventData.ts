import { getPayload } from "payload";
import config from "#payload-config";

import type { Event, Run } from "#/payload-types";
import { isCountedRun } from "#/utilities/runDisplay";

export async function getEventRuns(eventId: number | string): Promise<Run[]> {
	const payload = await getPayload({ config });

	const runs = await payload.find({
		collection: "runs",
		where: { event: { equals: eventId } },
		sort: "scheduledTime",
		depth: 1,
		limit: 1000,
		pagination: false,
	});

	return (runs.docs as Run[]).filter(isCountedRun);
}

export async function resolveEvent(event: number | Event | null | undefined): Promise<Event | null> {
	if (!event) return null;
	if (typeof event === "object") return event;

	const payload = await getPayload({ config });
	try {
		return (await payload.findByID({ collection: "events", id: event, depth: 1 })) as Event;
	} catch {
		return null;
	}
}

/** e.g. "10 – 13 Jul 2024" or "30 Jun – 2 Jul 2024". */
export function formatEventDateRange(event: Event): string | null {
	const { startTime, endTime, timezone } = event.timeSettings ?? {};
	if (!startTime) return null;

	const start = new Date(startTime);
	const end = endTime ? new Date(endTime) : null;
	const timeZone = timezone || "Australia/Melbourne";

	try {
		const formatter = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone });
		return end ? formatter.formatRange(start, end) : formatter.format(start);
	} catch {
		return start.toLocaleDateString("en-AU");
	}
}

export { formatCurrency } from "#/utilities/formatCurrency";
