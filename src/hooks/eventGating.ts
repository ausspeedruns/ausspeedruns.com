import { APIError, type PayloadRequest } from "payload";

import type { Event } from "#/payload-types";
import { relationId } from "#access/helpers.ts";

export type EventSettingKey = "isAcceptingSubmissions" | "isAcceptingBackups" | "isAcceptingVolunteers";

export async function loadEventSettings(
	req: PayloadRequest,
	eventValue: number | Event | null | undefined,
): Promise<Event["settings"] | null> {
	const eventId = relationId(eventValue);
	if (eventId === null) return null;

	try {
		const event = await req.payload.findByID({
			collection: "events",
			id: eventId,
			depth: 0,
			overrideAccess: true,
			select: { settings: true },
			req,
		});
		return event?.settings ?? {};
	} catch {
		throw new APIError("The selected event does not exist.", 400, undefined, true);
	}
}

/** Throws a user-facing 403 error. */
export function forbidden(message: string): never {
	throw new APIError(message, 403, undefined, true);
}
