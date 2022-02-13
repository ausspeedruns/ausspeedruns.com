import React, { useEffect, useState } from 'react';
import { gql, useQuery } from 'urql';
import Head from 'next/head';
import { IconButton, ThemeProvider } from '@mui/material';
import { useRouter } from 'next/router';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from '../../styles/User.username.module.scss';
import NavBar from '../../components/Navbar/Navbar';
import { useAuth } from '../../components/auth';
import { theme } from '../../components/mui-theme';
import { RoleBadge } from '../../components/RoleBadge/RoleBadge';
import SubmissionAccordian from '../../components/SubmissionAccordian/SubmissionAccordian';
import RunUpcoming from '../../components/RunUpcoming/RunUpcoming';
import RunCompleted from '../../components/RunCompleted/RunCompleted';

type User = {
	id: string;
	username: string;
	pronouns?: string;
	state?: string;
	socials: {
		discord?: string;
		twitter?: string;
		twitch?: string;
	};
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
			logo: {
				url: string;
			};
		};
	}[];
	submissions: {
		id: string;
		game: string;
		category: string;
		platform: string;
		estimate: string;
		status: string;
		donationIncentive?: string;
		race?: string;
		racer?: string;
		coop?: boolean;
		video: string;
		ageRating?: string;
		event: {
			name: string;
		};
		runner: {
			username: string;
		};
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

	// User inputs
	const [userData, setUserData] = useState<User>(null);
	const [loading, setLoading] = useState(false);
	const [queryResult, profileQuery] = useQuery({
		query: gql`
			query Profile($username: String) {
				user(where: { username: $username }) {
					id
					username
					pronouns
					state
					socials {
						discord
						twitter
					}
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
							logo {
								url
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
						donationIncentive
						status
						race
						racer
						coop
						video
						event {
							name
						}
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
				<div className="app">
					<Head>
						<title>{router.query.username} - AusSpeedruns</title>
					</Head>
					<NavBar />
					<div className={`content ${styles.content}`}>
						<h2>Loading</h2>
					</div>
				</div>
			</ThemeProvider>
		);
	}

	if (!userData) {
		return (
			<ThemeProvider theme={theme}>
				<div className="app">
					<Head>
						<title>{router.query.username} - AusSpeedruns</title>
					</Head>
					<NavBar />
					<div className={`content ${styles.content}`}>
						<h2>Could not find {router.query.username}</h2>
					</div>
				</div>
			</ThemeProvider>
		);
	}

	const upcomingRunsList = userData.runs.filter((run) => !run.finalTime);

	return (
		<ThemeProvider theme={theme}>
			<div className="app">
				<Head>
					<title>{router.query.username} - AusSpeedruns</title>
				</Head>
				<NavBar />
				<div className={`content ${styles.content}`}>
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
						{userData.state && (
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
							<h3>Submissions</h3>
							{userData.submissions.map((submission) => {
								return <SubmissionAccordian key={submission.id} submission={submission} />;
							})}
						</div>
					)}

					{/* Upcoming Runs */}
					{upcomingRunsList.length > 0 && (
						<div className={styles.upcomingRuns}>
							<h3>Upcoming Runs</h3>
							{upcomingRunsList.map((run) => {
								return <RunUpcoming run={run} />;
							})}
						</div>
					)}
					<hr />
					{/* Runs */}
					<div className={styles.runs}>
						{userData.runs.map((run) => {
							if (!run.finalTime) return;
							return <RunCompleted run={run} />;
						})}
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
}
