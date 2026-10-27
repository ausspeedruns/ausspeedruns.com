import { tz as tzContext } from "@date-fns/tz";
import { differenceInCalendarDays, format, startOfDay } from "date-fns";

import type { DraftRow } from "./types.ts";

const ESTIMATE_REGEX = /^(\d{1,3}):([0-5]?\d)(?::([0-5]?\d))?$/;

/** Parses `H:MM[:SS]` into milliseconds. Returns null if invalid. */
export function estimateToMs(estimate: string | null | undefined): number | null {
	const match = ESTIMATE_REGEX.exec((estimate ?? "").trim());
	if (!match) return null;
	const [, hours, minutes, seconds] = match;
	return ((Number(hours) * 60 + Number(minutes)) * 60 + Number(seconds ?? 0)) * 1000;
}

/** Normalises `H:MM[:SS]` into `HH:MM:SS`. Leaves invalid values untouched. */
export function normaliseEstimate(estimate: string | null | undefined): string {
	const ms = estimateToMs(estimate);
	if (ms === null) return (estimate ?? "").trim();
	return msToEstimate(ms);
}

export function msToEstimate(ms: number): string {
	const totalSeconds = Math.max(0, Math.round(ms / 1000));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return [hours, minutes, seconds].map((part) => part.toString().padStart(2, "0")).join(":");
}

export function setupMinutesFor(
	row: Pick<DraftRow, "type" | "setupMinutesOverride" | "parentKey">,
	defaultSetup: number,
): number {
	// Games in a medley share the medley's slot; setup is part of the medley estimate
	if (row.parentKey) return 0;
	if (row.setupMinutesOverride !== null && row.setupMinutesOverride !== undefined) return row.setupMinutesOverride;
	return row.type === "run" || row.type === "medley" ? defaultSetup : 0;
}

export interface TimedRow<T> {
	row: T;
	start: Date;
	end: Date;
	/** End of the row including its trailing setup time (= start of the next row) */
	next: Date;
	estimateValid: boolean;
}

/**
 * Flows rows one after another from the start time: start(n+1) = start(n) + estimate(n) + setup(n).
 * Games in a medley don't move the schedule on; they're laid out inside their medley's slot instead.
 */
export function computeSchedule<
	T extends Pick<DraftRow, "type" | "estimate" | "setupMinutesOverride"> &
		Partial<Pick<DraftRow, "key" | "parentKey">>,
>(rows: T[], startTime: string | Date, defaultSetupMinutes: number): TimedRow<T>[] {
	let cursor = new Date(startTime).getTime();
	const childCursors = new Map<string, number>();

	return rows.map((row) => {
		const estimateMs = estimateToMs(row.estimate);
		const childCursor = row.parentKey ? childCursors.get(row.parentKey) : undefined;

		if (childCursor !== undefined && row.parentKey) {
			const start = new Date(childCursor);
			const end = new Date(childCursor + (estimateMs ?? 0));
			childCursors.set(row.parentKey, end.getTime());
			return { row, start, end, next: end, estimateValid: estimateMs !== null };
		}

		const start = new Date(cursor);
		const end = new Date(cursor + (estimateMs ?? 0));
		if (row.key && row.type === "medley") childCursors.set(row.key, cursor);
		cursor = end.getTime() + setupMinutesFor({ ...row, parentKey: null }, defaultSetupMinutes) * 60 * 1000;
		return { row, start, end, next: new Date(cursor), estimateValid: estimateMs !== null };
	});
}

/** End time of the last top-level row (excluding trailing setup), or null if there are no rows. */
export function scheduleEnd<T>(timed: TimedRow<T>[]): Date | null {
	const topLevel = timed.filter((entry) => !(entry.row as { parentKey?: string | null }).parentKey);
	return topLevel.length > 0 ? topLevel[topLevel.length - 1].end : null;
}

/** 0-based day of the event the date falls on, in the event timezone. */
export function eventDayIndex(date: Date, eventStart: string | Date, tz: string): number {
	const options = { in: tzContext(tz) };
	return differenceInCalendarDays(startOfDay(date, options), startOfDay(eventStart, options), options);
}

/** Formats using date-fns tokens (e.g. "EEE d MMM, h:mm a") in the given timezone. */
export function formatInTz(date: Date | string, tz: string, formatString: string): string {
	return format(date, formatString, { in: tzContext(tz) });
}

export function eventDayKey(date: Date, tz: string): string {
	return formatInTz(date, tz, "yyyy-MM-dd");
}
