import Papa from 'papaparse';
import { gql, ApolloClient, InMemoryCache } from '@keystone-6/core/admin-ui/apollo';
import { v4 as uuid } from "uuid";
import type { Run } from './schedule-types';

const RUNNERS_NAMES_QUERY = gql`
	query GetAllKnownRunners($runners: [ID!]) {
		users(where: { id: { in: $runners } }) {
			id
			username
		}
	}
`;

interface RunnersNames {
	users: {
		id: string;
		username: string;
	}[];
}

export async function parseScheduleToRuns(
	file: File,
	eventSettings: { startTime: Date; turnaroundTime: number },
) {
	return new Promise<Awaited<ReturnType<typeof csvToRuns>>>(
		(resolve, reject) => {
			Papa.parse<UploadedSchedule>(file, {
				complete: async (results) => {
					resolve(await csvToRuns(results.data, eventSettings));
				},
				error: (error) => {
					reject(error);
				},
				header: true,
				skipEmptyLines: true,
			});
		},
	);
}

interface UploadedSchedule {
	game: string;
	category: string;
	estimate: string;
	runner: string;
	platform: string;
	ageRating: "m_or_lower" | "ma15" | "ra18" | "";
	donationIncentive: string;
	specialRequirements: string;
	video: string;
	availability: string;
	racer: string;
	race: "no" | "solo" | "only" | "";
	coop: string;
	willingBackup: string;
	id: string;
	runnerId: string;
	youtubeVOD?: string;
	twitchVOD?: string;
	finalTime?: string;
}

/*
	CSV Schedule to Runs
	CSV Requires:
		runnerId
		runner
		submissionId
		game
		category
		platform
		estimate
		donationIncentive
		race
		racer
		coop
	
	CSV does not require but will add:
		youtubeVOD
		twitchVOD
		finalTime
*/
// Convert the CSV data to object data
async function csvToRuns(
	csvResults: UploadedSchedule[],
	eventSettings: { startTime: Date; turnaroundTime: number },
): Promise<Run[]> {
	// Get all runner names
	const runnerNames = await getRunners(
		csvResults.map((submission) => submission.runnerId),
	);

	const runningTime = new Date(eventSettings.startTime);
	return csvResults.map((submission) => {
		const estimateParts = submission.estimate.split(/:/);
		const estimateMillis =
			parseInt(estimateParts[0], 10) * 60 * 60 * 1000 +
			parseInt(estimateParts[1], 10) * 60 * 1000;

		const scheduledTime = new Date(runningTime);
		// scheduledTime.setTime(scheduledTime.getTime());
		runningTime.setTime(
			scheduledTime.getTime() +
			estimateMillis +
			eventSettings.turnaroundTime * 60 * 1000,
		);

		let runner = runnerNames.find(
			(runner) => submission.runnerId == runner.id,
		) ??
			runnerNames.find(
				(runner) => submission.runner == runner.username,
			) ?? {
			username:
				submission?.racer !== ""
					? `${submission?.runner}, ${submission?.racer}`
					: submission?.runner,
		};

		if (submission.game.toLowerCase() === "setup buffer") {
			runner = {
				id: undefined,
				username: "AusSpeedruns",
			};
		}

		let extraData: {
			youtubeVOD?: string;
			twitchVOD?: string;
			finalTime?: string;
		} = {};

		if (submission.youtubeVOD) extraData.youtubeVOD = submission.youtubeVOD;
		if (submission.twitchVOD) extraData.twitchVOD = submission.twitchVOD;
		if (submission.finalTime) extraData.finalTime = submission.finalTime;

		return {
			runnerId: submission.runnerId,
			runner: [runner],
			submissionId: submission.id,
			game: submission.game,
			category: submission.category,
			platform: submission.platform,
			estimate: submission.estimate,
			internalDonationIncentive: submission.donationIncentive,
			race:
				submission.race !== "no" && submission.race !== ""
					? submission.coop.toLocaleLowerCase() === "true"
						? "COOP"
						: "RACE"
					: "",
			internalRacer: submission.racer,
			internalRunner: submission.runner,
			scheduled: scheduledTime,
			uuid: uuid(),
			...extraData,
		};
	});
}

// Query all users
async function getRunners(runnersID: string[]) {
	const client = new ApolloClient({
		uri: "/api/graphql",
		cache: new InMemoryCache(),
	});
	try {
		return (
			await client.query<RunnersNames>({
				query: RUNNERS_NAMES_QUERY,
				variables: runnersID,
			})
		).data.users;
	} catch (error) {
		console.error(error);
		return [];
	}
}
