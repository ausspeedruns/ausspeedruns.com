import { Heading } from "@keystone-ui/core";
import { useEffect, useRef, useState } from "react";
import { PageContainer } from "@keystone-6/core/admin-ui/components";
import { useQuery, gql, useLazyQuery, ApolloClient, InMemoryCache } from "@keystone-6/core/admin-ui/apollo";
import { Button } from "@keystone-ui/button";
import { useToasts } from "@keystone-ui/toast";
import { Select, FieldContainer, FieldLabel } from "@keystone-ui/fields";
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
} from "@mui/material";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { formatInTimeZone } from "date-fns-tz";
import { Lists } from ".keystone/types";
import { DonationIncentiveCreator, DonationIncentiveCreatorRef } from "../components/DonationIncentiveCreator";
import { RaceRunnerMatcher, RaceRunnerMatcherRef } from "../components/RaceRunnerMatcher";
import { formatDistanceStrict } from "date-fns";
import { exportHoraro } from "../util/schedule/export-horaro";
import { downloadSubmissions } from "../util/schedule/export-submissions";
import { parseScheduleToRuns } from "../util/schedule/import-schedule";
import { createSchedule } from "../util/schedule/create-schedule";
import { updateSubmissionResults } from "../util/schedule/update-submissions";
import type { Run } from "../util/schedule/schedule-types";
import { useLocalStorage } from "../hooks/useLocalStorage";

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
			submissionsCount
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
			race: Lists.Run.Item["race"];
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
	};
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

