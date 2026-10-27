import { differenceInDays } from "date-fns";

/** Number of days an event runs for (inclusive), or 0 if its dates haven't been set. */
export function getEventDays(startDate: string | null | undefined, endDate: string | null | undefined): number {
	if (!startDate || !endDate) return 0;
	const days = differenceInDays(endDate, startDate) + 1;
	return Number.isFinite(days) && days > 0 ? days : 0;
}
