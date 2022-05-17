import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import {
	Alert,
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	FormHelperText,
	FormLabel,
	InputLabel,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	Snackbar,
	TextField,
	ThemeProvider,
} from '@mui/material';
import { useQuery, gql, useMutation } from 'urql';

import styles from '../styles/SubmitGame.module.scss';
import { theme } from '../components/mui-theme';
import { useAuth } from '../components/auth';
import Navbar from '../components/Navbar/Navbar';
import LinkButton from '../components/Button/Button';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import DiscordEmbed from '../components/DiscordEmbed';
import { addDays, differenceInDays } from 'date-fns';

type AgeRatingLiterals = 'm_or_lower' | 'ma15' | 'ra18';
type RaceLiterals = 'no' | 'solo' | 'only';

const EstimateRegex = /^\d{1,2}:\d{2}:\d{2}$/;

function HumanErrorMsg(error: string) {
	// console.log(error.replace(/(\r\n|\n|\r)/gm, ""));
	switch (error.replace(/(\r\n|\n|\r)/gm, '')) {
		case `[GraphQL] You provided invalid data for this operation.  - Submission.estimate: Estimate invalid. Make sure its like 01:30:00.`:
			return "Error: Estimate invalid. Make sure it's like HH:MM:SS. e.g. 01:30:00";

		default:
			return error;
	}
}