export default function ScheduleImport() {
	// States
	const [selectedEvent, setSelectedEvent] = useState<{
		label: string;
		value: string;
	} | null>(null);
	const [scheduleProcessing, setScheduleProcessing] = useState(false);
	const [scheduleRuns, setScheduleRuns] = useState<Run[]>([]);
	const [eventAlreadyHasRuns, setEventAlreadyHasRuns] = useState(true);

	// Refs
	const uploadFileRef = useRef<HTMLInputElement>(null);
	const raceRunnersRef = useRef<RaceRunnerMatcherRef>(null);
	const donationIncentivesRef = useRef<DonationIncentiveCreatorRef>(null);

	// Event settings
	const [eventSettingsSetupTime, setEventSettingsSetupTime] = useLocalStorage("eventSetupTime", 10);

	// Queries
	const { data: eventsList } = useQuery<EventsListQuery>(EVENTS_LIST_QUERY);
	const [refetchEventData, { data: eventData }] = useLazyQuery<EventQuery>(EVENT_QUERY);

	// Misc
	const { addToast } = useToasts();

	const eventsOptions = eventsList?.events
		.map((event) => ({ value: event.shortname, label: event.shortname }))
		.reverse();

	useEffect(() => {
		if (selectedEvent?.value) refetchEventData({ variables: { event: selectedEvent.value } });
	}, [selectedEvent]);

	useEffect(() => {
		if (eventData?.event && eventData?.event?.runsCount > 0) {
			setEventAlreadyHasRuns(true);
			setScheduleRuns(
				eventData.event?.runs.map((run) => {
					return {
						game: run.game,
						category: run.category,
						estimate: run.estimate,
						race: run.race ? (run.coop ? "COOP" : "RACE") : "",
						runner: run.runners.length > 0 ? run.runners : [{ id: undefined, username: run.racer }],
						platform: run.platform,
						internalDonationIncentive: run.donationIncentiveObject
							.map((incentive) => incentive.title)
							.join(" | "),
						internalRacer:
							run.runners?.length > 1
								? run.runners
										.slice(1)
										.map((runner) => runner.username)
										.join(", ")
								: "",
						internalRunner: run.runners?.[0]?.username,
						runnerId: run.runners?.[0]?.id,
						scheduled: new Date(run.scheduledTime ?? 0),
						submissionId: run.originalSubmission?.id,
						uuid: run.id,
					};
				}),
			);
		} else {
			setEventAlreadyHasRuns(false);
			setScheduleRuns([]);
		}
	}, [eventData]);

	async function uploadSchedule() {
		if (!uploadFileRef.current) return;
		if (!uploadFileRef.current.files?.[0]) return;
		if (!eventData) return;

		setScheduleProcessing(true);

		const data = await parseScheduleToRuns(uploadFileRef.current.files[0], {
			startTime: new Date(eventData.event.startDate),
			turnaroundTime: eventSettingsSetupTime,
		});

		setScheduleRuns(data);
		setScheduleProcessing(false);
	}

	async function applySchedule() {
		if (!raceRunnersRef.current || !donationIncentivesRef.current || !selectedEvent) return;

		// Get race runners & donation incentives
		const raceRunners = raceRunnersRef.current.getRaceRunners();
		const donationIncentives = donationIncentivesRef.current.getDonationIncentives();

		const result = await createSchedule(scheduleRuns, selectedEvent.value, donationIncentives, raceRunners);

		if (result.success) {
			addToast({
				title: "Created Runs and Incentives",
				tone: "positive",
				message: `Created ${result.runs} runs and ${result.incentives} incentives`,
			});
		} else {
			addToast({
				title: "Failed to create runs or incentives",
				tone: "negative",
				message: `Check the console for the error`,
			});
		}

		refetchEventData({ variables: { event: selectedEvent.value } });
	}

	function updateSubmissions() {
		if (!selectedEvent) return;

		updateSubmissionResults(selectedEvent.value).then((result) => {
			if (result.success) {
				addToast({
					title: "Updated Submissions",
					tone: "positive",
					message: `Updated ${result.submissions} submissions`,
				});
			} else {
				addToast({
					title: "Failed to update Submissions",
					tone: "negative",
					message: `Check the console for the error`,
				});
			}
		});
	}

	async function downloadHoraro() {
		if (!selectedEvent) return;

		const horaroData = await exportHoraro(selectedEvent.value);

		if (!horaroData.success) {
			console.error("[Horaro Error]", horaroData.errorMsg);
			return;
		}

		// https://stackoverflow.com/a/30800715
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(horaroData.data));
		var downloadAnchorNode = document.createElement("a");
		downloadAnchorNode.setAttribute("href", dataStr);
		downloadAnchorNode.setAttribute("download", `${selectedEvent.label}-Horaro.json`);
		document.body.appendChild(downloadAnchorNode); // Required for firefox
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	const eventStartDate = eventData?.event?.startDate ? new Date(eventData?.event?.startDate) : undefined;
	const eventEndDate = endRunTime(
		scheduleRuns[scheduleRuns.length - 1]?.scheduled ?? new Date(),
		scheduleRuns[scheduleRuns.length - 1]?.estimate ?? "00:00:00",
	);

	let prevDay = "";
	const tableRows = scheduleRuns.map((row, index) => {
		// console.log(row);
		if (!eventData?.event) return <></>;
		let dayDivider = <></>;
		if (formatInTimeZone(row.scheduled, eventData.event.eventTimezone, "d") !== prevDay) {
			prevDay = formatInTimeZone(row.scheduled, eventData.event.eventTimezone, "d");
			dayDivider = (
				<TableRow key={`${row.uuid ?? index}-day-divider`}>
					<TableCell sx={{ fontWeight: "bold", fontSize: "0.9rem" }}>
						{formatInTimeZone(row.scheduled, eventData.event.eventTimezone, "do EEEE")}
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
				<TableRow key={row.uuid ?? index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
					<TableCell>
						{row.scheduled.toLocaleTimeString("en-AU", {
							timeZone: eventData.event.eventTimezone,
							hour: "numeric",
							minute: "2-digit",
							hour12: true,
						})}
					</TableCell>
					<TableCell>
						<MUIStack
							direction="row"
							divider={
								<span
									style={{
										marginRight: 4,
										marginLeft: row.race === "RACE" ? 4 : 0,
									}}>
									{row.race === "RACE" ? " vs." : ","}{" "}
								</span>
							}>
							{row.runner.map((runner) =>
								runner?.id ? (
									<a
										href={`http://localhost:8000/users/${runner.id}`}
										target="_blank"
										rel="noopener noreferrer">
										{runner.username}
									</a>
								) : (
									<span
										style={{
											color: "red",
											fontWeight: "bold",
										}}>
										{runner?.username ?? "~~UNKNOWN~~"}
									</span>
								),
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
			<div style={{ marginTop: 24 }} />
			<FieldContainer
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
				}}>
				<FieldLabel style={{ minWidth: "", marginRight: 8 }}>Event</FieldLabel>
				<Select onChange={(e) => setSelectedEvent(e)} value={selectedEvent} options={eventsOptions} />
			</FieldContainer>
			<Button
				isDisabled={
					!selectedEvent?.label ||
					!eventData?.event ||
					(eventData?.event && eventData.event.submissionsCount <= 0)
				}
				tone="active"
				weight="bold"
				onClick={() => (selectedEvent?.value ? downloadSubmissions(selectedEvent.value) : undefined)}
				style={{ margin: "auto", display: "block", marginTop: 24 }}>
				Download all {eventData?.event.submissionsCount} submissions
			</Button>
			<EventTitle>{selectedEvent?.label}</EventTitle>

			<MUIStack direction="row" justifyContent="space-between">
				<div
					style={{
						display: "flex",
						margin: "16px 0",
						width: "75%",
						gap: 16,
					}}>
					<FieldContainer style={{ maxWidth: "20ch" }}>
						<FieldLabel>Run setup time</FieldLabel>
						<OutlinedInput
							value={eventSettingsSetupTime}
							onChange={(e) => setEventSettingsSetupTime(parseInt(e.target.value))}
							endAdornment={<InputAdornment position="end">mins</InputAdornment>}
							inputProps={{
								type: "number",
							}}
						/>
					</FieldContainer>
					{eventData?.event && (
						<>
							<FieldContainer>
								<FieldLabel>Event Start Time</FieldLabel>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
									}}>
									{eventStartDate ? (
										<>
											<span>
												{eventStartDate.toLocaleDateString("en-AU", {
													timeZone: eventData.event.eventTimezone,
												})}
											</span>
											<span>
												{formatInTimeZone(
													eventStartDate,
													eventData.event.eventTimezone,
													"h:mm a",
												)}
											</span>
											<span>
												{formatInTimeZone(
													eventStartDate,
													eventData.event.eventTimezone,
													"EEEE, MMMM",
												)}
											</span>
										</>
									) : (
										<span>Missing Event Start Date</span>
									)}
								</div>
							</FieldContainer>
							{scheduleRuns.length > 0 && (
								<>
									<FieldContainer>
										<FieldLabel>Event End Time</FieldLabel>
										<div
											style={{
												display: "flex",
												flexDirection: "column",
											}}>
											<span>
												{eventEndDate.toLocaleDateString("en-AU", {
													timeZone: eventData.event.eventTimezone,
												})}
											</span>
											<span>
												{formatInTimeZone(
													eventEndDate,
													eventData.event.eventTimezone,
													"h:mm a",
												)}
											</span>
											<span>
												{formatInTimeZone(
													eventEndDate,
													eventData.event.eventTimezone,
													"EEEE, MMMM",
												)}
											</span>
										</div>
									</FieldContainer>
									{eventStartDate && (
										<FieldContainer>
											<FieldLabel>Duration</FieldLabel>
											<div
												style={{
													display: "flex",
													flexDirection: "column",
												}}>
												<span>{formatDistanceStrict(eventEndDate, eventStartDate)} or</span>
												<span>
													{(
														Math.abs(eventEndDate.getTime() - eventStartDate.getTime()) /
														36e5
													).toFixed(1)}{" "}
													hours
												</span>
											</div>
										</FieldContainer>
									)}
									<FieldContainer>
										<FieldLabel># of Runs</FieldLabel>
										<div
											style={{
												display: "flex",
												flexDirection: "column",
											}}>
											<span>
												{
													scheduleRuns.filter(
														(run) => run.game.toLowerCase() !== "setup buffer",
													).length
												}{" "}
												runs
											</span>
										</div>
									</FieldContainer>
								</>
							)}
						</>
					)}
				</div>
				<div
					style={{
						display: "flex",
						margin: "16px 0",
						width: "40%",
						justifyContent: "flex-end",
					}}>
					<CustomInput>
						<HiddenInput
							disabled={!selectedEvent?.label}
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
					<Button tone="help" weight="bold" onClick={downloadHoraro} isDisabled={!eventAlreadyHasRuns}>
						Export for Horaro
					</Button>
				</MUIStack>
				<MUIStack direction="row" justifyContent="flex-end" spacing={2}>
					<Button tone="active" weight="bold" onClick={updateSubmissions}>
						Update Submission Results
					</Button>
					<Button tone="positive" weight="bold" onClick={applySchedule} isDisabled={eventAlreadyHasRuns}>
						Apply Schedule
					</Button>
				</MUIStack>
			</MUIStack>
		</PageContainer>
	);
}
