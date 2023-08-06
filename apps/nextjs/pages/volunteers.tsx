import React, { useEffect, useState } from "react";
import Head from "next/head";
import {
	Alert,
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Snackbar,
	TextField,
	ThemeProvider,
} from "@mui/material";
import { useQuery, gql, useMutation } from "urql";

import styles from "../styles/Volunteers.module.scss";
import { theme } from "../components/mui-theme";
import { useAuth } from "../components/auth";
import LinkButton from "../components/Button/Button";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import DiscordEmbed from "../components/DiscordEmbed";
import { addDays, differenceInDays } from "date-fns";

const TITLE = "Volunteer Submission - AusSpeedruns";

type JobTypeLiterals = "host" | "social" | "runMgmt" | "tech";
type ExperienceLiterals = "None" | "Casual" | "Enthusist" | "Expert";

function HumanErrorMsg(error: string) {
	// console.log(error.replace(/(\r\n|\n|\r)/gm, ""));
	switch (error.replace(/(\r\n|\n|\r)/gm, "")) {
		case "":
			return "Error";

		default:
			return error;
	}
}

export default function SubmitGamePage() {
	const auth = useAuth();

	const [event, setEvent] = useState("");
	const [jobType, setJobType] = useState<JobTypeLiterals>("host");
	const [confirmation, setConfirmation] = useState(false);
	const [successSubmit, setSuccessSubmit] = useState(false);

	// Host
	const [eventHostTime, setEventHostTime] = useState(0);
	const [maxDailyHostTime, setMaxDailyHostTime] = useState(0);
	const [dayTimes, setDayTimes] = useState<string[]>([]);
	const [specificGame, setSpecificGame] = useState("");
	const [specificRunner, setSpecificRunner] = useState("");
	const [additionalInfo, setAdditionalInfo] = useState("");

	// Social Media
	const [experience, setExperience] = useState<ExperienceLiterals>("None");
	const [socialMediaAvaialbility, setSocialMediaAvaialbility] = useState("");
	const [favMeme, setFavMeme] = useState("");

	// Runner Management
	const [runnerManagementAvailability, setrunnerManagementAvailability] =
		useState("");

	// Tech
	const [techAvailablity, setTechAvailablity] = useState("");
	const [techExperience, setTechExperience] = useState("");

	// Query if able to submit game (has discord)
	const [queryResult, profileQuery] = useQuery({
		query: gql`
			query Profile($userId: ID!) {
				user(where: { id: $userId }) {
					verified
					discord
				}
			}
		`,
		variables: {
			userId: auth.ready ? auth.sessionData?.id ?? "" : "",
		},
		pause: !auth.ready,
	});

	const [eventsResult, eventsQuery] = useQuery<{
		events: {
			id: string;
			shortname: string;
			startDate: string;
			endDate: string;
			eventTimezone: string;
		}[];
	}>({
		query: gql`
			query {
				events(where: { acceptingVolunteers: { equals: true } }) {
					id
					shortname
					startDate
					endDate
					eventTimezone
				}
			}
		`,
	});

	// Mutation for game submission
	const [submissionResult, createSubmission] = useMutation(gql`
		mutation (
			$userId: ID
			$jobType: VolunteerJobTypeType
			$eventHostTime: Int
			$maxDailyHostTime: Int
			$dayTimes: JSON
			$specificGame: String
			$specificRunner: String
			$additionalInfo: String
			$experience: String
			$favMeme: String
			$runnerManagementAvailability: String
			$techAvailablity: String
			$techExperience: String
			$eventId: ID
		) {
			createVolunteer(
				data: {
					volunteer: { connect: { id: $userId } }
					jobType: $jobType
					eventHostTime: $eventHostTime
					maxDailyHostTime: $maxDailyHostTime
					dayTimes: $dayTimes
					specificGame: $specificGame
					specificRunner: $specificRunner
					additionalInfo: $additionalInfo
					experience: $experience
					favMeme: $favMeme
					runnerManagementAvailability: $runnerManagementAvailability
					techAvailablity: $techAvailablity
					techExperience: $techExperience
					event: { connect: { id: $eventId } }
				}
			) {
				__typename
			}
		}
	`);

	useEffect(() => {
		if (eventsResult.data?.events && eventsResult.data?.events.length > 0) {
			setEvent(eventsResult.data.events[0].id);
		}
	}, [eventsResult]);

	//	useEffect(() => {
	//		setCanSubmit(game && category && platform && estimate && !estimateError && event && video && availableDates.some((day) => day));
	//	}, [game, category, platform, estimate, estimateError, event, video, availableDates]);

	function clearInputs() {
		setEventHostTime(0);
		setMaxDailyHostTime(0);
		setDayTimes([]);
		setSpecificGame("");
		setSpecificRunner("");
		setAdditionalInfo("");

		setExperience("None");
		setSocialMediaAvaialbility("");
		setFavMeme("");

		setrunnerManagementAvailability("");

		setTechAvailablity("");
		setTechExperience("");
	}

	if (!eventsResult.fetching && eventsResult.data?.events.length === 0) {
		return <NoEvent />;
	}

	if (auth.ready && !auth.sessionData) {
		return <NoAuth />;
	}

	let disableSend = !confirmation || !auth.ready;
	switch (jobType) {
		case "host":
			if (
				isNaN(eventHostTime) ||
				eventHostTime <= 0 ||
				isNaN(maxDailyHostTime) ||
				maxDailyHostTime <= 0 ||
				!dayTimes
			) {
				disableSend = true;
			}
			break;
		case "runMgmt":
			if (!runnerManagementAvailability) {
				disableSend = true;
			}
			break;
		case "social":
			if (!dayTimes) {
				disableSend = true;
			}
			break;
		case "tech":
			if (!techAvailablity) {
				disableSend = true;
			}
			break;

		default:
			// What
			disableSend = true;
			break;
	}

	const currentEvent = eventsResult.data?.events.find(
		(eventResult) => eventResult.id === event,
	);

	let eventLength = 0;
	if (currentEvent) {
		eventLength =
			differenceInDays(
				new Date(currentEvent.endDate),
				new Date(currentEvent.startDate),
			) + 1;
	}

	let hostDates = [];
	if (currentEvent) {
		for (let i = 0; i < eventLength; i++) {
			const date = addDays(new Date(currentEvent.startDate), i);
			hostDates.push(
				<TextField
					fullWidth
					key={i}
					label={date.toLocaleDateString("en-AU", {
						weekday: "long",
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
						timeZone: currentEvent.eventTimezone || undefined,
					})}
					onChange={(e) => {
						const newDates = dayTimes;
						newDates[i] = e.target.value;
						setDayTimes(newDates);
					}}
					value={dayTimes[i]}
				/>,
			);
		}
	}

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>{TITLE}</title>
				<DiscordEmbed
					title={TITLE}
					description="Volunteer for AusSpeedrun Marathons!"
					pageUrl="/volunteers"
				/>
			</Head>
			<main className={styles.content}>
				<h1>
					{
						eventsResult.data?.events.find(
							(eventResult) => eventResult.id === event,
						)?.shortname
					}{" "}
					Volunteer Submission
				</h1>
				<form
					className={styles.volunteerForm}
					onSubmit={(e) => {
						e.preventDefault();
						if (auth.ready && !disableSend) {
							createSubmission({
								userId: auth.sessionData?.id,
								jobType,
								eventHostTime,
								maxDailyHostTime,
								dayTimes,
								specificGame,
								specificRunner,
								additionalInfo,
								experience,
								favMeme,
								runnerManagementAvailability,
								techAvailablity,
								techExperience,
								eventId: event,
							}).then((result) => {
								if (!result.error) {
									clearInputs();
									window.scrollY = 0;
									setSuccessSubmit(true);
								} else {
									console.error(result.error);
								}
							});
						}
					}}>
					{!queryResult?.data?.user?.discord ||
					!queryResult.data.user.verified ? (
						<>
							<p>
								Please make sure you have these set on your
								profile:
							</p>
							<ul>
								<li>Verified Email</li>
								<li>Discord ID</li>
							</ul>
						</>
					) : (
						<>
							{eventsResult.data?.events && eventsResult.data?.events.length > 1 && (
								<FormControl fullWidth>
									<InputLabel id="event-label">
										Event
									</InputLabel>
									<Select
										labelId="event-label"
										value={event}
										label="Event"
										onChange={(e) =>
											setEvent(e.target.value)
										}
										required>
										{eventsResult.data.events.map(
											(event) => {
												return (
													<MenuItem
														value={event.id}
														key={event.id}>
														{event.shortname}
													</MenuItem>
												);
											},
										)}
									</Select>
								</FormControl>
							)}

							<FormControl fullWidth>
								<InputLabel id="job-type-label">
									Job Type
								</InputLabel>
								<Select
									labelId="job-type-label"
									value={jobType}
									label="Job Type"
									onChange={(e) =>
										setJobType(
											e.target.value as JobTypeLiterals,
										)
									}
									required>
									<MenuItem value={"host"}>Host</MenuItem>
									<MenuItem value={"social"}>
										Social Media
									</MenuItem>
									<MenuItem value={"runMgmt"}>
										Runner Management
									</MenuItem>
									<MenuItem value={"tech"}>Tech</MenuItem>
								</Select>
							</FormControl>

							<hr />

							{jobType === "host" && (
								<>
									<p>
										You are the voice of the event reading
										off donations and letting the viewers
										know about the charity and any sponsors.
										<br />
										Any queries please contact{" "}
										<i>werster</i> on Discord.
									</p>
									<div className={styles.question}>
										<span>
											What is the maximum amount of hours
											you are comfortable hosting for the
											entire event?*
										</span>
										<span className={styles.subtitle}>
											This could be all at once, or in
											multiple sessions.
										</span>
										<TextField
											type="number"
											fullWidth
											value={eventHostTime}
											onChange={(e) =>
												setEventHostTime(
													parseInt(e.target.value),
												)
											}
											required
										/>
									</div>
									<div className={styles.question}>
										<span>
											What is the maximum amount of hours
											you are comfortable hosting for in
											one sitting?*
										</span>
										<span className={styles.subtitle}>
											E.g. 3 hours would mean you want all
											your shifts to be no longer than 3
											hours each.
										</span>
										<TextField
											type="number"
											fullWidth
											value={maxDailyHostTime}
											onChange={(e) =>
												setMaxDailyHostTime(
													parseInt(e.target.value),
												)
											}
											required
										/>
									</div>
									<div className={styles.question}>
										<span>
											What times are you available to host
											on each day?*
										</span>
										{hostDates}
									</div>
									<div className={styles.question}>
										<span>
											If you have organised with a
											specific runner that they would like
											you to host their run:
										</span>
										<TextField
											fullWidth
											value={specificGame}
											onChange={(e) =>
												setSpecificGame(e.target.value)
											}
											label="Game"
										/>
										<TextField
											fullWidth
											value={specificRunner}
											onChange={(e) =>
												setSpecificRunner(
													e.target.value,
												)
											}
											label="Runner"
										/>
									</div>
									<div className={styles.question}>
										<span>
											Any other specifications you would
											like to let us know about?
										</span>
										<TextField
											multiline
											minRows={4}
											fullWidth
											value={additionalInfo}
											onChange={(e) =>
												setAdditionalInfo(
													e.target.value,
												)
											}
										/>
									</div>
								</>
							)}

							{jobType === "social" && (
								<>
									<p>
										In charge of creating and posting social
										media content throughout the event (ie.
										tweets of upcoming runs, Instagram
										stories, photos).
										<br />
										Any queries please contact <i>
											Nase
										</i>{" "}
										on Discord.
									</p>
									<FormControl fullWidth>
										<InputLabel id="socialmedia-experience-label">
											Experience level
										</InputLabel>
										<Select
											labelId="socialmedia-experience-label"
											value={experience}
											label="Experience level"
											onChange={(e) =>
												setExperience(
													e.target
														.value as ExperienceLiterals,
												)
											}
											required>
											<MenuItem value={"None"}>
												None
											</MenuItem>
											<MenuItem value={"Casual"}>
												Casual
											</MenuItem>
											<MenuItem value={"Expert"}>
												Expert
											</MenuItem>
										</Select>
									</FormControl>
									<div className={styles.question}>
										<span>
											What times are you available on each
											day?*
										</span>
										{hostDates}
									</div>
									<div className={styles.question}>
										<span>
											Post a link to your favourite meme
										</span>
										<TextField
											fullWidth
											value={favMeme}
											onChange={(e) =>
												setFavMeme(e.target.value)
											}
										/>
									</div>
								</>
							)}

							{jobType === "runMgmt" && (
								<>
									<p>
										Assisting runners with any queries they
										may have throughout the events, making
										sure runners are present for their runs,
										checking vaccination status of and
										handing out passes to attendees.
										<br />
										Any queries please contact <i>
											Sten
										</i>{" "}
										on Discord.
									</p>
									<div className={styles.question}>
										<span>
											What is your availability? This
											should include the setup day as well
											as the actual marathon days.*
										</span>
										<TextField
											fullWidth
											value={runnerManagementAvailability}
											onChange={(e) =>
												setrunnerManagementAvailability(
													e.target.value,
												)
											}
											label=""
											required
											multiline
											minRows={4}
										/>
									</div>
								</>
							)}

							{jobType === "tech" && (
								<>
									<p>
										Setting up next runs and managing the
										stream. Some roles vary in difficulty
										and experience required.
										<br />
										Any queries please contact <i>
											nei
										</i> or <i>Clubwho</i> on Discord.
									</p>
									<div className={styles.question}>
										<span>
											What is your availability? This
											should include the setup day as well
											as the actual marathon days.*
										</span>
										<TextField
											fullWidth
											value={techAvailablity}
											onChange={(e) =>
												setTechAvailablity(
													e.target.value,
												)
											}
											required
											multiline
											minRows={4}
										/>
									</div>
									<div className={styles.question}>
										<span>Previous tech experience.</span>
										<TextField
											multiline
											minRows={4}
											fullWidth
											value={techExperience}
											onChange={(e) =>
												setTechExperience(
													e.target.value,
												)
											}
											label=""
											required
										/>
									</div>
								</>
							)}

							<FormControlLabel
								control={
									<Checkbox
										onChange={(e) =>
											setConfirmation(e.target.checked)
										}
										checked={confirmation}
									/>
								}
								label="You agree that you are willing to be present at the venue for the duration of all of your shifts."
							/>
							<Button
								variant="contained"
								type="submit"
								disabled={disableSend}>
								Submit
							</Button>
							{submissionResult.error && (
								<h2>
									{HumanErrorMsg(
										submissionResult.error.message,
									)}
								</h2>
							)}
						</>
					)}
				</form>
				<Snackbar
					open={successSubmit}
					autoHideDuration={6000}
					onClose={() => setSuccessSubmit(false)}>
					<Alert
						onClose={() => setSuccessSubmit(false)}
						variant="filled"
						severity="success">
						Successfully submitted volunteer
					</Alert>
				</Snackbar>
			</main>
		</ThemeProvider>
	);
}

const NoAuth: React.FC = () => {
	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>{TITLE}</title>
			</Head>
			<main className={`content ${styles.content} ${styles.noEvents}`}>
				<h2>Please sign in to Volunteer.</h2>
				<LinkButton
					actionText="Sign In"
					iconRight={faArrowRight}
					link="/signin"
				/>
				<br />
				<LinkButton
					actionText="Join"
					iconRight={faArrowRight}
					link="/signup"
				/>
			</main>
		</ThemeProvider>
	);
};

const NoEvent: React.FC = () => {
	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>{TITLE}</title>
			</Head>
			<main className={`content ${styles.content} ${styles.noEvents}`}>
				<h2>
					Unfortunately we have no events currently accepting
					volunteers.
				</h2>
				<p>
					Follow us on Twitter and Join our Discord to stay up to
					date!
				</p>
				<LinkButton
					actionText="Home"
					iconRight={faArrowRight}
					link="/"
				/>
			</main>
		</ThemeProvider>
	);
};
