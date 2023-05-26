import { gql, ApolloClient, InMemoryCache } from '@keystone-6/core/admin-ui/apollo';
import { format, formatInTimeZone } from 'date-fns-tz';

const QUERY_RUNS = gql`
	query GetEventRuns($eventShortname: String) {
		event(where: { shortname: $eventShortname }) {
			id
			name
			eventTimezone
			runs(orderBy: {scheduledTime: asc}) {
				id
				runners {
					id
					username
					twitter
					twitch
				}
				game
				category
				platform
				estimate
				race
				coop
				scheduledTime
				donationIncentiveObject {
					title
				}
			}
		}
	}
`;

interface QueryRuns {
	event: {
		id: string;
		name: string;
		eventTimezone: string;
		runs: {
			id: string;
			runners: {
				id: string;
				username: string;
				twitter: string;
				twitch: string;
			}[];
			game: string;
			category: string;
			platform: string;
			estimate: string;
			race: boolean;
			coop: boolean;
			scheduledTime: string;
			donationIncentiveObject: {
				title: string;
			}[];
		}[];
	}
}

interface HoraroRoot {
	schedule: Schedule;
}

interface Schedule {
	columns: string[];
	event?: Event;
	items: Item[];
	name?: string;
	secret?: null | string;
	setup?: string;
	setup_t?: number;
	slug?: string;
	start?: string;
	start_t?: number;
	theme?: null | string;
	timezone?: string;
	twitch?: null | string;
	twitter?: null | string;
	updated?: string;
	url?: string;
	website?: null | string;
}

interface Event {
	name: string;
	slug: string;
}

interface Item {
	data: Array<null | string>;
	length?: string;
	length_t?: number;
	scheduled?: string;
	scheduled_t?: number;
}

function estimateToHoraroLengths(estimate: string) {
	const estimateSplit = estimate.split(':');

	let horaroLength = "PT";
	let horaroLengthSeconds = 0;

	if (estimateSplit[0] !== "00" && estimateSplit[0] !== "0") {
		horaroLength += `${estimateSplit[0]}H`;
		horaroLengthSeconds += parseInt(estimateSplit[0], 10) * 60 * 60;
	}

	if (estimateSplit[1] !== "00") {
		horaroLength += `${estimateSplit[1]}M`;
		horaroLengthSeconds += parseInt(estimateSplit[1], 10) * 60;
	}

	if (estimateSplit[2] !== "00") {
		horaroLength += `${estimateSplit[2]}S`;
		horaroLengthSeconds += parseInt(estimateSplit[3], 10);
	}

	return { length: horaroLength, lengthSeconds: horaroLengthSeconds };
}

function secondsToHoraroLength(seconds: number) {
	let horaroLength = "PT";

	const hours = Math.floor(seconds / (60 * 60));
	const mins = Math.floor((seconds - (hours * 60 * 60)) / 60)
	const secondsLeft = seconds - (hours * 60 * 60) - (mins * 60);

	if (hours > 0) {
		horaroLength += `${hours}H`;
	}

	if (mins > 0) {
		horaroLength += `${mins.toString().padStart(2, '0')}M`;
	}

	if (secondsLeft > 0) {
		horaroLength += `${secondsLeft.toString().padStart(2, '0')}S`;
	}

	return horaroLength;
}

function dateToISOTimezone(date: Date, timezone: string) {
	return formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm:ssxxx");
}

function endRunTime(scheduled: Date, estimate: string) {
	const estimateParts = estimate.split(/:/);
	const estimateMillis = parseInt(estimateParts[0], 10) * 60 * 60 * 1000 + parseInt(estimateParts[1], 10) * 60 * 1000;

	const scheduledTime = new Date(scheduled);
	// scheduledTime.setTime(scheduledTime.getTime());
	scheduledTime.setTime(scheduledTime.getTime() + estimateMillis);
	return scheduledTime;
}

