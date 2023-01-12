/** @jsxRuntime classic */
/** @jsx jsx */
/** @jsxFrag */

import { jsx, Heading } from '@keystone-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@keystone-6/core/admin-ui/components';
import { useQuery, gql, useLazyQuery, ApolloClient, InMemoryCache } from '@keystone-6/core/admin-ui/apollo';
import { Button } from '@keystone-ui/button';
import { useToasts } from '@keystone-ui/toast';
import { Select, FieldContainer, FieldLabel } from '@keystone-ui/fields';
import {
	CircularProgress,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	InputAdornment,
	OutlinedInput,
	Stack as MUIStack,
} from '@mui/material';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import Papa from 'papaparse';
import { formatInTimeZone } from 'date-fns-tz';
import { Lists } from '.keystone/types';
import { DonationIncentiveCreator } from '../components/DonationIncentiveCreator';
import { RaceRunnerMatcher } from '../components/RaceRunnerMatcher';
import { formatDistanceStrict } from 'date-fns';
import { exportHoraro } from '../util/export-horaro';
import { v4 as uuid } from 'uuid';

const EventTitle = styled.h1`
	text-align: center;
	margin: 0;
	margin-top: 16px;
`;

const CustomInput = styled.label`
	/* border: 1px solid #ccc; */
	background: #16a34a;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 6px 12px;
	border-radius: 6px;
	margin-left: 16px;
	cursor: pointer;
	color: white;
	font-weight: 500;
`;

const HiddenInput = styled.input`
	display: none;
`;

const EVENTS_LIST_QUERY = gql`
	query {
		events {
			shortname
		}
	}
`;

interface EventsListQuery {
	events: {
		shortname: string;
	}[];
}

const EVENT_QUERY = gql`
	query ($event: String) {
		event(where: { shortname: $event }) {
			id
			submissionsCount(where: { status: { equals: accepted } })
			runsCount
			startDate
			eventTimezone
			runs(orderBy: { scheduledTime: asc }) {
				id
				runners {
					id
					username
				}
				game
				category
				platform
				estimate
				finalTime
				donationIncentive
				race
				racer
				coop
				twitchVOD
				youtubeVOD
				scheduledTime
				originalSubmission {
					id
				}
				donationIncentiveObject {
					id
					title
				}
			}
			submissions {
				id
				runner {
					id
					username
				}
				game
				category
				platform
				estimate
				donationIncentive
				ageRating
				specialReqs
				race
				racer
				coop
				video
				availability
				willingBackup
			}
		}
	}
`;

interface EventQuery {
	event: {
		id: string;
		startDate: string;
		eventTimezone: string;
		submissionsCount: number;
		runsCount: number;
		runs: {
			id: string;
			runners: {
				id: string;
				username: string;
			}[];
			game: string;
			category: string;
			platform: string;
			estimate: string;
			finalTime?: string;
			donationIncentive?: string;
			race: Lists.Run.Item['race'];
			racer: string;
			coop: boolean;
			scheduledTime?: string;
			youtubeVOD: string;
			twitchVOD: string;
			originalSubmission: {
				id: string;
			};
			donationIncentiveObject: {
				id: string;
				title: string;
			}[];
		}[];
		submissions: {
			id: string;
			runner: {
				id: string;
				username: string;
			}[];
			game: string;
			category: string;
			platform: string;
			estimate: string;
			donationIncentive: string;
			ageRating: string;
			specialReqs: string;
			race: string;
			racer: string;
			coop: string;
			video: string;
			availability: boolean[];
			willingBackup: boolean;
		};
	};
}

const EVENT_SUBMISSIONS_QUERY = gql`
	query ($event: String) {
		event(where: { shortname: $event }) {
			id
			shortname
			startDate
			endDate
			eventTimezone
			submissions {
				id
				runner {
					id
					username
				}
				game
				category
				platform
				estimate
				donationIncentive
				ageRating
				specialReqs
				race
				racer
				coop
				video
				availability
				willingBackup
			}
		}
	}
`;