export default function SubmitGamePage() {
	const auth = useAuth();

	const [event, setEvent] = useState('');
	const [game, setGame] = useState('');
	const [category, setCategory] = useState('');
	const [platform, setPlatform] = useState('');
	const [estimate, setEstimate] = useState('');
	const [ageRating, setAgeRating] = useState<AgeRatingLiterals>('m_or_lower');
	const [donationIncentive, setDonationIncentive] = useState('');
	const [race, setRace] = useState<RaceLiterals>('no');
	const [coop, setCoop] = useState(false);
	const [racer, setRacer] = useState('');
	const [video, setVideo] = useState('');
	const [specialReqs, setSpecialReqs] = useState('');
	const [availableDates, setAvailableDates] = useState<boolean[]>([]);
	const [estimateError, setEstimateError] = useState(false);
	const [backup, setBackup] = useState(false);

	const [canSubmit, setCanSubmit] = useState(false);
	const [successSubmit, setSuccessSubmit] = useState(false);

	// Query if able to submit game (has discord)
	const [queryResult, profileQuery] = useQuery({
		query: gql`
			query Profile($userId: ID!) {
				user(where: { id: $userId }) {
					verified
					dateOfBirth
					discord
				}
			}
		`,
		variables: {
			userId: auth.ready ? auth.sessionData?.id ?? '' : '',
		},
	});

	const [eventsResult, eventsQuery] = useQuery<{
		events: {
			shortname: string;
			id: string;
			submissionInstructions: string;
			startDate: string;
			endDate: string;
			eventTimezone: string;
			acceptingBackups: boolean;
		}[];
	}>({
		query: gql`
			query {
				events(where: { OR: [{ acceptingSubmissions: { equals: true } }, { acceptingBackups: { equals: true } }] }) {
					id
					shortname
					submissionInstructions
					startDate
					endDate
					eventTimezone
					acceptingBackups
				}
			}
		`,
	});

	// Mutation for game submission
	const [submissionResult, createSubmission] = useMutation(gql`
		mutation (
			$userId: ID
			$game: String
			$category: String
			$platform: String
			$estimate: String
			$ageRating: SubmissionAgeRatingType!
			$donationIncentive: String!
			$specialReqs: String!
			$availableDates: JSON!
			$race: SubmissionRaceType!
			$racer: String!
			$coop: Boolean!
			$video: String
			$eventId: ID
			$willingBackup: Boolean!
		) {
			createSubmission(
				data: {
					runner: { connect: { id: $userId } }
					game: $game
					category: $category
					platform: $platform
					estimate: $estimate
					ageRating: $ageRating
					donationIncentive: $donationIncentive
					specialReqs: $specialReqs
					availability: $availableDates
					race: $race
					racer: $racer
					coop: $coop
					video: $video
					event: { connect: { id: $eventId } }
					willingBackup: $willingBackup
				}
			) {
				__typename
			}
		}
	`);

	useEffect(() => {
		if (eventsResult.data?.events.length > 0) {
			setEvent(eventsResult.data.events[0].id);
		}
	}, [eventsResult]);

	const currentEvent = eventsResult.data?.events.find((eventResult) => eventResult.id === event);

	useEffect(() => {
		setCanSubmit(
			game &&
				category &&
				platform &&
				estimate &&
				!estimateError &&
				event &&
				video &&
				availableDates.some((day) => day) &&
				(currentEvent?.acceptingBackups ? backup : true)
		);
	}, [game, category, platform, estimate, estimateError, event, video, availableDates, currentEvent, backup]);

	function clearInputs() {
		setGame('');
		setCategory('');
		setPlatform('');
		setEstimate('');
		setAgeRating('m_or_lower');
		setDonationIncentive('');
		setSpecialReqs('');
		setRace('no');
		setRacer('');
		setCoop(false);
		setVideo('');
	}

	function forceCanSubmitUpdate() {
		setCanSubmit(
			game && category && platform && estimate && !estimateError && event && video && availableDates.some((day) => day)
		);
	}

	if (!eventsResult.fetching && eventsResult.data?.events.length === 0) {
		return (
			<ThemeProvider theme={theme}>
				<Head>
					<title>Game Submission - AusSpeedruns</title>
				</Head>
				<Navbar />
				<main className={`content ${styles.content} ${styles.noEvents}`}>
					<h2>Unfortunately we have no events currently accepting submissions.</h2>
					<p>Follow us on Twitter and Join our Discord to stay up to date!</p>
					<LinkButton actionText="Home" iconRight={faArrowRight} link="/" />
				</main>
			</ThemeProvider>
		);
	}

	if (auth.ready && !auth.sessionData) {
		return (
			<ThemeProvider theme={theme}>
				<Head>
					<title>Game Submission - AusSpeedruns</title>
				</Head>
				<Navbar />
				<main className={`content ${styles.content} ${styles.noEvents}`}>
					<h2>Please sign in to submit games.</h2>
					<LinkButton actionText="Sign In" iconRight={faArrowRight} link="/signin" />
					<br />
					<LinkButton actionText="Join" iconRight={faArrowRight} link="/signup" />
				</main>
			</ThemeProvider>
		);
	}

	// console.log(
	// 	game,
	// 	category,
	// 	platform,
	// 	estimate,
	// 	!estimateError,
	// 	event,
	// 	video,
	// 	availableDates.some((day) => day)
	// );

	let eventLength = 0;
	if (currentEvent) {
		eventLength = differenceInDays(new Date(currentEvent.endDate), new Date(currentEvent.startDate)) + 1;
	}

	let dateCheckboxes = [];
	for (let i = 0; i < eventLength; i++) {
		const date = addDays(new Date(currentEvent.startDate), i);
		dateCheckboxes.push(
			<FormControlLabel
				key={i}
				control={
					<Checkbox
						onChange={(e) => {
							const newDates = availableDates;
							newDates[i] = e.target.checked;
							setAvailableDates(newDates);
							forceCanSubmitUpdate();
						}}
					/>
				}
				label={date.toLocaleDateString('en-AU', {
					weekday: 'long',
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
					timeZone: currentEvent.eventTimezone || 'Australia/Melbourne',
				})}
			/>
		);
	}

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>Game Submission - AusSpeedruns</title>
				<DiscordEmbed
					title="Game Submission - AusSpeedruns"
					description="Submit your speedrun to the AusSpeedrun Marathon"
					pageUrl="/submit-game"
				/>
			</Head>
			<Navbar />
			<main className={styles.content}>
				<h1>
					{currentEvent?.shortname} {currentEvent?.acceptingBackups ? 'Backup' : 'Game'} Submission
				</h1>
				<form
					className={styles.gameForm}
					onSubmit={(e) => {
						e.preventDefault();
						if (auth.ready && canSubmit) {
							createSubmission({
								userId: auth.sessionData.id,
								game,
								category,
								platform,
								estimate,
								ageRating,
								donationIncentive,
								specialReqs,
								availableDates,
								race,
								racer,
								coop,
								video,
								eventId: event,
								willingBackup: currentEvent?.acceptingBackups
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
					}}
				>
					{!queryResult?.data?.user?.discord ||
					!queryResult.data.user.verified ||
					!queryResult.data.user.dateOfBirth ? (
						<>
							<p>Please make sure you have these set on your profile:</p>
							<ul>
								<li>Verfied Email</li>
								<li>Date of Birth</li>
								<li>Discord ID</li>
							</ul>
						</>
					) : (
						<>
							{eventsResult.data.events.length > 1 && (
								<FormControl fullWidth>
									<InputLabel id="event-label">Event</InputLabel>
									<Select
										labelId="event-label"
										value={event}
										label="Event"
										onChange={(e) => setEvent(e.target.value)}
										required
									>
										{eventsResult.data.events.map((event) => {
											return (
												<MenuItem value={event.id} key={event.id}>
													{event.shortname}
													{event.acceptingBackups ? ' (Backups)' : ''}
												</MenuItem>
											);
										})}
									</Select>
								</FormControl>
							)}

							{currentEvent?.acceptingBackups && (
								<FormControlLabel
									control={<Checkbox onChange={(e) => setBackup(e.target.checked)} value={backup} />}
									label="You understand that this is a submission for backup games"
								/>
							)}

							<TextField
								value={game}
								onChange={(e) => setGame(e.target.value)}
								label="Game Name"
								autoComplete="game"
								inputProps={{ maxLength: 100 }}
								required
							/>
							<TextField
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								label="Category"
								autoComplete="category"
								inputProps={{ maxLength: 100 }}
								required
							/>
							<TextField
								value={platform}
								onChange={(e) => setPlatform(e.target.value)}
								label="Platform/Console"
								autoComplete="platform"
								inputProps={{ maxLength: 100 }}
								required
							/>
							<TextField
								value={estimate}
								onChange={(e) => {
									setEstimate(e.target.value);

									if (EstimateRegex.test(e.target.value)) {
										setEstimateError(false);
									}
								}}
								onBlur={() => {
									setEstimateError(!EstimateRegex.test(estimate));
								}}
								label="Estimate"
								helperText="e.g. 01:20:00 for 1 hour and 20 mins. This will automatically get rounded up the next 5 mins."
								required
								autoComplete="off"
								error={estimateError}
							/>
							<FormControl fullWidth>
								<InputLabel id="age-rating-label">Age Rating</InputLabel>
								<Select
									labelId="age-rating-label"
									value={ageRating}
									label="Age Rating"
									onChange={(e) => setAgeRating(e.target.value as AgeRatingLiterals)}
									required
								>
									<MenuItem value={'m_or_lower'}>G, PG or M</MenuItem>
									<MenuItem value={'ma15'}>MA15+</MenuItem>
									<MenuItem value={'ra18'}>RA18+</MenuItem>
								</Select>
								<FormHelperText>
									If unsure please search for the game title here:{' '}
									<a href="https://www.classification.gov.au/" target="_blank" rel="noreferrer">
										https://www.classification.gov.au/
									</a>
								</FormHelperText>
							</FormControl>
							<TextField
								value={donationIncentive}
								onChange={(e) => setDonationIncentive(e.target.value)}
								label="Donation Incentive (Leave blank if none)"
								autoComplete="off"
								inputProps={{ maxLength: 100 }}
							/>

							<TextField
								value={specialReqs}
								onChange={(e) => setSpecialReqs(e.target.value)}
								label="Special Requirements to run your game (Leave blank if none)"
								autoComplete="off"
								inputProps={{ maxLength: 100 }}
							/>
							<h3>Availability?*</h3>
							{dateCheckboxes}
							<br />
							<FormControlLabel
								control={
									<Checkbox onChange={(e) => setRace(e.target.checked ? 'solo' : 'no')} checked={race !== 'no'} />
								}
								label="Submit as a race/co-op?"
							/>

							{race !== 'no' && (
								<>
									<FormControlLabel
										control={<Checkbox onChange={(e) => setCoop(e.target.checked)} checked={coop} />}
										label="Coop"
									/>
									<FormControl>
										{/* Don't think "type" is a good descriptor */}
										<FormLabel id="race-type-label">Race/Co-op Type</FormLabel>
										<RadioGroup
											aria-labelledby="race-type-label"
											value={race}
											onChange={(e) => setRace(e.target.value as RaceLiterals)}
										>
											<FormControlLabel value="solo" control={<Radio />} label="Possible to do solo" />
											<FormControlLabel value="only" control={<Radio />} label="Only race/co-op" />
										</RadioGroup>
									</FormControl>
									<TextField
										value={racer}
										onChange={(e) => setRacer(e.target.value)}
										label="Name of other runner(s)"
										autoComplete="off"
										inputProps={{ maxLength: 100 }}
									/>
								</>
							)}
							<TextField
								value={video}
								onChange={(e) => setVideo(e.target.value)}
								label="Video of your own run"
								autoComplete="off"
								inputProps={{ maxLength: 100 }}
								required
							/>
							<p>{currentEvent?.submissionInstructions}</p>
							{submissionResult.error && <h2>{HumanErrorMsg(submissionResult.error.message)}</h2>}
							<Button variant="contained" type="submit" disabled={!canSubmit}>
								Submit
							</Button>
						</>
					)}
				</form>
				<Snackbar open={successSubmit} autoHideDuration={6000} onClose={() => setSuccessSubmit(false)}>
					<Alert onClose={() => setSuccessSubmit(false)} variant="filled" severity="success">
						Successfully submitted run!
					</Alert>
				</Snackbar>
			</main>
		</ThemeProvider>
	);
}
