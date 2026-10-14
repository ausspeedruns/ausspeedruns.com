import type { RandomRunBlock as RandomRunBlockProps, Run } from "#/payload-types";
import { getPayload, type Where } from "payload";
import config from "#payload-config";

import { relationId } from "#access/helpers.ts";
import { getYouTubeEmbedUrl } from "#utilities/runDisplay.ts";

function pickRandom<T>(items: T[]): T | undefined {
	return items[Math.floor(Math.random() * items.length)];
}

export async function RandomRunBlock(props: RandomRunBlockProps) {
	const specificRuns = (props.specificRuns ?? []).filter((run): run is Run => typeof run === "object" && run !== null);

	let candidates: string[];

	if (specificRuns.length > 0) {
		candidates = specificRuns.map((run) => run.youtube).filter((url): url is string => Boolean(url));
	} else {
		// Use runs from the selected event, or from the entire database if no event is selected
		const payload = await getPayload({ config });
		const eventId = relationId(props.specificEvent);

		const where: Where = { youtube: { exists: true } };
		if (eventId !== null) where.event = { equals: eventId };

		const runs = await payload.find({
			collection: "runs",
			depth: 0,
			limit: 1000,
			pagination: false,
			select: { youtube: true },
			where,
		});

		candidates = runs.docs.map((run) => run.youtube).filter((url): url is string => Boolean(url));
	}

	const embedUrl = getYouTubeEmbedUrl(pickRandom(candidates));
	if (!embedUrl) return null;

	return (
		<iframe
			width="560"
			height="315"
			src={embedUrl}
			title="YouTube video player"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerPolicy="strict-origin-when-cross-origin"
			allowFullScreen
		/>
	);
}