interface EventSubmissions {
	event: {
		id: string;
		shortname: string;
		startDate: string;
		endDate: string;
		eventTimezone: string;
		submissions: {
			id: string;
			runner: {
				id: string;
				username: string;
			};
			game: string;
			category: string;
			platform: string;
			estimate: string;
			donationIncentive: string;
			ageRating: 'm_or_lower' | 'ma15' | 'ra18';
			specialReqs: string;
			race: 'no' | 'solo' | 'only';
			racer: string;
			coop: boolean;
			video: string;
			availability: boolean[];
			willingBackup: boolean;
		}[];
	};
}

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

const QUERY_EVENT_RUNS_SUBMISSIONS = gql`
	query ($eventShortname: String) {
		event(where: { shortname: $eventShortname }) {
			runs {
				originalSubmission {
					id
				}
			}
			submissions {
				id
				willingBackup
			}
		}
	}
`;

interface QueryEventRunsSubmissions {
	event: {
		runs: {
			originalSubmission: {
				id: string;
			};
		}[];
		submissions: {
			id: string;
			willingBackup: boolean;
		}[];
	};
}

const UPDATE_SUBMISSIONS = gql`
	mutation SubmissionsAccept($submissions: [SubmissionUpdateArgs!]!) {
		updateSubmissions(data: $submissions) {
			id
		}
	}
`;

interface UpdateSubmissions {
	updateSubmissions: {
		id: string;
	}[];
}

