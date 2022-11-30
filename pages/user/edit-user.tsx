import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from 'urql';
import Head from 'next/head';
import {
	Button,
	CircularProgress,
	TextField,
	ThemeProvider,
	Input,
	Select,
	MenuItem,
	Alert,
	Snackbar,
} from '@mui/material';

import styles from '../../styles/User.EditUser.module.scss';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../components/auth';
import { theme } from '../../components/mui-theme';
import DiscordEmbed from '../../components/DiscordEmbed';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { DatePicker, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import enLocale from 'date-fns/locale/en-AU';
import sub from 'date-fns/sub';

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
	const [discord, setDiscord] = useState('');
	const [twitter, setTwitter] = useState('');
	const [twitch, setTwitch] = useState('');
	const [dateOfBirth, setDateOfBirth] = useState<Date>(undefined);
	const [verified, setVerified] = useState(false);

	const [sendVerificationSnack, setSendVerificationSnack] = useState(false);
	const [sendVerificationSnackError, setSendVerificationSnackError] = useState(false);

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
					discord
					twitter
					twitch
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
			$name: String!
			$email: String!
			$pronouns: String!
			$discord: String!
			$twitter: String!
			$twitch: String!
			$dateOfBirth: DateTime!
			$state: UserStateType!
		) {
			updateUser(
				where: { id: $userId }
				data: {
					name: $name
					email: $email
					pronouns: $pronouns
					dateOfBirth: $dateOfBirth
					state: $state
					discord: $discord
					twitter: $twitter
					twitch: $twitch
				}
			) {
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
		// console.log(updateVerificationTimeResult)
		if (updateVerificationTimeResult.error) {
			if (updateVerificationTimeResult.error.message === `[GraphQL] You provided invalid data for this operation.\n  - User.sentVerification: Sending new verification too soon.`) {
				setSendVerificationSnack(true);
				setSendVerificationSnackError(true);
				// console.log('Setting true')
			}
		}

		if (updateVerificationTimeResult.data?.__typename === 'Verification') {
			setSendVerificationSnack(true);
			setSendVerificationSnackError(false);
		}
	}, [updateVerificationTimeResult]);

	useEffect(() => {
		if (!queryResult.fetching && queryResult.data?.user) {
			setUsername(queryResult.data.user.username);
			setName(queryResult.data.user.name);
			setEmail(queryResult.data.user.email);
			setPronouns(queryResult.data.user.pronouns);
			setState(queryResult.data.user.state);
			setDiscord(queryResult.data.user.discord);
			setTwitter(queryResult.data.user.twitter);
			setDateOfBirth(queryResult.data.user.dateOfBirth);
			setTwitch(queryResult.data.user.twitch);
			setVerified(queryResult.data.user.verified);
		}
	}, [queryResult]);

	const disableSave =
		!Boolean(email) ||
		(twitter !== '' && !TwitterRegex.test(twitter)) ||
		(discord !== '' && !DiscordRegex.test(discord));

	function UpdateProfileButton() {
		if (auth.ready) {
			updateProfile({
				userId: auth.sessionData.id,
				name,
				email,
				pronouns,
				discord,
				twitter,
				dateOfBirth: new Date(dateOfBirth).toISOString(),
				twitch,
				state: state ?? 'none',
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

	const maxDate = sub(new Date(), { years: 13 });

	return (
        <ThemeProvider theme={theme}>
			<Head>
				<title>Edit User - AusSpeedruns</title>
				<DiscordEmbed title={`Edit User - AusSpeedruns`} pageUrl="/user/edit-user" />
			</Head>
			<Navbar />
			<div className={styles.content}>
				<h1>{username}</h1>
				<Link href={`/user/${username}`} passHref className={styles.return}>
                    <FontAwesomeIcon icon={faChevronLeft} /> Return
                </Link>
				{(queryResult.fetching || queryResult.data?.user === null) && <CircularProgress />}
				{queryResult.error && <h2>{queryResult.error.message}</h2>}
				{updateResult.error && <h2>{updateResult.error.message}</h2>}
				{updateResult.data && <h2>Profile updated!</h2>}
				{queryResult.data?.user && (
					<div className={styles.profileInformation}>
						{!verified && (
							<>
								<div>Email not verified!</div>
								<Button variant="contained" onClick={sendVerification}>
									Send verification
								</Button>
							</>
						)}
						<h3>Personal Information</h3>
						<div />
						{/* <div>Username</div>
							<TextField required value={username} onChange={(e) => setUsername(e.target.value)} variant={'outlined'} /> */}
						<div>Name</div>
						<TextField
							value={name}
							onChange={(e) => setName(e.target.value)}
							variant={'outlined'}
							autoComplete="name"
							inputProps={{ maxLength: 100 }}
						/>
						<div>Email{verified ? ' ✓' : ''}</div>
						<TextField
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							variant={'outlined'}
							autoComplete="email"
						/>
						<div>Pronouns</div>
						<TextField
							value={pronouns}
							onChange={(e) => setPronouns(e.target.value)}
							variant={'outlined'}
							autoComplete="pronouns"
							inputProps={{ maxLength: 100 }}
						/>
						<div>Date of birth</div>
						<LocalizationProvider dateAdapter={AdapterDateFns} locale={enLocale}>
							<DatePicker
								value={dateOfBirth}
								onChange={(newValue) => {
									setDateOfBirth(newValue);
								}}
								openTo={'year'}
								maxDate={maxDate}
								renderInput={(params) => <TextField {...params} />}
								views={['year', 'month', 'day']}
							/>
						</LocalizationProvider>
						<div>State</div>
						<Select value={state ?? 'none'} onChange={(e) => setState(e.target.value)}>
							<MenuItem value="none">
								<i>No state</i>
							</MenuItem>
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
						<Link href="/reset-password">Reset password</Link>
						<div />
						<h3>Socials</h3>
						<div />
						<div>Discord</div>
						<TextField
							error={discordWarning}
							helperText="e.g. AusSpeedruns#1337"
							label={discordWarning ? 'Error' : undefined}
							value={discord}
							variant={'outlined'}
							onChange={(e) => setDiscord(e.target.value)}
							onBlur={(e) => setDiscordWarning(!DiscordRegex.test(e.target.value) && e.target.value !== '')}
							autoComplete="discord"
						/>
						<div>Twitter</div>
						<TextField
							error={twitterWarning}
							helperText="e.g. @AusSpeedruns"
							label={twitterWarning ? 'Error' : undefined}
							value={twitter}
							variant={'outlined'}
							onChange={(e) => setTwitter(e.target.value)}
							onBlur={(e) => setTwitterWarning(!TwitterRegex.test(e.target.value) && e.target.value !== '')}
							autoComplete="twitter"
						/>
						<div>Twitch</div>
						<TextField
							error={twitchWarning}
							label={twitchWarning ? 'Error' : undefined}
							value={twitch}
							variant={'outlined'}
							onChange={(e) => setTwitch(e.target.value)}
							onBlur={(e) => setTwitchWarning(!TwitchRegex.test(e.target.value) && e.target.value !== '')}
							helperText="e.g. AusSpeedruns"
							autoComplete="twitch"
						/>
					</div>
				)}
				<Button variant="contained" disabled={disableSave} onClick={UpdateProfileButton}>
					Save
				</Button>
			</div>
			<Snackbar open={sendVerificationSnack} autoHideDuration={10000} onClose={() => setSendVerificationSnack(false)}>
				{sendVerificationSnackError ? (
					<Alert onClose={() => setSendVerificationSnack(false)} variant="filled" severity="error">
						Must wait 15 mins before sending another verification.
					</Alert>
				) : (
					<Alert onClose={() => setSendVerificationSnack(false)} variant="filled" severity="success">
						Verification email sent!
					</Alert>
				)}
			</Snackbar>
		</ThemeProvider>
    );
}
