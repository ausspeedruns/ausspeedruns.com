import type { Access, FieldAccess, Where } from "payload";

import { canAccessTechSchedule } from "./helpers.ts";

/**
 * Collection-level access for schedule data (runs, incentives): tech/content staff see everything,
 * everyone else only sees documents whose event is published and has a published schedule.
 */
export const scheduleVisible: Access = async ({ req }) => {
	if (await canAccessTechSchedule(req)) return true;

	const visible: Where = {
		and: [
			{ "event._status": { equals: "published" } },
			{ "event.scheduleMetadata.published": { equals: true } },
		],
	};
	return visible;
};

/** Field-level access for private run details such as special requirements. */
export const techScheduleField: FieldAccess = ({ req }) => canAccessTechSchedule(req);
