import React, { useEffect, useState } from 'react';
import { cacheExchange, dedupExchange, fetchExchange, gql, ssrExchange, useQuery } from 'urql';
import { initUrqlClient, withUrqlClient } from 'next-urql';
import Head from 'next/head';
import { Box, IconButton, Tab, Tabs, ThemeProvider } from '@mui/material';
import { useRouter } from 'next/router';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from '../../styles/User.username.module.scss';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../components/auth';
import { theme } from '../../components/mui-theme';
import { RoleBadge } from '../../components/RoleBadge/RoleBadge';
import SubmissionAccordian from '../../components/SubmissionAccordian/SubmissionAccordian';
import RunUpcoming from '../../components/RunUpcoming/RunUpcoming';
import RunCompleted from '../../components/RunCompleted/RunCompleted';
import DiscordEmbed from '../../components/DiscordEmbed';
import Ticket from '../../components/Ticket/Ticket';
import ASMShirt from '../../components/ShirtOrder/ShirtOrder';
import Footer from '../../components/Footer/Footer';

const USER_QUERY = gql`
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
			runs {
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

const USER_PRIVATE_QUERY = gql`
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
				estimate
				ageRating
				donationIncentive
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
					AND: [{ OR: [{ method: { equals: bank } }, { paid: { equals: true } }] }, { taken: { equals: true } }]
				}
			) {
				shirtID
				paid
				size
				colour
			}
		}
	}
