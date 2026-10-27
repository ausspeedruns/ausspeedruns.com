import { tz } from "@date-fns/tz";
import { format } from "date-fns";

const HAS_TIMEZONE_SUFFIX = /(?:Z|[+-]\d{2}:?\d{2})$/i;
const SQL_TIMESTAMP = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Parses a schedule time as an instant. Values without a timezone are treated as UTC. */
export function scheduleTimeToDate(value: string): Date {
	const trimmed = value.trim();
	const normalized = trimmed.includes(" ") ? trimmed.replace(" ", "T") : trimmed;

	if (HAS_TIMEZONE_SUFFIX.test(normalized) || DATE_ONLY.test(normalized)) {
		return new Date(normalized);
	}

	if (SQL_TIMESTAMP.test(trimmed)) {
		return new Date(`${normalized}Z`);
	}

	const asUtc = new Date(`${normalized}Z`);
	return Number.isNaN(asUtc.getTime()) ? new Date(normalized) : asUtc;
}

/** date-fns options for working in the event timezone, or the viewer's local timezone. */
export function displayZoneOptions(eventTimezone: string, showEventTime: boolean) {
	return showEventTime ? { in: tz(eventTimezone) } : {};
}

/** Formats a schedule time using date-fns tokens in the event or local timezone. */
export function formatScheduleTime(value: string, eventTimezone: string, showEventTime: boolean, formatString: string) {
	return format(scheduleTimeToDate(value), formatString, displayZoneOptions(eventTimezone, showEventTime));
}
