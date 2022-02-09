import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from 'urql';
import Head from 'next/head';
import { Button, CircularProgress, IconButton, TextField, ThemeProvider, Input } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';

import styles from '../styles/Profile.module.scss';
import NavBar from '../components/Navbar/Navbar';
import { useAuth } from '../components/auth';
import { theme } from '../components/mui-theme';
import Link from 'next/link';

const DiscordRegex = /^.{3,32}#[0-9]{4}$/;
const TwitterRegex = /^@(\w){1,15}$/;

export default function ProfilePage() {
	const auth = useAuth();
	const [profileEditing, setProfileEditing] = useState(false);
	const [discordWarning, setDiscordWarning] = useState(false);
	const [twitterWarning, setTwitterWarning] = useState(false);

	// User inputs
	const [username, setUsername] = useState('');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [pronouns, setPronouns] = useState('');
	const [socialId, setSocialId] = useState('');
	const [discord, setDiscord] = useState('');
	const [twitter, setTwitter] = useState('');
	const [dateOfBirth, setDateOfBirth] = useState('');

	const [queryResult, profileQuery] = useQuery({
		query: gql`
			query Profile($userId: ID!) {
				user(where: { id: $userId }) {
					name
					username
					email
					dateOfBirth
					pronouns
					socials {
						id
						discord
						twitter
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
			$dateOfBirth: DateTime!
		) {
			updateUser(
				where: { id: $userId }
				data: { name: $name, username: $username, email: $email, pronouns: $pronouns, dateOfBirth: $dateOfBirth }
			) {
				__typename
			}

			updateSocial(where: { id: $socialId }, data: { discord: $discord, twitter: $twitter }) {
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
			setSocialId(queryResult.data.user.socials.id);
			setDiscord(queryResult.data.user.socials.discord);
			setTwitter(queryResult.data.user.socials.twitter);
			setDateOfBirth(queryResult.data.user.dateOfBirth);
		}
	}, [queryResult]);

	const textfieldVariant = profileEditing ? 'standard' : 'standard';
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
			}).then((res) => {
				if (!res.error) {
					setProfileEditing(false);
				} else {
					console.error(res.error);
				}
			});
		}
	}

	return (
		<ThemeProvider theme={theme}>
			<div className="app">
				<Head>
					<title>Profile - AusSpeedruns</title>
				</Head>
				<NavBar />
				<div className={`content ${styles.content}`}>
					<h1>Profile</h1>
					{(queryResult.fetching || queryResult.data?.user === null) && <CircularProgress />}
					{queryResult.error && <h2>{queryResult.error.message}</h2>}
					{updateResult.error && <h2>{updateResult.error.message}</h2>}
					{queryResult.data?.user && (
						<>
							<a className={styles.submitGameLink} href="/submit-game">
								Submit game to ASM2022
							</a>
							<div className={styles.profileInformation}>
								<h2>Information</h2>
								<div>
									<IconButton style={{ float: 'right' }} onClick={() => setProfileEditing(!profileEditing)}>
										<FontAwesomeIcon icon={faEdit} />
									</IconButton>
								</div>
								<div>Username</div>
								<TextField
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									disabled={!profileEditing}
									variant={textfieldVariant}
								/>
								<div>Name</div>
								<TextField
									value={name}
									onChange={(e) => setName(e.target.value)}
									disabled={!profileEditing}
									variant={textfieldVariant}
								/>
								<div>Email</div>
								<TextField
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={!profileEditing}
									variant={textfieldVariant}
								/>
								<div>Pronouns</div>
								<TextField
									value={pronouns}
									onChange={(e) => setPronouns(e.target.value)}
									disabled={!profileEditing}
									variant={textfieldVariant}
								/>
								<div>Discord</div>
								<TextField
									error={discordWarning}
									helperText="e.g. Clubwho#1337"
									label={discordWarning ? 'Error' : undefined}
									value={discord}
									disabled={!profileEditing}
									variant={textfieldVariant}
									onChange={(e) => setDiscord(e.target.value)}
									onBlur={(e) => setDiscordWarning(!DiscordRegex.test(e.target.value))}
								/>
								<div>Twitter</div>
								<TextField
									error={twitterWarning}
									helperText="e.g. @Clubwhom"
									label={twitterWarning ? 'Error' : undefined}
									value={twitter}
									disabled={!profileEditing}
									variant={textfieldVariant}
									onChange={(e) => setTwitter(e.target.value)}
									onBlur={(e) => setTwitterWarning(!TwitterRegex.test(e.target.value))}
								/>
								<div>Date of birth</div>
								<div style={{ display: 'flex', justifyContent: 'center' }}>
									<Input
										fullWidth
										type="date"
										disabled={!profileEditing}
										onChange={(e) => setDateOfBirth(e.target.value)}
										value={new Date(dateOfBirth).toLocaleDateString().split('/').reverse().join('-')}
									/>
								</div>
							</div>
						</>
					)}
					{profileEditing && (
						<Button variant="contained" disabled={disableSave} onClick={UpdateProfileButton}>
							Save
						</Button>
					)}
				</div>
			</div>
		</ThemeProvider>
	);
}
