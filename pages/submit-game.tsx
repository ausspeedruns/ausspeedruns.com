import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import {
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

type AgeRatingLiterals = 'm_or_lower' | 'ma15' | 'ra18';
type RaceLiterals = 'no' | 'solo' | 'only';

const EstimateRegex = /^\d{2}:\d{2}:\d{2}$/;

function addDays(date: string | number | Date, days: number) {
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
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

	// Query if able to submit game (has discord)
	const [queryResult, profileQuery] = useQuery({
		query: gql`
			query Profile($userId: ID!) {
				user(where: { id: $userId }) {
					verified
					dateOfBirth
					socials {
						discord
					}
				}
			}
		`,
		variables: {
			userId: auth.ready ? auth.sessionData?.id ?? '' : '',
		},
	});

	const [eventsResult, eventsQuery] = useQuery<{
		events: { shortname: string; id: string; submissionInstructions: string; startDate: string; endDate: string }[];
	}>({
		query: gql`
			query {
				events(where: { acceptingSubmissions: { equals: true } }) {
					id
					shortname
					submissionInstructions
					startDate
					endDate
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

	const currentEvent = eventsResult.data?.events.find((eventResult) => eventResult.id === event);

	const canSubmit = game && category && platform && estimate && !estimateError && event && video && availableDates.some(day => day);

	console.log(game, category, platform, estimate, !estimateError, event, video, availableDates.some(day => day))

	let eventLength = 0;
	if (currentEvent) {
		eventLength =
			// Subtract the two dates, add one since off by one error and divide days between
			(new Date(currentEvent.endDate).getTime() - new Date(currentEvent.startDate).getTime() + 60 * 60 * 24 * 1000) /
			(60 * 60 * 24 * 1000);
	}

	let dateCheckboxes = [];
	for (let i = 0; i < eventLength; i++) {
		const date = addDays(currentEvent.startDate, i);
		dateCheckboxes.push(
			<FormControlLabel
				key={i}
				control={
					<Checkbox
						onChange={(e) => {
							const newDates = availableDates;
							newDates[i] = e.target.checked;
							setAvailableDates(newDates);
							console.log(availableDates)
						}}
					/>
				}
				label={date.toLocaleDateString('en-AU', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
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
				<h1>{currentEvent?.shortname} Game Submission</h1>
				<form
					className={styles.gameForm}
					onSubmit={(e) => {
						e.preventDefault();
						if (auth.ready) {
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
							}).then((result) => {
								if (!result.error) {
									clearInputs();
									window.scrollY = 0;
								} else {
									console.error(result.error);
								}
							});
						}
					}}
				>
					{!queryResult?.data?.user?.socials?.discord ||
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
												</MenuItem>
											);
										})}
									</Select>
								</FormControl>
							)}

							<TextField value={game} onChange={(e) => setGame(e.target.value)} label="Game Name" required />
							<TextField value={category} onChange={(e) => setCategory(e.target.value)} label="Category" required />
							<TextField
								value={platform}
								onChange={(e) => setPlatform(e.target.value)}
								label="Platform/Console"
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
								helperText="e.g. 01:20:00 for 1 hour and 20 mins"
								required
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
							/>

							<TextField
								value={specialReqs}
								onChange={(e) => setSpecialReqs(e.target.value)}
								label="Special Requirements to run your game (Leave blank if none)"
							/>
							<h3>Availability?</h3>
							{dateCheckboxes}
							<br />
							<FormControlLabel
								control={
									<Checkbox onChange={(e) => setRace(e.target.checked ? 'solo' : 'no')} checked={race !== 'no'} />
								}
								label="Submit as a race/coop?"
							/>

							{race !== 'no' && (
								<>
									<FormControlLabel
										control={<Checkbox onChange={(e) => setCoop(e.target.checked)} checked={coop} />}
										label="Coop"
									/>
									<FormControl>
										{/* Don't think "type" is a good descriptor */}
										<FormLabel id="race-type-label">Race/Coop Type</FormLabel>
										<RadioGroup
											aria-labelledby="race-type-label"
											value={race}
											onChange={(e) => setRace(e.target.value as RaceLiterals)}
										>
											<FormControlLabel value="solo" control={<Radio />} label="Possible to do solo" />
											<FormControlLabel value="only" control={<Radio />} label="Only race/coop" />
										</RadioGroup>
									</FormControl>
									<TextField value={racer} onChange={(e) => setRacer(e.target.value)} label="Name of other runner(s)" />
								</>
							)}
							<TextField value={video} onChange={(e) => setVideo(e.target.value)} label="Video of the run" required />
							{submissionResult.error && <h2>{submissionResult.error.message}</h2>}
							<p>{currentEvent?.submissionInstructions}</p>
							<Button variant="contained" type="submit" disabled={!canSubmit}>
								Submit
							</Button>
						</>
					)}
				</form>
			</main>
		</ThemeProvider>
	);
}
