import { getPayload } from "payload";

import config from "#payload-config";
import { getEventLiveData } from "#/utilities/events/liveData";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
	const eventId = Number(new URL(request.url).searchParams.get("event"));
	if (!Number.isInteger(eventId) || eventId <= 0) {
		return new Response("A valid event ID is required.", { status: 400 });
	}

	const payload = await getPayload({ config });
	const event = await payload
		.findByID({ collection: "events", id: eventId, depth: 0, overrideAccess: false, select: { shortName: true } })
		.catch(() => null);

	if (!event) {
		return new Response("Event not found.", { status: 404 });
	}

	try {
		const data = await getEventLiveData(eventId);
		return Response.json(data, {
			headers: { "Cache-Control": "public, max-age=15, s-maxage=15, stale-while-revalidate=30" },
		});
	} catch (error) {
		payload.logger.error({ err: error, message: "Failed to load event live data." });
		return new Response("Failed to load live data.", { status: 500 });
	}
}
