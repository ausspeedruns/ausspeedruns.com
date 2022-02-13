import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from 'urql';
import Head from 'next/head';
import { Button, CircularProgress, IconButton, TextField, ThemeProvider } from '@mui/material';
import { useRouter } from 'next/router';
import { GetStaticPathsResult, GetStaticPropsContext } from 'next';
import { query } from '.keystone/api';

import styles from '../../styles/User.username.module.scss';
import NavBar from '../../components/Navbar/Navbar';
import { useAuth } from '../../components/auth';
import { theme } from '../../components/mui-theme';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RoleBadge } from '../../components/RoleBadge/RoleBadge';
import YouTubeVideoEmbed from '../../components/YouTubeVideoEmbed/YouTubeVideoEmbed';

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
		finalTime: string;
		platform: string;
		twitchVOD?: string;
		youtubeVOD?: string;
		event: {
			name: string;
			logo: {
				url: string;
			};
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
						event {
							name
							logo {
								url
							}
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
		if (!queryResult.fetching && queryResult.data?.user) {
			setLoading(false);
			setUserData(queryResult.data.user);
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
						<h2>Could not find user</h2>
					</div>
				</div>
			</ThemeProvider>
		);
	}

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

					<div className={styles.runs}>
						{userData.runs.map((run) => {
							console.log(run);
							const timeAsDate = new Date(run.finalTime);
							return (
								<div className={styles.run}>
									<div key={run.id} className={styles.header}>
										<img src={run.event.logo.url} title={run.event.name} />
										<div className={styles.runInfo}>
											<span>
												<b>{run.game}</b> - {run.category}
											</span>
											<span>
												{timeAsDate.getHours()}:{timeAsDate.getMinutes()}:{timeAsDate.getSeconds()}.
												{timeAsDate.getMilliseconds()}
											</span>
										</div>
									</div>
									{run.youtubeVOD ? <YouTubeVideoEmbed videoID={run.youtubeVOD.split('=')[1]} /> : <p>YouTube VOD to be uploaded soon!</p>}
									{run.twitchVOD && <a href={run.twitchVOD} target="_blank">Twitch VOD</a>}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
}
