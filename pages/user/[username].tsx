import React, { useEffect, useState } from 'react';
import { gql, useQuery } from 'urql';
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

export type UserPageData = {
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
		};
		runner: {
			username: string;
		};
		willingBackup: boolean;
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

export default function ProfilePage() {
	const router = useRouter();
	const auth = useAuth();

	const [submissionTab, setSubmissionTab] = useState(0);
	const [eventTab, setEventTab] = useState(0);

	// User inputs
	const [userData, setUserData] = useState<UserPageData>(null);
	const [loading, setLoading] = useState(false);
	const [queryResult, profileQuery] = useQuery({
		query: gql`
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
					submissions {
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
						}
						willingBackup
					}
					tickets(where: { OR: [{ method: { equals: bank } }, { paid: { equals: true } }] }) {
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
					shirts(where: { OR: [{ method: { equals: bank } }, { paid: { equals: true } }] }) {
						shirtID
						paid
						size
						colour
					}
				}
			}
		`,
		variables: {
			username: router.query.username,
		},
	});

	useEffect(() => {
		setLoading(true);
		if (!queryResult.fetching) {
			if (queryResult.data?.user) {
				setLoading(false);
				setUserData(queryResult.data.user);
			} else {
				setLoading(false);
			}
		}
	}, [queryResult]);

	if (loading) {
		return (
			<ThemeProvider theme={theme}>
				<Head>
					<title>{router.query.username} - AusSpeedruns</title>
				</Head>
				<Navbar />
				<div className={styles.content}>
					<h2>Loading</h2>
				</div>
			</ThemeProvider>
		);
	}

	if (!userData) {
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

	const upcomingRunsList = userData.runs.filter((run) => !run.finalTime);

	// Would just do [...new Set(****)] buuuuuuuut... https://stackoverflow.com/questions/33464504/using-spread-syntax-and-new-set-with-typescript
	const allSubmissionEvents = [
		...Array.from(new Set(userData.submissions.map((submission) => submission.event.shortname))),
	];
	const allRunEvents = [
		...Array.from(new Set(userData.runs.map((run) => (run.finalTime ? run.event.shortname : undefined)))),
	];

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>{router.query.username} - AusSpeedruns</title>
				<DiscordEmbed
					title={`${router.query.username}'s Profile - AusSpeedruns`}
					pageUrl={`/user/${router.query.username}`}
				/>
			</Head>
			<Navbar />
			<div className={styles.content}>
				<div className={styles.profileHeader}>
					<h1>{userData.username}</h1>
					{auth.ready && auth.sessionData?.id === userData.id && (
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
					{userData.roles.map((role) => {
						return <RoleBadge key={role.id} role={role} />;
					})}
				</div>
				{/* Profile Information */}
				<div className={styles.userInfo}>
					{userData?.state !== 'none' && (
						<>
							<span>State</span>
							<span>{StateCodeToString(userData.state)}</span>
						</>
					)}
					{userData.pronouns && (
						<>
							<span>Pronouns</span>
							<span>{userData.pronouns}</span>
						</>
					)}
				</div>
				{/* Submissions */}
				{userData.submissions.length > 0 && (
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
						{userData.submissions.map((submission) => {
							if (submission.event.shortname !== allSubmissionEvents[submissionTab]) return;
							return <SubmissionAccordian key={submission.id} submission={submission} event={submission.event} />;
						})}
					</div>
				)}

				{/* Tickets */}
				{userData.tickets.length > 0 && (
					<div className={styles.submissions}>
						<h3 id="tickets">Tickets (Private)</h3>
						{userData.tickets.map((ticket) => {
							return <Ticket key={ticket.ticketID} ticketData={ticket} />;
						})}
					</div>
				)}

				{/* Tickets */}
				{userData.tickets.length > 0 && (
					<div className={styles.submissions}>
						<h3 id="shirts">Shirt Orders (Private)</h3>
						{userData.shirts.map((shirt) => {
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
				{userData.runs.length > 0 && <hr />}
				{/* Runs */}
				<div className={styles.runs}>
					<Box>
						<Tabs value={eventTab} onChange={(_e, newVal) => setEventTab(newVal)} aria-label="basic tabs example">
							{allRunEvents.map((event) => (
								<Tab label={event} key={event} />
							))}
						</Tabs>
					</Box>
					{userData.runs.map((run) => {
						if (!run.finalTime || run.event.shortname !== allRunEvents[eventTab]) return;
						return <RunCompleted key={run.id} run={run} />;
					})}
				</div>
			</div>
		</ThemeProvider>
	);
}
