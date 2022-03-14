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

function calculateAge(birthday: number) {
	var ageDifMs = Date.now() - birthday;
	var ageDate = new Date(ageDifMs); // miliseconds from epoch
	return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export default function SignUpPage() {
	const [{ error, data }, signup] = useMutation(gql`
		mutation ($username: String!, $email: String!, $password: String!) {
			createUser(data: { username: $username, email: $email, password: $password }) {
				__typename
				id
			}
			authenticateUserWithPassword(email: $email, password: $password) {
				__typename
			}
		}
	`);

	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [dob, setDob] = useState(new Date().toLocaleDateString().split('/').reverse().join('-'));

	const canSignUp =
		!Boolean(username) ||
		!Boolean(email) ||
		password.length < 8 ||
		calculateAge(new Date(dob).getTime()) < 13;

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
						signup({ username, email, password }).then((result) => {
							if (result.data?.createUser) {
								// FIXME: there's a cache issue with Urql where it's not reloading the
								// current user properly if we do a client-side redirect here.
								// router.push('/');
								top.location.href = '/user/edit-user';
							}
						});
					}}
				>
					{error && <div>{error.toString()}</div>}
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
					<TextField
						value={dob}
						onChange={(e) => {
							setDob(e.target.value);
						}}
						variant="outlined"
						label="Date of Birth"
						type="date"
					/>
					<Button type="submit" variant="contained" disabled={canSignUp}>
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