function runnersToHoraro(runners: QueryRuns['event']['runs'][0]['runners'], race: boolean, coop: boolean) {
	const formattedRunners = runners.map(runner => runner.twitch ? `[${runner.username}](https://www.twitter.com/${runner.twitch})` : runner.username);

	if (race) {
		return coop ? formattedRunners.join(', ') : formattedRunners.join(' vs. ');
	}

	return formattedRunners.join(', ');
}

function runnersToTwitter(runners: QueryRuns['event']['runs'][0]['runners'], race: boolean, coop: boolean) {
	const formattedRunners: string[] = [];
	let numberOfTwitters = 0;
	
	const formattedTwitter: string[] = [];
	
	runners.forEach(runner => {
		if (runner.twitter) {
			numberOfTwitters++;
			formattedTwitter = runner.twitter.substring(1);
			// formattedTwitter = formattedTwitter.substring(1);
		}
		
		formattedRunners.push(runner.twitter ? `[@${runner.username}](https://www.twitter.com/${formattedTwitter})` : "N/A")
	});

	if (numberOfTwitters === 0) {
		return null;
	}

	if (race) {
		return coop ? formattedRunners.join(', ') : formattedRunners.join(' vs. ');
	}

	return formattedRunners.join(', ');
}

export async function exportHoraro(eventShortname: string) {
	// Get required information
	const client = new ApolloClient({ uri: '/api/graphql', cache: new InMemoryCache() });

	const { data: runData, errors } = await client.query<QueryRuns>({ query: QUERY_RUNS, variables: { eventShortname } });

	if (errors) {
		return {
			success: false,
			errorMsg: errors,
			data: {}
		}
	}

	// Setup time
	// Setup time is not defined internally so just take the difference between the first 2 runs
	let setupTime = 0;
	if (runData.event.runs.length > 1) {
		setupTime = (new Date(runData.event.runs[1].scheduledTime).getTime() - endRunTime(new Date(runData.event.runs[0].scheduledTime), runData.event.runs[0].estimate).getTime()) / 1000
	}

	// Format object
	const horaro: HoraroRoot = {
		schedule: {
			name: "Main Schedule",
			website: "https://ausspeedruns.com/",
			twitch: "ausspeedruns",
			twitter: "AusSpeedruns",
			event: {
				name: runData.event.name,
				slug: eventShortname,
			},
			setup_t: setupTime,
			setup: secondsToHoraroLength(setupTime),
			start: dateToISOTimezone(new Date(runData.event.runs[0].scheduledTime), runData.event.eventTimezone),
			start_t: parseInt(format(new Date(runData.event.runs[0].scheduledTime), 't')),
			columns: [
				"Game",
				"Category",
				"Runner",
				"Platform",
				"Donation Challenge",
				"Twitter"
			],
			items: runData.event.runs.map(run => {
				const lengths = estimateToHoraroLengths(run.estimate);
				// const scheduleDate = new Date(run.scheduledTime);
				return {
					length: lengths.length,
					length_t: lengths.lengthSeconds,
					// scheduled: dateToISOTimezone(scheduleDate, runData.event.eventTimezone),
					// scheduled_t: parseInt(format(scheduleDate, 't')),
					data: [
						// 512 is a limit for Horaro
						run?.game.substring(0, 512) ?? null,
						run?.category === "?" ? null : run?.category.substring(0, 512) ?? null,
						runnersToHoraro(run?.runners ?? [], run?.race ?? false, run?.coop ?? false).substring(0, 512) ?? null,
						run?.platform === "?" ? null : run?.platform.substring(0, 512) ?? null,
						run?.donationIncentiveObject.length === 0 ? null : run?.donationIncentiveObject.map(incentive => incentive.title).join(' | ').substring(0, 512) ?? null,
						runnersToTwitter(run?.runners ?? [], run?.race ?? false, run?.coop ?? false)?.substring(0, 512) ?? null,
					]
				}
			})
		}
	}

	// Return object for download
	return {
		success: true,
		data: horaro,
	};
}
