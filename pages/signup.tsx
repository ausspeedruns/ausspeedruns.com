import { useState } from 'react';
import { gql, useMutation } from 'urql';
import Head from 'next/head';
import Link from 'next/link';
import { Button, Checkbox, FormControlLabel, TextField, ThemeProvider, Tooltip } from '@mui/material';

import Navbar from '../components/Navbar/Navbar';
// import Footer from '../components/Footer/Footer';
import styles from '../styles/SignIn.module.scss';
import { theme } from '../components/mui-theme';

export default function SignUpPage() {
	const [{ error, data }, signup] = useMutation(gql`
		mutation ($username: String!, $name: String!, $email: String!, $password: String!, $over18: Boolean!) {
			createUser(data: { username: $username, name: $name, email: $email, password: $password, isOver18: $over18 }) {
				__typename
				id
			}
			authenticateUserWithPassword(email: $email, password: $password) {
				__typename
			}
		}
	`);

	const [username, setUsername] = useState('');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [over18, setOver18] = useState(false);

	const canSignUp = !Boolean(username) || !Boolean(name) || !Boolean(email) || !Boolean(password);

	return (
		<ThemeProvider theme={theme}>
			<div className="App">
				<Head>
					<title>Sing Up - AusSpeedruns</title>
				</Head>
				<header className="App-header">
					<Navbar />
				</header>
				<div className={`content ${styles.form}`}>
					<h1>Join</h1>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							signup({ username, name, email, password, over18 }).then((result) => {
								if (result.data?.createUser) {
									// FIXME: there's a cache issue with Urql where it's not reloading the
									// current user properly if we do a client-side redirect here.
									// router.push('/');
									top.location.href = '/profile';
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
							value={name}
							onChange={(e) => {
								setName(e.target.value);
							}}
							variant="outlined"
							label="Name"
						/>
						<Tooltip placement="top" arrow title="For events we may need to give different tickets if under 18">
							<FormControlLabel
								control={<Checkbox onChange={(e) => setOver18(e.target.checked)} checked={over18} />}
								label="Are you over 18 years of age?"
							/>
						</Tooltip>
						<Button type="submit" variant="contained" disabled={canSignUp}>
							Sign Up
						</Button>
					</form>
					<hr className="my-4" />
					<div>
						<Link href="/signin">Already have an account? Sign in</Link>
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
}