`;

type UserPageData = {
	user: {
		id: string;
		username: string;
		pronouns?: string;
		state?: string;
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

export type UserPagePrivateData = {
	user: {
		submissions: {
			id: string;
			game: string;
			category: string;
			platform: string;
			estimate: string;
			status: 'submitted' | 'accepted' | 'backup' | 'rejected';
			donationIncentive?: string;
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
			method: 'bank' | 'stripe';
			taken: boolean;
		}[];
		shirts: {
			paid: boolean;
			size: string;
			colour: 'blue' | 'purple';
			shirtID: string;
		}[];
	};
};

function StateCodeToString(stateCode: string) {
	switch (stateCode) {
		case 'vic':
			return 'Victoria';
		case 'nt':
			return 'Northern Territory';
		case 'qld':
			return 'Queensland';
		case 'nsw':
			return 'New South Wales';
		case 'sa':
			return 'South Australia';
		case 'act':
			return 'ACT';
		case 'wa':
			return 'Western Australia';
		case 'tas':
			return 'Tasmania';
		case 'outer':
			return 'Outside of Australia';
		default:
			return `Unknown (${stateCode})`;
	}
}

export default function ProfilePage(ssrData) {
	const router = useRouter();
	const auth = useAuth();

	const [submissionTab, setSubmissionTab] = useState(0);
	const [eventTab, setEventTab] = useState(0);
	const [currentTime] = useState(new Date().toISOString());

	// User inputs
	const [
		{
			data: { user: publicDataResults },
		},
	] = useQuery<UserPageData>({
		query: USER_QUERY,
		variables: { username: ssrData.username },
	});

	if (!publicDataResults) {
		return (
			<ThemeProvider theme={theme}>
				<Head>
					<title>{router.query.username} - AusSpeedruns</title>
				</Head>
				<Navbar />
				<div className={styles.content}>
					<h2>Could not find {router.query.username}</h2>
				</div>
			</ThemeProvider>
		);
	}

	const [{ data: privateDataResults }] = useQuery<UserPagePrivateData>({
		query: USER_PRIVATE_QUERY,
		variables: {
			username: ssrData.username,
			currentTime: currentTime,
		},
		pause: !auth.ready && (auth.ready ? auth.sessionData.username == ssrData.username : true),
	});

	const upcomingRunsList = publicDataResults.runs.filter((run) => !run.finalTime);

	// Get all event names for tabs
	// Would just do [...new Set(****)] buuuuuuuut... https://stackoverflow.com/questions/33464504/using-spread-syntax-and-new-set-with-typescript
	const allSubmissionEvents = [
		...Array.from(new Set(privateDataResults?.user.submissions.map((submission) => submission.event.shortname))),
	];
	const allRunEvents = [
		...Array.from(new Set(publicDataResults.runs.map((run) => (run.finalTime ? run.event.shortname : undefined)))).filter((el) => typeof el !== 'undefined'),
	];

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>{publicDataResults.username} - AusSpeedruns</title>
				<DiscordEmbed
					title={`${publicDataResults.username}'s Profile - AusSpeedruns`}
					pageUrl={`/user/${publicDataResults.username}`}
				/>
			</Head>
			<Navbar />
			<div className={styles.content}>
				<div className={styles.profileHeader}>
					<h1>{publicDataResults.username}</h1>
					{auth.ready && auth.sessionData?.id === publicDataResults.id && (
						<div>
							<IconButton style={{ float: 'right' }} onClick={() => router.push('/user/edit-user')}>
								<FontAwesomeIcon icon={faEdit} />
							</IconButton>
						</div>
					)}
				</div>
				<hr />
				{/* Role List */}
				<div className={styles.roleList}>
					{publicDataResults.roles.map((role) => {
						return <RoleBadge key={role.id} role={role} />;
					})}
				</div>
				{/* Profile Information */}
				<div className={styles.userInfo}>
					{publicDataResults?.state !== 'none' && (
						<>
							<span>State</span>
							<span>{StateCodeToString(publicDataResults.state)}</span>
						</>
					)}
					{publicDataResults.pronouns && (
						<>
							<span>Pronouns</span>
							<span>{publicDataResults.pronouns}</span>
						</>
					)}
				</div>
				{/* Submissions */}
				{privateDataResults?.user.submissions.length > 0 && (
					<div className={styles.submissions}>
						<h3>Submissions (Private)</h3>
						<Box>
							<Tabs
								value={submissionTab}
								onChange={(_e, newVal) => setSubmissionTab(newVal)}
								aria-label="basic tabs example"
							>
								{allSubmissionEvents.map((event) => (
									<Tab label={event} key={event} />
								))}
							</Tabs>
						</Box>
						{privateDataResults.user.submissions.map((submission) => {
							if (submission.event.shortname !== allSubmissionEvents[submissionTab]) return;
							return <SubmissionAccordian key={submission.id} submission={submission} event={submission.event} />;
						})}
					</div>
				)}

				{/* Tickets */}
				{privateDataResults?.user.tickets.length > 0 && (
					<div className={styles.submissions}>
						<h3 id="tickets">Tickets (Private)</h3>
						{privateDataResults.user.tickets.map((ticket) => {
							return <Ticket key={ticket.ticketID} ticketData={ticket} />;
						})}
					</div>
				)}

				{/* Tickets */}
				{privateDataResults?.user.tickets.length > 0 && (
					<div className={styles.submissions}>
						<h3 id="shirts">Shirt Orders (Private)</h3>
						{privateDataResults.user.shirts.map((shirt) => {
							return <ASMShirt key={shirt.shirtID} shirtData={shirt} />;
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

				{publicDataResults.runs.length > 0 && <hr />}

				{/* Runs */}
				<div className={styles.runs}>
					<Box>
						<Tabs value={eventTab} onChange={(_e, newVal) => setEventTab(newVal)}>
							{allRunEvents.map((event) => <Tab label={event} key={event} />)}
						</Tabs>
					</Box>
					{publicDataResults.runs.map((run) => {
						if (!run.finalTime) return;
						return (
							<div hidden={run.event.shortname !== allRunEvents[eventTab]}>
								<RunCompleted key={run.id} run={run} />
							</div>
						);
					})}
				</div>
			</div>
			<Footer />
		</ThemeProvider>
	);
}

export async function getServerSideProps({ params }) {
	const ssrCache = ssrExchange({ isClient: false });
	const client = initUrqlClient(
		{
			url: 'http://localhost:8000/api/graphql',
			exchanges: [dedupExchange, cacheExchange, ssrCache, fetchExchange],
		},
		false
	);

	await client.query(USER_QUERY, params).toPromise();

	return {
		props: {
			urqlState: ssrCache.extractData(),
			username: params.username,
		},
	};
}