const UPDATE_EVENT_END = gql`
	mutation CreateAllIncentives($endDate: DateTime, $shortname: String) {
		updateEvent(where: { shortname: $shortname }, data: { endDate: $endDate }) {
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

interface UploadedSchedule {
	game: string;
	category: string;
	estimate: string;
	runner: string;
	platform: string;
	ageRating: 'm_or_lower' | 'ma15' | 'ra18' | '';
	donationIncentive: string;
	specialRequirements: string;
	video: string;
	availability: string;
	racer: string;
	race: 'no' | 'solo' | 'only' | '';
	coop: string;
	willingBackup: string;
	id: string;
	runnerId: string;
	youtubeVOD?: string;
	twitchVOD?: string;
	finalTime?: string;
}

// Converts all keystone submissions to a CSV to download.
function parseSubmissionsToCSV(submissionData: EventSubmissions) {
	const csvData = submissionData.event.submissions.map((submission) => {
		const flattenedSubmission = {
			game: submission.game,
			category: submission.category,
			estimate: submission.estimate,
			runner: submission.runner.username,
			platform: submission.platform,
			ageRating: submission.ageRating,
			donationIncentive: submission.donationIncentive,
			specialRequirements: submission.specialReqs,
			video: submission.video,
			availability: submission.availability.toString(),
			racer: submission.racer,
			race: submission.race,
			coop: submission.coop,
			willingBackup: submission.willingBackup,
			id: submission.id,
			runnerId: submission.runner.id,
		};

		return flattenedSubmission;
	});

	const papaCSV = Papa.unparse(csvData);
	return new Blob([papaCSV], { type: 'text/csv;charset=utf-8;' });
}

// Read the CSV
async function parseScheduleToRuns(file: File, eventSettings: { startTime: Date; turnaroundTime: number }) {
	return new Promise<Awaited<ReturnType<typeof csvToRuns>>>((resolve, reject) => {
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
	});
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
async function csvToRuns(csvResults: UploadedSchedule[], eventSettings: { startTime: Date; turnaroundTime: number }) {
	// Get all runner names
	const runnerNames = await getRunners(csvResults.map((submission) => submission.runnerId));

	const runningTime = new Date(eventSettings.startTime);
	return csvResults.map((submission) => {
		const estimateParts = submission.estimate.split(/:/);
		const estimateMillis = parseInt(estimateParts[0], 10) * 60 * 60 * 1000 + parseInt(estimateParts[1], 10) * 60 * 1000;

		const scheduledTime = new Date(runningTime);
		// scheduledTime.setTime(scheduledTime.getTime());
		runningTime.setTime(scheduledTime.getTime() + estimateMillis + eventSettings.turnaroundTime * 60 * 1000);

		let runner = runnerNames.find((runner) => submission.runnerId == runner.id) ??
			runnerNames.find((runner) => submission.runner == runner.username) ?? {
				id: undefined,
				username: submission?.racer !== '' ? `${submission?.runner}, ${submission?.racer}` : submission?.runner,
			};

		if (submission.game.toLowerCase() === 'setup buffer') {
			runner = {
				id: undefined,
				username: 'AusSpeedruns',
			};
		}

		let extraData: { youtubeVOD?: string; twitchVOD?: string; finalTime?: string } = {};

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
				submission.race !== 'no' && submission.race !== ''
					? submission.coop.toLocaleLowerCase() === 'true'
						? 'COOP'
						: 'RACE'
					: '',
			internalRacer: submission.racer,
			internalRunner: submission.runner,
			scheduled: scheduledTime,
			uuid: uuid(),
			...extraData,
		};
	});
}

// Given the estimate and start time, get when the run ends as a date
function endRunTime(scheduled: Date, estimate: string) {
	const estimateParts = estimate.split(/:/);
	const estimateMillis = parseInt(estimateParts[0], 10) * 60 * 60 * 1000 + parseInt(estimateParts[1], 10) * 60 * 1000;

	const scheduledTime = new Date(scheduled);
	// scheduledTime.setTime(scheduledTime.getTime());
	scheduledTime.setTime(scheduledTime.getTime() + estimateMillis);
	return scheduledTime;
}

// Query all users
async function getRunners(runnersID: string[]) {
	const client = new ApolloClient({ uri: '/api/graphql', cache: new InMemoryCache() });
	try {
		return (await client.query<RunnersNames>({ query: RUNNERS_NAMES_QUERY, variables: runnersID })).data.users;
	} catch (error) {
		console.error(error);
		return [];
	}
}

interface ReturnedIncentives {
	title: string;
	notes: string;
	type: string;
	data: object;
	submissionId: string;
}

// Create the mutation command to send to the server to create all the runs, incentives and update miscellanious stuff
async function createSchedule(
	runs: Awaited<ReturnType<typeof csvToRuns>>,
	eventShortname: string,
	finalIncentives: ReturnedIncentives[],
	raceRunners: { gameId: string; runners: string[] }[]
) {
	const client = new ApolloClient({ uri: '/api/graphql', cache: new InMemoryCache() });
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
			let manualRunners = raceRunners.find((raceRunners) => raceRunners.gameId === run.uuid);
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
					racer: run.runner.map((runner) => runner.username).join(', '),
				};
			}

			return {
				...runners,
				...connectedSubmission,
				game: run.game,
				category: run.category || '?',
				platform: run.platform || '?',
				estimate: run.estimate,
				scheduledTime: run.scheduled,
				race: run.race === 'RACE' || run.race === 'COOP',
				coop: run.race === 'COOP',
				event: { connect: { shortname: eventShortname } },
				...(run.finalTime && {finalTime: run.finalTime}),
				...(run.youtubeVOD && {youtubeVOD: run.youtubeVOD}),
				...(run.twitchVOD && {twitchVOD: run.twitchVOD}),
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
			const originalRun = allRuns.data.createRuns.find(
				(run) => run.originalSubmission?.id === incentive.submissionId
			)?.id;

			let connectedRun: { run: { connect: { id: string } } };
			if (originalRun) {
				connectedRun = {
					run: {
						connect: {
							id: originalRun,
						},
					},
				};
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

		console.log(allRuns);

		/**************************/
		/* UPDATE END EVENT TIME */
		/************************/
		const updatedEventTime = await client.mutate<UpdateEventEnd>({
			mutation: UPDATE_EVENT_END,
			variables: {
				endDate: endRunTime(finalRuns[finalRuns.length - 1].scheduledTime, finalRuns[finalRuns.length - 1].estimate),
				shortname: eventShortname,
			},
		});

		console.log(
			endRunTime(finalRuns[finalRuns.length - 1].scheduledTime, finalRuns[finalRuns.length - 1].estimate),
			updatedEventTime,
			{
				eventEnd: endRunTime(finalRuns[finalRuns.length - 1].scheduledTime, finalRuns[finalRuns.length - 1].estimate),
				shortname: eventShortname,
			}
		);

		// Final checks to see if anything failedw
		if (allRuns?.errors?.length > 0) {
			throw allRuns.errors;
		} else if (allIncentives?.errors?.length > 0) {
			throw allIncentives.errors;
		} else {
			// Updating end event is not critical
			if (updatedEventTime?.errors) {
				console.error(updatedEventTime?.errors);
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

async function setSubmissionResults(eventShortname: string) {
	const client = new ApolloClient({ uri: '/api/graphql', cache: new InMemoryCache() });

	// Get all runs & submissions
	const eventData = await client.query<QueryEventRunsSubmissions>({
		query: QUERY_EVENT_RUNS_SUBMISSIONS,
		variables: { eventShortname },
	});

	const submissionData = eventData.data.event.submissions.map((submission) => {
		// Set the rest as rejected
		let result = 'rejected';

		if (eventData.data.event.runs.find((run) => run.originalSubmission.id === submission.id)) {
			// Set the scheduled runs as accepted
			result = 'accepted';
		} else if (submission.willingBackup) {
			// Set the remaining willing backup runs as backup
			result = 'backup';
		}

		return { where: { id: submission.id }, data: { status: result } };
	});

	const result = await client.mutate<UpdateSubmissions>({
		mutation: UPDATE_SUBMISSIONS,
		variables: { submissions: submissionData },
	});

	if (result?.errors?.length > 0) {
		console.error(result.errors);
		return { success: false, submissions: 0 };
	} else {
		return { success: true, submissions: result.data.updateSubmissions.length };
	}
}

declare global {
	interface Navigator {
		msSaveBlob?: (blob: any, defaultName?: string) => boolean;
	}
}

export default function ScheduleImport() {
	// States
	const [selectedEvent, setSelectedEvent] = useState({ label: 'ASAP2022', value: 'ASAP2022' });
	const [scheduleProcessing, setScheduleProcessing] = useState(false);
	const [scheduleRuns, setScheduleRuns] = useState<Awaited<ReturnType<typeof csvToRuns>>>([]);
	const [eventAlreadyHasRuns, setEventAlreadyHasRuns] = useState(true);

	// Refs
	const uploadFileRef = useRef<HTMLInputElement>(undefined);
	const raceRunnersRef = useRef(undefined);
	const donationIncentivesRef = useRef(undefined);

	// Event settings
	const [eventSettingsIntervalTime, setEventSettingsIntervalTime] = useState(10);

	// Queries
	const { data: eventsList } = useQuery<EventsListQuery>(EVENTS_LIST_QUERY);
	const { data: eventData, refetch: refectEventData } = useQuery<EventQuery>(EVENT_QUERY, {
		variables: { event: selectedEvent.value },
	});
	const [getEventSubmissions] = useLazyQuery<EventSubmissions>(EVENT_SUBMISSIONS_QUERY);

	// Misc
	const { addToast } = useToasts();

	const eventsOptions = eventsList?.events
		.map((event) => ({ value: event.shortname, label: event.shortname }))
		.reverse();

	useEffect(() => {
		if (eventData?.event?.runsCount > 0) {
			setEventAlreadyHasRuns(true);
			setScheduleRuns(
				eventData.event?.runs.map((run) => {
					return {
						game: run.game,
						category: run.category,
						estimate: run.estimate,
						race: run.race ? (run.coop ? 'COOP' : 'RACE') : undefined,
						runner: run.runners.length > 0 ? run.runners : [{ id: undefined, username: run.racer }],
						platform: run.platform,
						internalDonationIncentive: run.donationIncentiveObject.map((incentive) => incentive.title).join(' | '),
						internalRacer:
							run.runners?.length > 1
								? run.runners
										.slice(1)
										.map((runner) => runner.username)
										.join(', ')
								: '',
						internalRunner: run.runners?.[0]?.username,
						runnerId: run.runners?.[0]?.id,
						scheduled: new Date(run.scheduledTime),
						submissionId: run.originalSubmission?.id,
						uuid: run.id,
					};
				})
			);
		} else {
			setEventAlreadyHasRuns(false);
			setScheduleRuns([]);
		}
	}, [eventData]);

	async function downloadSubmissions() {
		const eventSubmissions = await getEventSubmissions({ variables: { event: selectedEvent.value } });
		const csvBlob = parseSubmissionsToCSV(eventSubmissions.data);
		let csvURL = undefined;

		csvURL = navigator.msSaveBlob
			? navigator.msSaveBlob(csvBlob, `${eventSubmissions.data.event.shortname}-submissions.csv`)
			: window.URL.createObjectURL(csvBlob);

		var tempLink = document.createElement('a');
		tempLink.href = csvURL;
		tempLink.setAttribute('download', `${eventSubmissions.data.event.shortname}-submissions.csv`);
		tempLink.click();
	}

	async function uploadSchedule() {
		if (!uploadFileRef.current) return;

		setScheduleProcessing(true);
		const data = await parseScheduleToRuns(uploadFileRef.current.files[0], {
			startTime: new Date(eventData.event.startDate),
			turnaroundTime: eventSettingsIntervalTime,
		});

		setScheduleRuns(data);
		setScheduleProcessing(false);
	}

	async function applySchedule() {
		// Get race runners & donation incentives
		const raceRunners = raceRunnersRef.current.getRaceRunners();
		const donationIncentives = donationIncentivesRef.current.getDonationIncentives();

		createSchedule(scheduleRuns, selectedEvent.value, donationIncentives, raceRunners).then((result) => {
			if (result.success) {
				addToast({
					title: 'Created Runs and Incentives',
					tone: 'positive',
					message: `Created ${result.runs} runs and ${result.incentives} incentives`,
				});
			} else {
				addToast({
					title: 'Failed to create runs or incentives',
					tone: 'negative',
					message: `Check the console for the error`,
				});
			}
		});

		refectEventData({ variables: { event: selectedEvent.value } });
	}

	function updateSubmissions() {
		setSubmissionResults(selectedEvent.value).then((result) => {
			if (result.success) {
				addToast({
					title: 'Updated Submissions',
					tone: 'positive',
					message: `Updated ${result.submissions} submissions`,
				});
			} else {
				addToast({
					title: 'Failed to update Submissions',
					tone: 'negative',
					message: `Check the console for the error`,
				});
			}
		});
	}

	async function downloadHoraro() {
		const horaroData = await exportHoraro(selectedEvent.value);

		if (!horaroData.success) {
			console.error('[Horaro Error]', horaroData.errorMsg);
			return;
		}

		// https://stackoverflow.com/a/30800715
		var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(horaroData.data));
		var downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute('href', dataStr);
		downloadAnchorNode.setAttribute('download', `${selectedEvent.label}-Horaro.json`);
		document.body.appendChild(downloadAnchorNode); // Required for firefox
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	const eventStartDate = new Date(eventData?.event?.startDate);
	const eventEndDate = endRunTime(
		scheduleRuns[scheduleRuns.length - 1]?.scheduled ?? new Date(),
		scheduleRuns[scheduleRuns.length - 1]?.estimate ?? '00:00:00'
	);

	let prevDay = '';
	const tableRows = scheduleRuns.map((row, index) => {
		// console.log(row);
		if (!eventData?.event) return <></>;
		let dayDivider = <></>;
		if (formatInTimeZone(row.scheduled, eventData.event.eventTimezone, 'd') !== prevDay) {
			prevDay = formatInTimeZone(row.scheduled, eventData.event.eventTimezone, 'd');
			dayDivider = (
				<TableRow key={`${row.uuid ?? index}-day-divider`}>
					<TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
						{formatInTimeZone(row.scheduled, eventData.event.eventTimezone, 'do EEEE')}
					</TableCell>
					<TableCell></TableCell>
					<TableCell></TableCell>
					<TableCell></TableCell>
					<TableCell></TableCell>
					<TableCell></TableCell>
					<TableCell></TableCell>
					<TableCell></TableCell>
				</TableRow>
			);
		}

		return (
			<>
				{dayDivider}
				<TableRow key={row.uuid ?? index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
					<TableCell>
						{row.scheduled.toLocaleTimeString('en-AU', {
							timeZone: eventData.event.eventTimezone,
							hour: 'numeric',
							minute: '2-digit',
							hour12: true,
						})}
					</TableCell>
					<TableCell>
						<MUIStack
							direction="row"
							divider={
								<span style={{ marginRight: 4, marginLeft: row.race === 'RACE' ? 4 : 0 }}>
									{row.race === 'RACE' ? ' vs.' : ','}{' '}
								</span>
							}
						>
							{row.runner.map((runner) =>
								runner?.id ? (
									<a href={`http://localhost:8000/users/${runner.id}`} target="_blank" rel="noopener noreferrer">
										{runner.username}
									</a>
								) : (
									<span style={{ color: 'red', fontWeight: 'bold' }}>{runner?.username ?? '~~UNKNOWN~~'}</span>
								)
							)}
						</MUIStack>
					</TableCell>
					<TableCell>{row.game}</TableCell>
					<TableCell>{row.category}</TableCell>
					<TableCell>{row.estimate}</TableCell>
					<TableCell>{row.platform}</TableCell>
					<TableCell>{row.race}</TableCell>
					<TableCell>{row.internalDonationIncentive}</TableCell>
				</TableRow>
			</>
		);
	});

	return (
		<PageContainer header={<Heading type="h3">Schedule Import</Heading>}>
			<div css={{ marginTop: 24 }} />
			<FieldContainer style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
				<FieldLabel style={{ minWidth: '', marginRight: 8 }}>Event</FieldLabel>
				<Select
					css={css`
						min-width: 200px;
					`}
					onChange={(e) => setSelectedEvent(e)}
					value={selectedEvent}
					options={eventsOptions}
				/>
			</FieldContainer>
			<EventTitle>{selectedEvent.label}</EventTitle>

			<MUIStack direction="row" justifyContent="space-between">
				<div style={{ display: 'flex', margin: '16px 0', width: '75%', gap: 16 }}>
					<FieldContainer style={{ maxWidth: '20ch' }}>
						<FieldLabel>Run setup time</FieldLabel>
						<OutlinedInput
							value={eventSettingsIntervalTime}
							onChange={(e) => setEventSettingsIntervalTime(parseInt(e.target.value))}
							endAdornment={<InputAdornment position="end">mins</InputAdornment>}
							inputProps={{
								type: 'number',
							}}
						/>
					</FieldContainer>
					{eventData?.event && (
						<>
							<FieldContainer>
								<FieldLabel>Event Start Time</FieldLabel>
								<div style={{ display: 'flex', flexDirection: 'column' }}>
									<span>
										{eventStartDate.toLocaleDateString('en-AU', {
											timeZone: eventData.event.eventTimezone,
										})}
									</span>
									<span>{formatInTimeZone(eventStartDate, eventData.event.eventTimezone, 'h:mm a')}</span>
									<span>{formatInTimeZone(eventStartDate, eventData.event.eventTimezone, 'EEEE, MMMM')}</span>
								</div>
							</FieldContainer>
							{scheduleRuns.length > 0 && (
								<>
									<FieldContainer>
										<FieldLabel>Event End Time</FieldLabel>
										<div style={{ display: 'flex', flexDirection: 'column' }}>
											<span>
												{eventEndDate.toLocaleDateString('en-AU', {
													timeZone: eventData.event.eventTimezone,
												})}
											</span>
											<span>{formatInTimeZone(eventEndDate, eventData.event.eventTimezone, 'h:mm a')}</span>
											<span>{formatInTimeZone(eventEndDate, eventData.event.eventTimezone, 'EEEE, MMMM')}</span>
										</div>
									</FieldContainer>
									<FieldContainer>
										<FieldLabel>Duration</FieldLabel>
										<div style={{ display: 'flex', flexDirection: 'column' }}>
											<span>{formatDistanceStrict(eventEndDate, eventStartDate)} or</span>
											<span>
												{(Math.abs(eventEndDate.getTime() - eventStartDate.getTime()) / 36e5).toFixed(1)} hours
											</span>
										</div>
									</FieldContainer>
									<FieldContainer>
										<FieldLabel># of Runs</FieldLabel>
										<div style={{ display: 'flex', flexDirection: 'column' }}>
											<span>{scheduleRuns.filter((run) => run.game.toLowerCase() !== 'setup buffer').length} runs</span>
										</div>
									</FieldContainer>
								</>
							)}
						</>
					)}
				</div>
				<div style={{ display: 'flex', margin: '16px 0', width: '40%', justifyContent: 'flex-end' }}>
					<Button
						isDisabled={!selectedEvent.label}
						tone="active"
						weight="bold"
						onClick={downloadSubmissions}
						style={{ height: '100%' }}
					>
						Download all submissions
					</Button>
					{/* <input
						disabled={!selectedEvent.label}
						ref={uploadFileRef}
						onChange={uploadSchedule}
						type="file"
						accept=".csv"
					/> */}
					<CustomInput>
						<HiddenInput
							disabled={!selectedEvent.label}
							ref={uploadFileRef}
							onChange={uploadSchedule}
							type="file"
							accept=".csv"
							id="file-upload"
						/>
						<span>Upload Schedule</span>
					</CustomInput>
				</div>
			</MUIStack>

			<TableContainer component={Paper} sx={{ maxHeight: 440 }}>
				<Table sx={{ minWidth: 650 }} size="small" stickyHeader>
					<TableHead>
						<TableRow>
							<TableCell>Scheduled</TableCell>
							<TableCell>Runner</TableCell>
							<TableCell>Game</TableCell>
							<TableCell>Category</TableCell>
							<TableCell>Estimate</TableCell>
							<TableCell>Platform</TableCell>
							<TableCell>Race</TableCell>
							<TableCell>Donation Incentive</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>{tableRows}</TableBody>
				</Table>
			</TableContainer>
			<MUIStack direction="row" spacing={2} sx={{ mt: 2, mb: 2 }}>
				<DonationIncentiveCreator
					ref={donationIncentivesRef}
					donationIncentiveStrings={scheduleRuns
						.filter((run) => run.internalDonationIncentive)
						.map((run) => {
							return {
								incentive: run.internalDonationIncentive,
								game: run.game,
								id: run.uuid,
								category: run.category,
								runner: run.runner[0].id ? run.runner[0].username : run.internalRunner,
							};
						})}
				/>
				<RaceRunnerMatcher
					ref={raceRunnersRef}
					races={scheduleRuns
						.filter((run) => run.race)
						.map((run) => {
							return {
								game: run.game,
								id: run.uuid,
								category: run.category,
								runner: run.runner[0]?.id ? run.runner[0].username : run.internalRunner,
								internalRacers: run.internalRacer,
								runnerId: run.runnerId,
								foundNormalRunner: Boolean(run.runner[0]?.id),
							};
						})}
				/>
			</MUIStack>
			{scheduleProcessing && <CircularProgress />}
			<MUIStack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 10 }}>
				<MUIStack direction="row" justifyContent="flex-end" spacing={2}>
					<Button tone="positive" weight="bold" onClick={downloadHoraro} isDisabled={!eventAlreadyHasRuns}>
						Export for Horaro
					</Button>
				</MUIStack>
				<MUIStack direction="row" justifyContent="flex-end" spacing={2}>
					<Button tone="positive" weight="bold" onClick={applySchedule} isDisabled={eventAlreadyHasRuns}>
						Apply Schedule
					</Button>
					<Button tone="positive" weight="bold" onClick={updateSubmissions}>
						Update Submission Results
					</Button>
				</MUIStack>
			</MUIStack>
		</PageContainer>
	);
}
