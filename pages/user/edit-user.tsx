import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from 'urql';
import Head from 'next/head';
import { Button, CircularProgress, TextField, ThemeProvider, Input, Select, MenuItem } from '@mui/material';

import styles from '../../styles/User.EditUser.module.scss';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../components/auth';
import { theme } from '../../components/mui-theme';
import DiscordEmbed from '../../components/DiscordEmbed';

const DiscordRegex = /^.{3,32}#[0-9]{4}$/;
const TwitterRegex = /^@(\w){1,15}$/;
const TwitchRegex = /^[a-zA-Z0-9][\w]{2,24}$/;

export default function EditUser() {
	const auth = useAuth();
	// const [profileEditing, setProfileEditing] = useState(false);
	const [discordWarning, setDiscordWarning] = useState(false);
	const [twitterWarning, setTwitterWarning] = useState(false);
	const [twitchWarning, setTwitchWarning] = useState(false);

	// User inputs
	const [username, setUsername] = useState('');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [state, setState] = useState('');
	const [pronouns, setPronouns] = useState('');
	const [socialId, setSocialId] = useState('');
	const [discord, setDiscord] = useState('');
	const [twitter, setTwitter] = useState('');
	const [twitch, setTwitch] = useState('');
	const [dateOfBirth, setDateOfBirth] = useState('');
	const [verified, setVerified] = useState(false);

	const [queryResult, profileQuery] = useQuery({
		query: gql`
			query Profile($userId: ID!) {
				user(where: { id: $userId }) {
					name
					username
					email
					dateOfBirth
					pronouns
					state
					verified
					socials {
						id
						discord
						twitter
						twitch
					}
				}
			}
		`,
		variables: {
			userId: auth.ready ? auth.sessionData?.id ?? '' : '',
		},
	});

	const [updateResult, updateProfile] = useMutation(gql`
		mutation UpdateProfile(
			$userId: ID
			$username: String
			$name: String!
			$email: String
			$pronouns: String!
			$socialId: ID
			$discord: String!
			$twitter: String!
			$twitch: String!
			$dateOfBirth: DateTime!
		) {
			updateUser(
				where: { id: $userId }
				data: { name: $name, username: $username, email: $email, pronouns: $pronouns, dateOfBirth: $dateOfBirth }
			) {
				__typename
			}

			updateSocial(where: { id: $socialId }, data: { discord: $discord, twitter: $twitter, twitch: $twitch }) {
				__typename
			}
		}
	`);

	const [updateVerificationTimeResult, updateVerificationTime] = useMutation(gql`
		mutation UpdateVerificationTime($userId: ID, $time: DateTime) {
			updateUser(where: { id: $userId }, data: { sentVerification: $time }) {
				__typename
			}
		}
	`);

	useEffect(() => {
		if (!queryResult.fetching && queryResult.data?.user) {
			setUsername(queryResult.data.user.username);
			setName(queryResult.data.user.name);
			setEmail(queryResult.data.user.email);
			setPronouns(queryResult.data.user.pronouns);
			setState(queryResult.data.user.state);
			setSocialId(queryResult.data.user.socials.id);
			setDiscord(queryResult.data.user.socials.discord);
			setTwitter(queryResult.data.user.socials.twitter);
			setDateOfBirth(queryResult.data.user.dateOfBirth);
			setTwitch(queryResult.data.user.socials.twitch);
			setVerified(queryResult.data.user.verified);
		}
	}, [queryResult]);

	const disableSave =
		!Boolean(username) ||
		!Boolean(email) ||
		(twitter !== '' && !TwitterRegex.test(twitter)) ||
		(discord !== '' && !DiscordRegex.test(discord));

	function UpdateProfileButton() {
		if (auth.ready) {
			updateProfile({
				userId: auth.sessionData.id,
				username,
				name,
				email,
				pronouns,
				discord,
				twitter,
				socialId,
				dateOfBirth: new Date(dateOfBirth).toISOString(),
				twitch,
			}).then((res) => {
				if (!res.error) {
					// setProfileEditing(false);
				} else {
					console.error(res.error);
				}
			});
		}
	}

	function sendVerification() {
		if (auth.ready) {
			const curTime = new Date().toISOString();
			updateVerificationTime({
				userId: auth.sessionData.id,
				time: curTime,
			});
		}
	}

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>Edit User - AusSpeedruns</title>
				<DiscordEmbed title={`Edit User - AusSpeedruns`} pageUrl="/user/edit-user" />
			</Head>
			<Navbar />
			<div className={styles.content}>
				<h1>{username}</h1>
				{(queryResult.fetching || queryResult.data?.user === null) && <CircularProgress />}
				{queryResult.error && <h2>{queryResult.error.message}</h2>}
				{updateResult.error && <h2>{updateResult.error.message}</h2>}
				{updateResult.data && <h2>Profile updated!</h2>}
				{queryResult.data?.user && (
					<>
						<div className={styles.profileInformation}>
							{!verified && (
								<>
									<div>Email not verified!</div>
									<Button variant="contained" onClick={sendVerification}>Send verification</Button>
								</>
							)}
							<h3>Personal Information</h3>
							<div />
							<div>Username</div>
							<TextField required value={username} onChange={(e) => setUsername(e.target.value)} variant={'outlined'} />
							<div>Name</div>
							<TextField required value={name} onChange={(e) => setName(e.target.value)} variant={'outlined'} />
							<div>Email</div>
							<TextField required value={email} onChange={(e) => setEmail(e.target.value)} variant={'outlined'} />
							<div>Pronouns</div>
							<TextField value={pronouns} onChange={(e) => setPronouns(e.target.value)} variant={'outlined'} />
							<div>Date of birth</div>
							<div style={{ display: 'flex', justifyContent: 'center' }}>
								<Input
									required
									fullWidth
									type="date"
									onChange={(e) => setDateOfBirth(e.target.value)}
									value={new Date(dateOfBirth).toLocaleDateString().split('/').reverse().join('-')}
								/>
							</div>
							<div>State</div>
							<Select value={state} onChange={(e) => setState(e.target.value)}>
								<MenuItem value="vic">Victoria</MenuItem>
								<MenuItem value="nsw">New South Wales</MenuItem>
								<MenuItem value="qld">Queensland</MenuItem>
								<MenuItem value="sa">South Australia</MenuItem>
								<MenuItem value="nt">Northern Territory</MenuItem>
								<MenuItem value="act">ACT</MenuItem>
								<MenuItem value="tas">Tasmania</MenuItem>
								<MenuItem value="wa">Western Australia</MenuItem>
								<MenuItem value="outer">Outside of Australia</MenuItem>
							</Select>

							<h3>Socials</h3>
							<div />
							<div>Discord</div>
							<TextField
								error={discordWarning}
								helperText="e.g. Clubwho#1337"
								label={discordWarning ? 'Error' : undefined}
								value={discord}
								variant={'outlined'}
								onChange={(e) => setDiscord(e.target.value)}
								onBlur={(e) => setDiscordWarning(!DiscordRegex.test(e.target.value))}
							/>
							<div>Twitter</div>
							<TextField
								error={twitterWarning}
								helperText="e.g. @Clubwhom"
								label={twitterWarning ? 'Error' : undefined}
								value={twitter}
								variant={'outlined'}
								onChange={(e) => setTwitter(e.target.value)}
								onBlur={(e) => setTwitterWarning(!TwitterRegex.test(e.target.value))}
							/>
							<div>Twitch</div>
							<TextField
								error={twitchWarning}
								label={twitchWarning ? 'Error' : undefined}
								value={twitch}
								variant={'outlined'}
								onChange={(e) => setTwitch(e.target.value)}
								onBlur={(e) => setTwitchWarning(!TwitchRegex.test(e.target.value))}
							/>
						</div>
					</>
				)}
				<Button variant="contained" disabled={disableSave} onClick={UpdateProfileButton}>
					Save
				</Button>
			</div>
		</ThemeProvider>
	);
}
