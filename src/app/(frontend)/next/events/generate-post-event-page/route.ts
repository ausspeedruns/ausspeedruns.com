import { createLocalReq, getPayload } from "payload";
import { headers } from "next/headers";

import config from "#payload-config";
import { manageContent } from "#/access/manageContent";
import { upsertPostEventPage } from "#/utilities/events/upsertPostEventPage.ts";

interface GenerateEventPagePayload {
	eventId?: number | string;
}

export async function POST(request: Request): Promise<Response> {
	const payload = await getPayload({ config });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		return new Response("Action forbidden.", { status: 403 });
	}

	let requestBody: GenerateEventPagePayload;

	try {
		requestBody = (await request.json()) as GenerateEventPagePayload;
	} catch {
		return new Response("Invalid request body.", { status: 400 });
	}

	if (!requestBody?.eventId) {
		return new Response("Event ID is required.", { status: 400 });
	}

	try {
		const payloadReq = await createLocalReq({ user }, payload);

		if (!(await manageContent({ req: payloadReq }))) {
			return new Response("Action forbidden.", { status: 403 });
		}

		const result = await upsertPostEventPage({
			eventId: requestBody.eventId,
			payload,
			req: payloadReq,
		});

		return Response.json({
			success: true,
			...result,
			adminPath: `/admin/collections/pages/${result.pageID}`,
			pagePath: `/${result.slug}`,
		});
	} catch (error) {
		payload.logger.error({ err: error, message: "Failed to generate post-event page." });
		return new Response("Failed to generate post-event page.", { status: 500 });
	}
}
