import type { Event, RandomRunBlock as RandomRunBlockProps, Run } from "#/payload-types";
import { getPayload } from "payload";
import config from "#payload-config";

export async function RandomRunBlock(props: RandomRunBlockProps) {
	let runToDisplay: string;

	const specificEventId = props.specificEvent as Event;
	const specificRuns = (props.specificRuns ?? []) as Run[];

	// If we have specific runs, use those
	if (specificRuns.length > 0) {
		const possibleRuns = specificRuns.filter((run) => run.youtube).map((run) => run.youtube) as string[];
		runToDisplay = possibleRuns[Math.floor(Math.random() * possibleRuns.length)];
	} else if (specificEventId) {
		// If we have a specific event, use runs from that event
		const possibleRuns = (specificEventId.runs?.docs ?? [])
			.filter((run): run is Run => typeof run !== "number" && Boolean(run.youtube))
			.map((run) => run.youtube) as string[];
		runToDisplay = possibleRuns[Math.floor(Math.random() * possibleRuns.length)];
	} else {
		// Otherwise, use random runs from the entire database
		const payload = await getPayload({ config });

		const allRuns = await payload.find({
			collection: "runs",
			limit: 1000, // Adjust this limit based on your needs and database size
			pagination: false,
			where: {
				youtube: {
					exists: true,
				},
			},
		});

		runToDisplay = allRuns.docs[Math.floor(Math.random() * allRuns.docs.length)].youtube as string;
	}

	return (
		<iframe
			width="560"
			height="315"
			src={runToDisplay.replace("watch?v=", "embed/")}
			title="YouTube video player"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerPolicy="strict-origin-when-cross-origin"
			allowFullScreen
		/>
	);
}
