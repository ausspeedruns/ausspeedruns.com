import { gql, ApolloClient, InMemoryCache } from '@keystone-6/core/admin-ui/apollo';
import type { Run } from './schedule-types';

const CREATE_RUNS_MUTATION = gql`
	mutation CreateAllRuns($runs: [RunCreateInput!]!) {
		createRuns(data: $runs) {
			id
			originalSubmission {
				id
			}
		}
	}
`;

interface CreateRuns {
	createRuns: {
		id: string;
		originalSubmission: {
			id: string;
		};
	}[];
}

const CREATE_INCENTIVES = gql`
	mutation CreateAllIncentives($incentives: [IncentiveCreateInput!]!) {
		createIncentives(data: $incentives) {
			id
		}
	}
`;

interface CreateIncentives {
	createIncentives: {
		id: string;
	}[];
}

const UPDATE_EVENT_END = gql`
	mutation CreateAllIncentives($endDate: DateTime, $shortname: String) {
		updateEvent(
			where: { shortname: $shortname }
			data: { endDate: $endDate }
		) {
			id
			endDate
		}
	}
`;

interface UpdateEventEnd {
	updateEvent: {
		id: string;
		endDate: string;
	};
}

interface ReturnedIncentives {
	title: string;
	notes: string;
	type: string;
	data: object;
	submissionId: string;
}

// Create the mutation command to send to the server to create all the runs, incentives and update miscellaneous stuff
export async function createSchedule(
	runs: Run[],
	eventShortname: string,
	finalIncentives: ReturnedIncentives[],
	raceRunners: { gameId: string; runners: string[] }[],
) {
	const client = new ApolloClient({
		uri: "/api/graphql",
		cache: new InMemoryCache(),
	});
	try {
		/****************/
		/* CREATE RUNS */
		/**************/
		const finalRuns = runs.map((run) => {
			let connectedSubmission;
			if (run.submissionId) {
				connectedSubmission = {
					originalSubmission: { connect: { id: run.submissionId } },
				};
			}

			console.log(run.uuid, raceRunners);

			let runners;
			let manualRunners = raceRunners.find(
				(raceRunners) => raceRunners.gameId === run.uuid,
			);
			if (manualRunners) {
				runners = {
					runners: {
						connect: manualRunners.runners.map((runner) => {
							return { id: runner };
						}),
					},
				};
			} else if (run.runner[0].id) {
				runners = {
					runners: {
						connect: {
							id: run.runner[0].id,
						},
					},
				};
			} else if (!runners) {
				// If no runners ID then put them in the racer field
				runners = {
					racer: run.runner
						.map((runner) => runner.username)
						.join(", "),
				};
			}

			return {
				...runners,
				...connectedSubmission,
				game: run.game,
				category: run.category || "?",
				platform: run.platform || "?",
				estimate: run.estimate,
				scheduledTime: run.scheduled,
				race: run.race === "RACE" || run.race === "COOP",
				coop: run.race === "COOP",
				event: { connect: { shortname: eventShortname } },
				...(run.finalTime && { finalTime: run.finalTime }),
				...(run.youtubeVOD && { youtubeVOD: run.youtubeVOD }),
				...(run.twitchVOD && { twitchVOD: run.twitchVOD }),
			};
		});

		console.log(finalRuns);

		const allRuns = await client.mutate<CreateRuns>({
			mutation: CREATE_RUNS_MUTATION,
			variables: { runs: finalRuns },
		});

		/*******************************/
		/* CREATE DONATION INCENTIVES */
		/*****************************/
		const donationIncentives = finalIncentives.map((incentive) => {
			if (!allRuns.data) return;

			const originalRun = allRuns.data.createRuns.find(
				(run) => run.originalSubmission?.id === incentive.submissionId,
			)?.id;

			let connectedRun: { run: { connect: { id: string } } } | undefined =
				undefined;
			if (originalRun) {
				connectedRun = {
					run: {
						connect: {
							id: originalRun,
						},
					},
				};
			} else {
				const allOriginalSubmissions = allRuns.data.createRuns.map(run => run.originalSubmission.id);
				console.log("Couldn't find " + incentive.submissionId + " in", allOriginalSubmissions)
			}

			return {
				...connectedRun,
				event: { connect: { shortname: eventShortname } },
				title: incentive.title,
				notes: incentive.notes,
				type: incentive.type,
				data: incentive.data,
				active: true,
			};
		});

		const allIncentives = await client.mutate<CreateIncentives>({
			mutation: CREATE_INCENTIVES,
			variables: { incentives: donationIncentives },
		});

		console.log(allIncentives);

		/**************************/
		/* UPDATE END EVENT TIME */
		/************************/
		const updatedEventTime = await client.mutate<UpdateEventEnd>({
			mutation: UPDATE_EVENT_END,
			variables: {
				endDate: endRunTime(
					finalRuns[finalRuns.length - 1].scheduledTime,
					finalRuns[finalRuns.length - 1].estimate,
				),
				shortname: eventShortname,
			},
		});

		console.log(
			endRunTime(
				finalRuns[finalRuns.length - 1].scheduledTime,
				finalRuns[finalRuns.length - 1].estimate,
			),
			updatedEventTime,
			{
				eventEnd: endRunTime(
					finalRuns[finalRuns.length - 1].scheduledTime,
					finalRuns[finalRuns.length - 1].estimate,
				),
				shortname: eventShortname,
			},
		);

		// Final checks to see if anything failed
		if (allRuns?.errors && allRuns?.errors?.length > 0) {
			throw allRuns.errors;
		} else if (allIncentives?.errors && allIncentives?.errors?.length > 0) {
			throw allIncentives.errors;
		} else {
			// Updating end event is not critical
			if (updatedEventTime?.errors) {
				console.error(updatedEventTime?.errors);
			}

			if (!allRuns.data || !allIncentives.data) {
				throw {
					allRuns: allRuns,
					allIncentives: allIncentives,
					error: "Runs and Incentives data missing but no errors!",
				};
			}

			return {
				success: true,
				runs: allRuns.data.createRuns.length,
				incentives: allIncentives.data.createIncentives.length,
			};
		}
	} catch (error) {
		console.error(error);
		return { success: false, runs: 0, incentives: 0 };
	}
}

// Given the estimate and start time, get when the run ends as a date
function endRunTime(scheduled: Date, estimate: string) {
	const estimateParts = estimate.split(/:/);
	const estimateMillis =
		parseInt(estimateParts[0], 10) * 60 * 60 * 1000 +
		parseInt(estimateParts[1], 10) * 60 * 1000;

	const scheduledTime = new Date(scheduled);
	// scheduledTime.setTime(scheduledTime.getTime());
	scheduledTime.setTime(scheduledTime.getTime() + estimateMillis);
	return scheduledTime;
}
