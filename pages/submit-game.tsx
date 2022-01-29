import React, { useState } from 'react';
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

const DiscordRegex = /^.{3,32}#[0-9]{4}$/;

type AgeRatingLiterals = 'm_or_lower' | 'ma15' | 'ra18';
type RaceLiterals = 'no' | 'solo' | 'only';

export default function SubmitGamePage() {
	const auth = useAuth();

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

	// Query if able to submit game (has discord)
	const [queryResult, profileQuery] = useQuery({
		query: gql`
			query Profile($userId: ID!) {
				user(where: { id: $userId }) {
					discord
				}
			}
		`,
		variables: {
			userId: auth.ready ? auth.sessionData?.id ?? '' : '',
		},
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
			$race: SubmissionRaceType!
			$racer: String!
			$coop: Boolean!
			$video: String
		) {
			createSubmission(
				data: {
					user: { connect: { id: $userId } }
					game: $game
					category: $category
					platform: $platform
					estimate: $estimate
					ageRating: $ageRating
					donationIncentive: $donationIncentive
					race: $race
					racer: $racer
					coop: $coop
					video: $video
					event: { connect: { id: "ckywyeqnq0108h0nr284hu98j" } }
				}
			) {
				__typename
			}
		}
	`);

	return (
		<ThemeProvider theme={theme}>
			<div className="App">
				<Head>
					<title>Game Submission - AusSpeedruns</title>
				</Head>
				<Navbar />
				<div className={`content ${styles.content}`}>
					<h1>Game Submission</h1>
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
									race,
									racer,
									coop,
									video,
								}).then((result) => {
									// console.log('YAYY', result)
								});
							}
						}}
					>
						{!DiscordRegex.test(queryResult?.data?.user?.discord ?? '') && (
							<div>Please set your Discord ID on your profile as this will be the primary form of communication.</div>
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
							onChange={(e) => setEstimate(e.target.value)}
							label="Estimate"
							helperText="e.g. 01:20:00 for 1 hour and 20 mins"
							required
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
								<a href="https://www.classification.gov.au/" target='_blank'>https://www.classification.gov.au/</a>
							</FormHelperText>
						</FormControl>
						<TextField
							value={donationIncentive}
							onChange={(e) => setDonationIncentive(e.target.value)}
							label="Donation Incentive (If you have one)"
						/>

						<FormControlLabel
							control={<Checkbox onChange={(e) => setRace(e.target.checked ? 'solo' : 'no')} checked={race !== 'no'} />}
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
								<TextField value={racer} onChange={(e) => setRacer(e.target.value)} label="Name of other player(s)" />
							</>
						)}
						<TextField value={video} onChange={(e) => setVideo(e.target.value)} label="Video of the run" required />
						{submissionResult.error && <h2>{submissionResult.error}</h2>}
						<Button variant="contained" type="submit">
							Submit
						</Button>
					</form>
				</div>
			</div>
		</ThemeProvider>
	);
}
