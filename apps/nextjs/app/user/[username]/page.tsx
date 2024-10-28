"use client";

import { useState } from "react";
import { initUrqlClient } from "next-urql";
import Head from "next/head";
import { Box, IconButton, Tab, Tabs, ThemeProvider } from "@mui/material";
import { useRouter } from "next/router";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from "../../../styles/User.username.module.scss";
import { useAuth } from "../../../components/auth";
import theme from "../../../mui-theme";
import SubmissionAccordion from "../../../components/SubmissionAccordian/SubmissionAccordion";
import RunUpcoming from "../../../components/RunUpcoming/RunUpcoming";
import RunCompleted from "../../../components/RunCompleted/RunCompleted";
import DiscordEmbed from "../../../components/DiscordEmbed";
import Ticket from "../../../components/Ticket/Ticket";
import ASMShirt from "../../../components/ShirtOrder/ShirtOrder";

import { cacheExchange, createClient, fetchExchange, gql } from "@urql/core";
import { registerUrql } from "@urql/next/rsc";
import { notFound } from "next/navigation";

const QUERY_USER = gql`
	query Profile($username: String) {
		user(where: { username: $username }) {
			id
			username
			pronouns
			state
			discord
			twitter
			roles(where: { show: { equals: true } }) {
				id
				name
				event {
					shortname
				}
				colour
				textColour
			}
			runs(orderBy: { scheduledTime: asc }) {
				id
				game
				category
				finalTime
				platform
				youtubeVOD
				twitchVOD
				scheduledTime
				event {
					name
					shortname
					logo {
						url
						width
						height
					}
				}
			}
		}
	}
`;

const QUERY_PRIVATE = gql`
	query Profile($username: String, $currentTime: DateTime) {
		user(where: { username: $username }) {
			submissions(where: { event: { endDate: { gt: $currentTime } } }) {
				id
				runner {
					username
				}
				game
				category
				platform
				techPlatform
				estimate
				possibleEstimate
				possibleEstimateReason
				ageRating
				newDonationIncentives
				status
				race
				racer
				coop
				video
				event {
					id
					name
					shortname
					acceptingSubmissions
					acceptingBackups
					startDate
					endDate
					eventTimezone
				}
				willingBackup
				specialReqs
				availability
			}
			tickets(
				where: {
					AND: [
						{
							OR: [
								{ method: { equals: bank } }
								{ paid: { equals: true } }
							]
						}
						{ event: { endDate: { gt: $currentTime } } }
					]
				}
			) {
				ticketID
				totalCost
				paid
				event {
					shortname
					logo {
						url
						width
						height
					}
				}
				numberOfTickets
				method
				taken
			}
			shirts(
				where: {
					AND: [
						{
							OR: [
								{ method: { equals: bank } }
								{ paid: { equals: true } }
							]
						}
						{ created: { gt: "2024-01-01T00:00:00.000Z" } }
					]
				}
			) {
				shirtID
				paid
				size
				colour
				notes
			}
		}
	}
`;

type QUERY_USER_RESULTS = {
	user: {
		id: string;
		username: string;
		pronouns?: string;
		state: string;
		discord?: string;
		twitter?: string;
		twitch?: string;
		roles: {
			id: string;
			name: string;
			event?: {
				shortname: string;
			};
			colour: string;
			textColour: string;
		}[];
		runs: {
			id: string;
			game: string;
			category: string;
			finalTime?: string;
			platform: string;
			twitchVOD?: string;
			youtubeVOD?: string;
			scheduledTime: string;
			event: {
				name: string;
				shortname: string;
				logo: {
					url: string;
					width: number;
					height: number;
				};
			};
		}[];
	};
};

