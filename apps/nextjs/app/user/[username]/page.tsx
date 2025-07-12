import { IconButton, Tooltip } from "@mui/material";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from "../../../styles/User.username.module.scss";
import RunUpcoming from "../../../components/RunUpcoming/RunUpcoming";
import Ticket from "../../../components/Ticket/Ticket";

import { gql } from "@urql/core";
import { notFound } from "next/navigation";
import { auth } from "../../../auth";
import PreviousRuns from "./previous-runs";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { Submission } from "./submission";
import Submissions from "./submissions";
import Link from "next/link";
import { faBluesky, faTwitch, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { normalClient } from "@libs/urql";
import { getUrqlCookieClient } from "@libs/urql-cookie";
import { ASMShirt } from "../../ASM2025/shirt-purchase";

const QUERY_USER = gql`
	query Profile($username: String) {
		user(where: { username: $username }) {
			id
			username
			pronouns
			state
			twitter
			twitch
			bluesky
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
					eventTimezone
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
						{ OR: [{ method: { equals: bank } }, { paid: { equals: true } }] }
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
						{ OR: [{ method: { equals: bank } }, { paid: { equals: true } }] }
						{ created: { gt: "2025-01-01T00:00:00.000Z" } }
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
		twitter?: string;
		twitch?: string;
		bluesky?: string;
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
				eventTimezone: string;
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
		submissions: Submission[];
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

type ProfilePageParams = {
	params: {
		username: string;
	};
};

export async function generateMetadata({ params }: ProfilePageParams): Promise<Metadata> {
	return {
		title: params.username,
	};
}

export default async function ProfilePage({ params }: ProfilePageParams) {
	const cookieStore = cookies();
	const { data: ssrData } = await normalClient.query<QUERY_USER_RESULTS>(QUERY_USER, { username: params.username });

	if (!ssrData?.user) {
		return notFound();
	}

	const session = await auth();

	let privateDataResults = null;
	if (session?.user.username === ssrData.user.username) {
		const results = await getUrqlCookieClient()?.query<QUERY_PRIVATE_RESULTS>(QUERY_PRIVATE, {
			username: ssrData.user.username,
			currentTime: new Date().toISOString(),
		});

		if (results?.data?.user) {
			privateDataResults = results.data.user;
		}
	}

	const upcomingRunsList = ssrData.user.runs.filter((run) => !run.finalTime);

	return (
		<>
			<div className={styles.content}>
				<div className={styles.profileHeader}>
					<h1 style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
						{ssrData.user.username}
						<div style={{ display: "flex", gap: "0.5rem", fontSize: "75%" }}>
							<SocialMediaLink
								icon={faTwitch}
								handle={ssrData.user.twitch}
								link={`https://www.twitch.tv/${ssrData.user.twitch}`}
							/>
							<SocialMediaLink
								icon={faBluesky}
								handle={ssrData.user.bluesky}
								link={`https://bsky.app/profile/${ssrData.user.bluesky}`}
							/>
							<SocialMediaLink
								icon={faTwitter}
								handle={ssrData.user.twitter}
								link={`https://www.twitter.com/${ssrData.user.twitter}`}
							/>
						</div>
					</h1>
					{session?.user?.username === ssrData.user.username && (
						<Link href="/user/edit-user">
							<IconButton style={{ float: "right" }}>
								<FontAwesomeIcon icon={faEdit} />
							</IconButton>
						</Link>
					)}
				</div>
				<hr />
				{/* Profile Information */}
				<div className={styles.userInfo}>
					{ssrData.user?.state !== "none" && (
						<>
							<span>State</span>
							<span>{StateCodeToString(ssrData.user.state)}</span>
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
				{privateDataResults && privateDataResults.submissions.length > 0 && (
					<Submissions
						submissions={privateDataResults.submissions}
						cookie={cookieStore.get("keystonejs-session")?.value}
					/>
				)}

				{/* Tickets */}
				{privateDataResults && privateDataResults.tickets.length > 0 && (
					<div className={styles.submissions}>
						<h3 id="tickets">Tickets (Private)</h3>
						{privateDataResults.tickets.map((ticket) => {
							return <Ticket key={ticket.ticketID} ticketData={ticket} />;
						})}
					</div>
				)}

				{/* Shirt Orders */}
				{privateDataResults?.shirts && privateDataResults.shirts.length > 0 && (
					<div className={[styles.submissions, styles.shirts].join(" ")}>
						<h3 id="shirts">Shirt Orders (Private)</h3>
						{privateDataResults.shirts.map((shirt) => {
							// console.log(shirt);
							return (
								<ASMShirt
									key={shirt.shirtID}
									shirtData={shirt}
								/>
							);
						})}
					</div>
				)}

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
				<PreviousRuns runs={ssrData.user.runs} />
			</div>
		</>
	);
}

function SocialMediaLink({ icon, handle, link }: { icon: any; handle?: string; link: string }) {
	if (!handle) {
		return null;
	}

	return (
		<Tooltip title={handle} placement="top">
			<a href={link} target="_blank" rel="noreferrer">
				<FontAwesomeIcon icon={icon} />
			</a>
		</Tooltip>
	);
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
