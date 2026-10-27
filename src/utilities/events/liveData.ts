import { getPayload } from "payload";
import config from "#payload-config";

import type { Incentive, Run } from "#/payload-types";
import { toLiveIncentive, toLiveRuns, type LiveData, type LiveIncentive } from "./liveSchedule";

/** Loads the public schedule and active incentives used by the Event Live block. */
export async function getEventLiveData(eventId: number): Promise<LiveData> {
	const payload = await getPayload({ config });

	const event = await payload
		.findByID({ collection: "events", id: eventId, depth: 0, select: { scheduleMetadata: { published: true } } })
		.catch(() => null);
	// Unpublished schedules stay private, even to the live block
	if (!event?.scheduleMetadata?.published) return { runs: [], incentives: [] };

	const [runs, incentives] = await Promise.all([
		payload.find({
			collection: "runs",
			where: { event: { equals: eventId } },
			sort: "scheduledTime",
			depth: 1,
			limit: 1000,
			pagination: false,
			select: {
				type: true,
				game: true,
				category: true,
				platform: true,
				runners: true,
				otherRunners: true,
				isRace: true,
				isCoop: true,
				scheduledTime: true,
				estimate: true,
				title: true,
				parent: true,
				order: true,
			},
			populate: {
				games: { name: true },
				users: { username: true },
				runs: { type: true },
			},
		}),
		payload.find({
			collection: "incentives",
			where: { and: [{ event: { equals: eventId } }, { isActive: { equals: true } }] },
			depth: 2,
			limit: 200,
			pagination: false,
			select: { title: true, type: true, description: true, notes: true, data: true, run: true },
			populate: {
				runs: { type: true, title: true, game: true, category: true, scheduledTime: true, estimate: true },
				games: { name: true },
			},
		}),
	]);

	return {
		runs: toLiveRuns(runs.docs as Run[]),
		incentives: (incentives.docs as Incentive[])
			.map(toLiveIncentive)
			.filter((incentive): incentive is LiveIncentive => incentive !== null),
	};
}