export type QUERY_PRIVATE_RESULTS = {
	user: {
		submissions: {
			id: string;
			game: string;
			category: string;
			platform: string;
			techPlatform: string;
			estimate: string;
			possibleEstimate: string;
			possibleEstimateReason: string;
			status: "submitted" | "accepted" | "backup" | "rejected";
			newDonationIncentives?: {
				title: string;
				time?: string;
				description?: string;
			}[];
			race?: string;
			racer?: string;
			coop?: boolean;
			video: string;
			ageRating?: string;
			event: {
				id: string;
				name: string;
				shortname: string;
				acceptingSubmissions: boolean;
				acceptingBackups: boolean;
				startDate: string;
				endDate: string;
				eventTimezone: string;
			};
			runner: {
				username: string;
			};
			willingBackup: boolean;
			specialReqs: string;
			availability: boolean[];
		}[];
		tickets: {
			ticketID: string;
			totalCost: number;
			paid: boolean;
			event: {
				shortname: string;
				logo: {
					url: string;
					width: number;
					height: number;
				};
			};
			numberOfTickets: number;
			method: "bank" | "stripe";
			taken: boolean;
		}[];
		shirts: {
			paid: boolean;
			size: string;
			colour: "blue" | "purple";
			shirtID: string;
			notes: string;
		}[];
	};
};

function StateCodeToString(stateCode: string) {
	switch (stateCode) {
		case "vic":
			return "Victoria";
		case "nt":
			return "Northern Territory";
		case "qld":
			return "Queensland";
		case "nsw":
			return "New South Wales";
		case "sa":
			return "South Australia";
		case "act":
			return "ACT";
		case "wa":
			return "Western Australia";
		case "tas":
			return "Tasmania";
		case "outer":
			return "Outside of Australia";
		default:
			return `Unknown (${stateCode})`;
	}
}

const makeClient = () => {
	return createClient({
		url: "http://localhost:8000/api/graphql",
		exchanges: [cacheExchange, fetchExchange],
	});
};

const { getClient } = registerUrql(makeClient);

