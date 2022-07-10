/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Inline, Stack, Heading } from '@keystone-ui/core';
import React, { useEffect } from 'react';
import { PageContainer } from '@keystone-6/core/admin-ui/components';
import { Link } from '@keystone-6/core/admin-ui/router';
import { useMutation, useQuery, gql, useLazyQuery } from '@keystone-6/core/admin-ui/apollo';
import { Button } from '@keystone-ui/button';
import { Select, FieldContainer, FieldLabel, TextInput, DatePicker } from '@keystone-ui/fields';
import { ListItem, ListItemButton, ListItemText } from '@mui/material';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { format, parse, parseISO } from 'date-fns';
import { useToasts } from '@keystone-ui/toast';

const EVENTS_LIST_QUERY = gql`
	query {
		events {
			shortname
		}
	}
`;

const EVENT_QUERY = gql`
	query ($event: String) {
		event(where: { shortname: $event }) {
			submissionsCount(where: { status: { equals: accepted } })
			runsCount
			runs {
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
				coop
				twitchVOD
				youtubeVOD
				scheduledTime
				originalSubmission {
					id
				}
			}
		}
	}
`;

const SUBMISSIONS_QUERY = gql`
	query ($event: String) {
		event(where: { shortname: $event }) {
			submissions(where: { status: { equals: accepted } }) {
				id
				runner {
					id
				}
				game
				category
				platform
				estimate
				donationIncentive
				race
				coop
			}
		}
	}
`;

interface SubmissionData {
	event: {
		submissions: {
			id: string;
			runner: {
				id: string;
			};
			game: string;
			category: string;
			platform: string;
			estimate: string;
			donationIncentive: string;
			race: string;
			coop: boolean;
		}[];
	};
}

