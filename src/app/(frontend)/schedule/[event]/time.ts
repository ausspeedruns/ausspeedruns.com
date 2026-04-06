import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const SQL_TIMESTAMP_FORMAT = "YYYY-MM-DD HH:mm:ss";
const HAS_TIMEZONE_SUFFIX = /(?:Z|[+-]\d{2}:?\d{2})$/i;

function parseScheduleTimeUtc(value: string) {
	const trimmed = value.trim();
	const normalized = trimmed.includes(" ") ? trimmed.replace(" ", "T") : trimmed;

	if (HAS_TIMEZONE_SUFFIX.test(normalized)) {
		return dayjs(normalized).utc();
	}

	const parsedSql = dayjs.utc(trimmed, SQL_TIMESTAMP_FORMAT, true);
	if (parsedSql.isValid()) {
		return parsedSql;
	}

	return dayjs.utc(normalized);
}

export function scheduleTimeToDisplayZone(value: string, eventTimezone: string, showEventTime: boolean) {
	const runTimeUtc = parseScheduleTimeUtc(value);
	return showEventTime ? runTimeUtc.tz(eventTimezone) : runTimeUtc.local();
}

export function scheduleTimeToLocalDate(value: string) {
	return parseScheduleTimeUtc(value).local();
}

export function scheduleTimeToEventDate(value: string, eventTimezone: string) {
	return parseScheduleTimeUtc(value).tz(eventTimezone);
}
