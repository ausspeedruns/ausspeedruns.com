import { useEffect, useState } from 'react';
import { gql, useMutation } from 'urql';
import Head from 'next/head';
import Link from 'next/link';
import { Button, Checkbox, FormControlLabel, TextField, ThemeProvider, Tooltip } from '@mui/material';

import Navbar from '../components/Navbar/Navbar';
// import Footer from '../components/Footer/Footer';
import styles from '../styles/SignIn.module.scss';
import { theme } from '../components/mui-theme';
import DiscordEmbed from '../components/DiscordEmbed';
import { LocalizationProvider, DatePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import sub from 'date-fns/sub';
import enLocale from 'date-fns/locale/en-AU';

function HumanErrorMsg(error: string) {
	switch (error) {
		case '[GraphQL] Prisma error: Unique constraint failed on the fields: (`email`)':
			return 'Error: Email already in use';
		case '[GraphQL] Prisma error: Unique constraint failed on the fields: (`username`)':
			return 'Error: Username already in use';

		default:
			return error;
	}
}

export default function SignUpPage() {
	const [{ error, data }, signup] = useMutation(gql`
		mutation ($username: String!, $email: String!, $password: String!, $dob: DateTime!) {
			createUser(data: { username: $username, email: $email, password: $password, dateOfBirth: $dob }) {
				__typename
				id
			}
			authenticateUserWithPassword(email: $email, password: $password) {
				__typename
			}
		}
	`);

	const maxDate = sub(new Date(), { years: 13 });
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [dob, setDob] = useState(maxDate);
	

	const cantSignUp = !Boolean(username) || !Boolean(email)|| !Boolean(dob) || password.length < 8 || maxDate < new Date(dob);

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>Sign Up - AusSpeedruns</title>
				<DiscordEmbed title="Sign Up - AusSpeedruns" description="Sign Up to AusSpeedruns" pageUrl="/signup" />
			</Head>
			<Navbar />
			<div className={`${styles.content} ${styles.form}`}>
				<h1>Join</h1>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						signup({ username, email, password, dob }).then((result) => {
							if (result.data?.createUser) {
								// FIXME: there's a cache issue with Urql where it's not reloading the
								// current user properly if we do a client-side redirect here.
								// router.push('/');
								top.location.href = '/user/edit-user';
							}
						});
					}}
				>
					{error && <div>{HumanErrorMsg(error.message)}</div>}
					<TextField
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
						}}
						variant="outlined"
						label="Email"
						type="email"
					/>
					<TextField
						value={password}
						onChange={(e) => {
							setPassword(e.target.value);
						}}
						variant="outlined"
						label="Password"
						type="password"
						helperText="Minimum 8 characters"
					/>
					<TextField
						value={username}
						onChange={(e) => {
							setUsername(e.target.value);
						}}
						variant="outlined"
						label="Username"
					/>
					<LocalizationProvider dateAdapter={AdapterDateFns} locale={enLocale}>
						<DatePicker
							value={dob}
							onChange={(newValue) => {
								setDob(newValue);
							}}
							openTo={'year'}
							maxDate={maxDate}
							renderInput={(params) => <TextField {...params} />}
							views={['year', 'month', 'day']}
							label="Date of Birth"
						/>
					</LocalizationProvider>
					<Button type="submit" variant="contained" disabled={cantSignUp}>
						Sign Up
					</Button>
				</form>
				<hr className="my-4" />
				<div>
					<Link href="/signin">Already have an account? Sign in</Link>
				</div>
			</div>
		</ThemeProvider>
	);
}