export default function RunsManager() {
	const [selectedEvent, setSelectedEvent] = React.useState({ label: '', value: '' });
	const [selectedRunIndex, setSelectedRunIndex] = React.useState(0);
	const [runDate, setRunDate] = React.useState('');
	const [runTime, setRunTime] = React.useState('');
	const [runYT, setRunYT] = React.useState('');
	const [runTwitch, setRunTwitch] = React.useState('');
	const [finalTime, setFinalTime] = React.useState('');
	const { addToast } = useToasts();

	const eventsList = useQuery(EVENTS_LIST_QUERY);
	const eventData = useQuery(EVENT_QUERY, { variables: { event: selectedEvent.value } });
	// const [getSubmissionData, submissionData] = useLazyQuery<SubmissionData>(SUBMISSIONS_QUERY, {
	// 	fetchPolicy: 'network-only',
	// });
	const submissionData = useQuery<SubmissionData>(SUBMISSIONS_QUERY, { variables: { event: selectedEvent.value } });

	const [submissionsToRunsMutation, submissionsToRunsData] = useMutation(gql`
		mutation ($runs: [RunCreateInput!]!) {
			createRuns(data: $runs) {
				__typename
			}
		}
	`);

	const [updateRunMutation, updateRunMutationData] = useMutation(gql`
		mutation ($runID: ID, $scheduledTime: DateTime, $finalTime: String, $twitchVOD: String, $youtubeVOD: String) {
			updateRun(
				where: { id: $runID }
				data: { finalTime: $finalTime, twitchVOD: $twitchVOD, youtubeVOD: $youtubeVOD, scheduledTime: $scheduledTime }
			) {
				id
				game
			}
		}
	`);

	const eventsOptions = eventsList.data?.events.map((event) => ({ value: event.shortname, label: event.shortname }));

	// console.log(eventData)

	const runData = eventData.data?.event?.runs[selectedRunIndex];

	useEffect(() => {
		if (!eventData.data || !runData) return;

		setRunDate(runData.scheduledTime);
		setRunTime(runData.scheduledTime ? format(new Date(runData.scheduledTime), 'HH:ss') : '');
		setFinalTime(runData.finalTime);
		setRunTwitch(runData.twitchVOD);
		setRunYT(runData.youtubeVOD);
	}, [selectedRunIndex]);

	useEffect(() => {
		// console.log(updateRunMutationData);
		if (updateRunMutationData.error) {
			console.error(updateRunMutationData.error);
			addToast({ title: 'Error updating run', tone: 'negative', message: updateRunMutationData.error.message });
		} else if (updateRunMutationData.data?.updateRun) {
			addToast({
				title: `Updated ${updateRunMutationData.data.updateRun.game}`,
				id: updateRunMutationData.data.updateRun.id,
				tone: 'positive',
				preserve: false,
			});
		}
	}, [updateRunMutationData.data, updateRunMutationData.error]);

	function UpdateRun() {
		if (!runData.id) return;

		let parsedTime;
		try {
			parsedTime = parse(format(parseISO(runDate), 'yyyy-MM-dd') + ' ' + runTime, 'yyyy-MM-dd HH:mm', new Date());
		} catch (error) {
			console.log(error);
		}

		updateRunMutation({
			variables: {
				runID: runData.id,
				finalTime,
				twitchVOD: runTwitch,
				youtubeVOD: runYT,
				scheduledTime: parsedTime,
			},
		});

		eventData.refetch();
	}

	async function convertSubmissionsToRuns() {
		if (!submissionData.data || submissionData.data.event.submissions.length === 0) return;

		const runCreateInput = submissionData.data.event.submissions.map((submission) => {
			return {
				game: submission.game,
				category: submission.category,
				platform: submission.platform,
				estimate: submission.estimate,
				donationIncentive: submission.donationIncentive,
				race: submission.race !== 'no',
				coop: submission.coop,
				originalSubmission: { connect: { id: submission.id } },
				runners: { connect: { id: submission.runner.id } },
				event: { connect: { shortname: selectedEvent.value } },
			};
		});
		// console.log(runCreateInput);

		await submissionsToRunsMutation({ variables: { runs: runCreateInput } });
		eventData.refetch();
	}

	return (
		<PageContainer header={<Heading type="h3">Runs Manager</Heading>}>
			<div css={{ marginTop: 24 }} />
			<FieldContainer>
				<FieldLabel>Event</FieldLabel>
				<Select onChange={(e) => setSelectedEvent(e)} value={selectedEvent} options={eventsOptions} />
			</FieldContainer>
			{eventData?.data?.event && (
				<>
					<p>
						There are {eventData.data.event.submissionsCount} accepted submissions. There are{' '}
						{eventData.data.event.runsCount} runs.
					</p>
					{/* <Button
						tone={eventData.data.event.runsCount > 0 ? 'passive' : 'active'}
						weight="bold"
						isDisabled={eventData.data?.event.runsCount > 0}
						onClick={() => getSubmissionData({ variables: { event: selectedEvent.value } })}
					>
						Load submissions
					</Button> */}
					<Button
						tone={eventData.data.event.runsCount > 0 ? 'passive' : 'active'}
						weight="bold"
						isDisabled={
							!submissionData.data ||
							submissionData.data?.event.submissions.length === 0 ||
							eventData.data?.event?.runs.length > 0
						}
						onClick={() => convertSubmissionsToRuns()}
					>
						Convert accepted submissions to runs
					</Button>
					<div css={{ border: '1px solid #e1e5e9', borderRadius: 6, display: 'flex', marginTop: 16 }}>
						<VariableSizeList
							height={650}
							width={350}
							estimatedItemSize={50}
							itemSize={(index) => {
								return 50 + (eventData.data.event.runs[index].game.length > 20 ? 60 : 0);
							}}
							itemCount={eventData.data.event.runsCount}
							overscanCount={5}
							itemData={eventData.data.event.runs.map((run) => ({ ...run, setSelectedRunIndex }))}
							css={{ borderRight: '1px solid #e1e5e9', background: '#fafbfc' }}
						>
							{renderRunRow}
						</VariableSizeList>
						{runData && (
							<div css={{ flexGrow: 1, paddingLeft: 16 }}>
								<h1>{runData.game}</h1>
								<Button size="small" weight="link" tone="active" as={Link} href={`/runs/${runData.id}`}>
									View Run details
								</Button>
								{runData.originalSubmission && (
									<Button
										size="small"
										weight="link"
										tone="active"
										as={Link}
										href={`/submissions/${runData.originalSubmission.id}`}
									>
										View Original Submission details
									</Button>
								)}
								<p>
									Game <b>{runData.game}</b>
									<br />
									Category <b>{runData.category}</b>
									<br />
									Runner{runData.runners.length > 1 ? 's' : ''}{' '}
									<b>
										{runData.runners.map((runner) => (
											<a href={`/users/${runner.id}`} target="_blank">
												{runner.username}
											</a>
										))}
									</b>
									<br />
									Estimate <b>{runData.estimate}</b>
									<br />
									Platform <b>{runData.platform}</b>
									<br />
									{runData.donationIncentive && (
										<>
											Donation Incentive <b>{runData.donationIncentive}</b>
										</>
									)}
								</p>
								<Stack gap="medium">
									<FieldContainer>
										<FieldLabel>Scheduled Time</FieldLabel>
										{/* <DatePicker onChange={(e) => setRunTime(e.target.value)} value={runTime} /> */}
										<Inline gap="small">
											<Stack>
												<DatePicker
													onUpdate={(date) => {
														setRunDate(date);
													}}
													onClear={() => {}}
													value={runDate?.split('T')[0]}
												/>
											</Stack>
											<Stack>
												<TextInput placeholder="00:00" value={runTime} onChange={(e) => setRunTime(e.target.value)} />
											</Stack>
										</Inline>
									</FieldContainer>
									<FieldContainer>
										<FieldLabel>Final Time</FieldLabel>
										<TextInput
											placeholder="00:00:00"
											onChange={(e) => setFinalTime(e.target.value)}
											value={finalTime}
										/>
									</FieldContainer>
									<FieldContainer>
										<FieldLabel>Twitch VOD</FieldLabel>
										<TextInput onChange={(e) => setRunTwitch(e.target.value)} value={runTwitch} />
									</FieldContainer>
									<FieldContainer>
										<FieldLabel>YouTube VOD</FieldLabel>
										<TextInput onChange={(e) => setRunYT(e.target.value)} value={runYT} />
									</FieldContainer>
								</Stack>
								<br />
								<Button tone="active" weight="bold" onClick={UpdateRun} isDisabled={!runData.id}>
									Save
								</Button>
							</div>
						)}
					</div>
				</>
			)}
		</PageContainer>
	);
}

function renderRunRow(props: ListChildComponentProps) {
	const { index, style } = props;
	const data = props.data[index];

	// console.log(data);

	return (
		<ListItem style={style} key={data.id} component="div" disablePadding>
			<ListItemButton onClick={() => data.setSelectedRunIndex(index)}>
				<ListItemText
					primary={data.game}
					secondary={`${data.category} - ${data.runners.map((runner) => runner.username).join(', ')}`}
				/>
			</ListItemButton>
		</ListItem>
	);
}
