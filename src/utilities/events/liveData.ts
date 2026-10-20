import { getPayload } from "payload";
import config from "#payload-config";

import type { Incentive, Run } from "#/payload-types";
import { toLiveIncentive, toLiveRun, type LiveData, type LiveIncentive, type LiveRun } from "./liveSchedule";

/** Loads the public schedule and active incentives used by the Event Live block. */
export async function getEventLiveData(eventId: number): Promise<LiveData> {
	const payload = await getPayload({ config });

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
			},
			populate: {
				games: { name: true },
				users: { username: true },
			},
		}),
		payload.find({
			collection: "incentives",
			where: { and: [{ event: { equals: eventId } }, { isActive: { equals: true } }] },
			depth: 2,
			limit: 200,
			pagination: false,
			select: { title: true, type: true, data: true, run: true },
			populate: {
				runs: { game: true, category: true, scheduledTime: true, estimate: true },
				games: { name: true },
			},
		}),
	]);

	return {
		runs: (runs.docs as Run[]).map(toLiveRun).filter((run): run is LiveRun => run !== null),
		incentives: (incentives.docs as Incentive[])
			.map(toLiveIncentive)
			.filter((incentive): incentive is LiveIncentive => incentive !== null),
	};
}