export default async function ProfilePage({ params }: { params: { username: string } }) {
	const { data: ssrData } = await getClient().query<QUERY_USER_RESULTS>(QUERY_USER, { username: params.username });
	// console.log(ssrData)
	if (!ssrData?.user) {
		return notFound();
	}

	const router = useRouter();
	const auth = useAuth();

	const [submissionTab, setSubmissionTab] = useState(0);
	const [eventTab, setEventTab] = useState(0);
	const [currentTime] = useState(new Date().toISOString());


	// console.log(ssrData)
	// const [{ data: privateDataResults }] = useQuery<QUERY_PRIVATE_RESULTS>({
	// 	query: QUERY_PRIVATE,
	// 	variables: {
	// 		username: ssrData.user.username,
	// 		currentTime: currentTime,
	// 	},
	// 	pause:
	// 		!auth.ready ||
	// 		(auth.ready
	// 			? !(auth.sessionData?.username === ssrData.user.username)
	// 			: true),
	// });

	const upcomingRunsList = ssrData.user.runs.filter(
		(run) => !run.finalTime,
	);

	// Get all event names for tabs
	// Would just do [...new Set(****)] buuuuuuuut... https://stackoverflow.com/questions/33464504/using-spread-syntax-and-new-set-with-typescript
	// const allSubmissionEvents = [
	// 	...Array.from(
	// 		new Set(
	// 			privateDataResults?.user.submissions.map(
	// 				(submission) => submission.event?.shortname,
	// 			),
	// 		),
	// 	),
	// ];
	const allRunEvents = [
		...Array.from(
			new Set(
				ssrData.user.runs.map((run) =>
					run.finalTime ? run.event?.shortname : undefined,
				),
			),
		).filter((el) => typeof el !== "undefined"),
	];

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>{`${ssrData.user.username} - AusSpeedruns`}</title>
				<DiscordEmbed
					title={`${ssrData.user.username}'s Profile - AusSpeedruns`}
					pageUrl={`/user/${ssrData.user.username}`}
				/>
			</Head>
			<div className={styles.content}>
				<div className={styles.profileHeader}>
					<h1>{ssrData.user.username}</h1>
					{auth.ready &&
						auth.sessionData?.id === ssrData.user.id && (
							<div>
								<IconButton
									style={{ float: "right" }}
									onClick={() =>
										router.push("/user/edit-user")
									}>
									<FontAwesomeIcon icon={faEdit} />
								</IconButton>
							</div>
						)}
				</div>
				<hr />
				{/* Role List */}
				{/* <div className={styles.roleList}>
					{ssrData.user.roles.map((role) => {
						return <RoleBadge key={role.id} role={role} />;
					})}
				</div> */}
				{/* Profile Information */}
				<div className={styles.userInfo}>
					{ssrData.user?.state !== "none" && (
						<>
							<span>State</span>
							<span>
								{StateCodeToString(ssrData.user.state)}
							</span>
						</>
					)}
					{ssrData.user.pronouns && (
						<>
							<span>Pronouns</span>
							<span>{ssrData.user.pronouns}</span>
						</>
					)}
				</div>
				{/* Submissions */}
				{/* {privateDataResults?.user && privateDataResults.user.submissions.length > 0 && (
					<div className={styles.submissions}>
						<h3>Submissions (Private)</h3>
						<Box>
							<Tabs
								value={submissionTab}
								onChange={(_e: any, newVal: number) =>
									setSubmissionTab(newVal)
								}
								aria-label="basic tabs example">
								{allSubmissionEvents.map((event) => (
									<Tab label={event} key={event} />
								))}
							</Tabs>
						</Box>
						{privateDataResults.user.submissions.map(
							(submission) => {
								if (
									submission.event?.shortname !==
									allSubmissionEvents[submissionTab]
								)
									return;
								return (
									<SubmissionAccordion
										key={submission.id}
										submission={submission}
										event={submission.event}
									/>
								);
							},
						)}
					</div>
				)} */}

				{/* Tickets */}
				{/* {privateDataResults?.user && privateDataResults.user.tickets.length > 0 && (
					<div className={styles.submissions}>
						<h3 id="tickets">Tickets (Private)</h3>
						{privateDataResults.user.tickets.map((ticket) => {
							return (
								<Ticket
									key={ticket.ticketID}
									ticketData={ticket}
								/>
							);
						})}
					</div>
				)} */}

				{/* Shirt Orders */}
				{/* {privateDataResults?.user && privateDataResults.user.shirts.length > 0 && (
					<div className={styles.submissions}>
						<h3 id="shirts">Shirt Orders (Private)</h3>
						{privateDataResults.user.shirts.map((shirt) => {
							// console.log(shirt);
							return (
								<ASMShirt
									key={shirt.shirtID}
									shirtData={shirt}
								/>
							);
						})}
					</div>
				)} */}

				{/* Upcoming Runs */}
				{upcomingRunsList.length > 0 && (
					<div className={styles.upcomingRuns}>
						<h3>Upcoming Runs</h3>
						{upcomingRunsList.map((run) => {
							return <RunUpcoming run={run} key={run.id} />;
						})}
					</div>
				)}

				{ssrData.user.runs.length > 0 && <hr />}

				{/* Runs */}
				<div className={styles.runs}>
					<Box>
						<Tabs
							value={eventTab}
							onChange={(_e: any, newVal: number) => setEventTab(newVal)}
							variant="scrollable">
							{allRunEvents.reverse().map((event) => (
								<Tab label={event} key={event} />
							))}
						</Tabs>
					</Box>
					{ssrData.user.runs.map((run) => {
						if (!run.finalTime) return;
						return (
							<div
								key={run.id}
								hidden={
									run.event?.shortname !==
									allRunEvents[eventTab]
								}>
								<RunCompleted run={run} />
							</div>
						);
					})}
				</div>
			</div>
		</ThemeProvider>
	);
}
