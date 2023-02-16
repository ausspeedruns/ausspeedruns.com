import { useEffect, useState } from "react";
import Head from "next/head";
import { Alert, Snackbar, ThemeProvider } from "@mui/material";
import { useQuery, gql, useMutation } from "urql";

import styles from "../styles/SubmitGame2.module.scss";
import { theme } from "../components/mui-theme";
import { useAuth } from "../components/auth";
import LinkButton from "../components/Button/Button";
import { faArrowRight, faL } from "@fortawesome/free-solid-svg-icons";
import DiscordEmbed from "../components/DiscordEmbed";
import GameSubmissions from "../components/GameSubmission/GameSubmission";
import {
	MUTATION_SUBMISSION_RESULTS,
	QUERY_USER_RESULTS,
} from "../components/GameSubmission/submissionTypes";

import SubmitGameOG from "../styles/img/ogImages/SubmitGame.jpg";

const QUERY_INITIAL = gql`
	query Profile($userId: ID!) {
		user(where: { id: $userId }) {
			verified
			dateOfBirth
			discord
			submissions(orderBy: { created: desc }) {
				game
				platform
				techPlatform
				ageRating
			}
		}
		events(
			where: {
				OR: [
					{ acceptingSubmissions: { equals: true } }
					{ acceptingBackups: { equals: true } }
				]
			}
		) {
			id
			shortname
			submissionInstructions {
				document
			}
			startDate
			endDate
			eventTimezone
			acceptingBackups
			acceptingSubmissions
		}
	}
`;

const MUTATION_SUBMIT = gql`
	mutation (
		$userId: ID!
		$game: String!
		$category: String!
		$platform: String!
		$techPlatform: String!
		$estimate: String!
		$possibleEstimate: String
		$ageRating: SubmissionAgeRatingType
		$newDonationIncentives: JSON
		$specialReqs: String
		$availableDates: JSON!
		$race: SubmissionRaceType
		$racer: String
		$coop: Boolean
		$video: String!
		$eventId: ID!
		$willingBackup: Boolean
	) {
		createSubmission(
			data: {
				runner: { connect: { id: $userId } }
				game: $game
				category: $category
				platform: $platform
				techPlatform: $techPlatform
				estimate: $estimate
				possibleEstimate: $possibleEstimate
				ageRating: $ageRating
				newDonationIncentives: $newDonationIncentives
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
			game
			category
			estimate
			possibleEstimate
			platform
			techPlatform
			race
			coop
			racer
			newDonationIncentives
		}
	}
`;

function BasePage({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>Game Submission - AusSpeedruns</title>
				<DiscordEmbed
					title="Game Submission - AusSpeedruns"
					description="Submit your speedrun to an AusSpeedrun Event!"
					pageUrl="/submit-game"
					imageSrc={SubmitGameOG.src}
				/>
			</Head>
			<div className={styles.backgroundContainer}></div>
			{children}
		</ThemeProvider>
	);
}

export default function SubmitGamePage() {
	const auth = useAuth();
	const [successSubmit, setSuccessSubmit] = useState(false);

	// Query if able to submit game (has discord)
	const [initialQueryResult] = useQuery<QUERY_USER_RESULTS>({
		query: QUERY_INITIAL,
		variables: {
			userId: auth.ready ? auth.sessionData?.id ?? "" : "",
		},
	});

	// Mutation for game submission
	const submissionMutation =
		useMutation<MUTATION_SUBMISSION_RESULTS>(MUTATION_SUBMIT);

	if (
		!initialQueryResult.fetching &&
		initialQueryResult.data?.events.length === 0
	) {
		return (
			<BasePage>
				<main
					className={`content ${styles.content} ${styles.noEvents}`}>
					<h2>
						Unfortunately we have no events currently accepting
						submissions.
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
			</BasePage>
		);
	}

	if (auth.ready && !auth.sessionData) {
		return (
			<BasePage>
				<main
					className={`content ${styles.content} ${styles.noEvents}`}>
					<h2>Please sign in to submit games.</h2>
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
			</BasePage>
		);
	}

	const singleEvent =
		initialQueryResult.data?.events.length === 1
			? initialQueryResult.data.events[0]
			: undefined;

	// console.log(submissionMutation[0]);

	return (
		<BasePage>
			<main className={styles.content}>
				<h1>
					{singleEvent?.shortname}{" "}
					{singleEvent?.acceptingBackups &&
					!singleEvent?.acceptingSubmissions
						? "Backup"
						: "Game"}{" "}
					Submission
				</h1>
				<a href="" target="_blank" rel="noopener noreferrer">
					AusSpeedruns Submission Guidelines
				</a>
				{!initialQueryResult.data?.user?.discord ||
				!initialQueryResult.data?.user.verified ? (
					<>
						<p>
							Please make sure you have these set on your profile:
						</p>
						<ul>
							<li>Verified Email</li>
							<li>Discord ID</li>
						</ul>
					</>
				) : (
					<GameSubmissions
						auth={auth}
						submissionMutation={submissionMutation}
						userQueryResult={initialQueryResult.data}
					/>
				)}

				<Snackbar
					open={successSubmit}
					autoHideDuration={6000}
					onClose={() => setSuccessSubmit(false)}>
					<Alert
						onClose={() => setSuccessSubmit(false)}
						variant="filled"
						severity="success">
						Successfully submitted run!
					</Alert>
				</Snackbar>
			</main>
		</BasePage>
	);
}
