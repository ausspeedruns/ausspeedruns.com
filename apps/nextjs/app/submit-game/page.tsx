import { gql, createClient, cacheExchange, fetchExchange } from "urql";

import styles from "../../styles/SubmitGame.module.scss";
import LinkButton from "../../components/Button/Button";
import { faArrowRight, faL } from "@fortawesome/free-solid-svg-icons";
import GameSubmissions from "./GameSubmission/GameSubmission";
import { QUERY_USER_RESULTS } from "./GameSubmission/submissionTypes";
import { auth } from "../../auth";

// import SubmitGameOG from "../styles/img/ogImages/SubmitGame.jpg";

import { cookies } from "next/headers";
import { registerUrql } from "@urql/next/rsc";
import { Metadata } from "next";

const makeClient = () => {
	return createClient({
		// url: "http://localhost:8000/api/graphql",
		url: "https://keystone.ausspeedruns.com/api/graphql",
		exchanges: [cacheExchange, fetchExchange],
		fetchOptions: () => {
			const cookie = cookies();
			if (cookie.has("keystonejs-session")) {
				const keystoneCookie = cookie.get("keystonejs-session");
				return {
					headers: {
						cookie: `keystonejs-session=${keystoneCookie?.value}`,
					},
				};
			}

			return {};
		},
	});
};

const { getClient } = registerUrql(makeClient);

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
		events(where: { OR: [{ acceptingSubmissions: { equals: true } }, { acceptingBackups: { equals: true } }] }) {
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

function BasePage({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
			<div className={styles.backgroundContainer}></div>
			{children}
		</div>
	);
}

export const metadata: Metadata = {
	title: "Speedrun Submission",
	description: "Submit a run to an AusSpeedruns event!",
};

export default async function SubmitGamePage() {
	const session = await auth();
	// const [successSubmit, setSuccessSubmit] = useState(false);

	if (!session || !session.user.id) {
		return (
			<BasePage>
				<div className={`content ${styles.content} ${styles.noEvents}`}>
					<h2>Please sign in to submit games.</h2>
					<LinkButton actionText="Sign In" iconRight={faArrowRight} link="/signin" />
					<br />
					<LinkButton actionText="Join" iconRight={faArrowRight} link="/signup" />
				</div>
			</BasePage>
		);
	}

	// Query if able to submit game (has discord)
	const { data } = await getClient().query<QUERY_USER_RESULTS>(QUERY_INITIAL, {
		userId: session.user.id,
	});

	// Mutation for game submission
	// const submissionMutation = useMutation<MUTATION_SUBMISSION_RESULTS>(MUTATION_SUBMIT);

	if (data?.events.length === 0) {
		return (
			<BasePage>
				<div className={`content ${styles.content} ${styles.noEvents}`}>
					<h2>Unfortunately we have no events currently accepting submissions.</h2>
					<p>Follow us on Twitter and Join our Discord to stay up to date!</p>
					<LinkButton actionText="Home" iconRight={faArrowRight} link="/" />
				</div>
			</BasePage>
		);
	}

	const singleEvent = data?.events.length === 1 ? data.events[0] : undefined;

	// console.log(submissionMutation[0]);

	return (
		<BasePage>
			<div className={styles.content}>
				<h1>
					{singleEvent?.shortname}{" "}
					{singleEvent?.acceptingBackups && !singleEvent?.acceptingSubmissions ? "Backup" : "Game"} Submission
				</h1>
				<a
					href="https://ausspeedruns.sharepoint.com/:w:/s/Main/Efo5GBDHzvRElYyMBpyucFgBYBfJAGLsP6qf1pE9ebU6-w?e=TKimUn"
					target="_blank"
					rel="noopener noreferrer">
					AusSpeedruns Submission Guidelines
				</a>
				{!data?.user?.discord || !data?.user.verified ? (
					<>
						<p>Please make sure you have these set on your profile:</p>
						<ul>
							<li>Verified Email</li>
							<li>Discord ID</li>
						</ul>
					</>
				) : (
					data.events.length > 0 && <GameSubmissions userId={session.user.id} userQueryResult={data} />
				)}

				{/* <Snackbar open={successSubmit} autoHideDuration={6000} onClose={() => setSuccessSubmit(false)}>
					<Alert onClose={() => setSuccessSubmit(false)} variant="filled" severity="success">
						Successfully submitted run!
					</Alert>
				</Snackbar> */}
			</div>
		</BasePage>
	);
}
