import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/auth';
import { TextField, ThemeProvider, CircularProgress, Button } from '@mui/material';
import styles from '../styles/SignIn.module.scss';

// import Button from '../components/Button/Button';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import Head from 'next/head';
import { theme } from '../components/mui-theme';
import DiscordEmbed from '../components/DiscordEmbed';

function HumanErrorMsg(error: string) {
	switch (error) {
		case 'Authentication failed.':
			return 'Incorrect Email or Password.';

		default:
			return '';
	}
}

export const SignInPage: React.FC = () => {
	const auth = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [spinner, setSpinner] = useState(false);

	// const router = useRouter();

	const signIn = async () => {
		if (!auth.ready) {
			setError('Auth is not ready, try again in a moment.');
			return;
		}
		if (!email.length || !password.length) {
			setError('Please enter an email and password.');
			return;
		}
		setError('');
		const result = await auth.signIn({ email: email.toLowerCase(), password });
		if (result.success) {
			// FIXME: there's a cache issue with Urql where it's not reloading the
			// current user properly if we do a client-side redirect here.
			// router.push('/');
			top.location.href = '/';
		} else if (result.success === false) {
			// This is silly ofc but TypeScript wasn't detecting that it was false
			// setEmail('');
			// setPassword('');
			setError(result.message);
		}
	};

	useEffect(() => {
		if (error) {
			setSpinner(false);
		}
	}, [error]);

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>Sign In - AusSpeedruns</title>
				<DiscordEmbed title="Sign In - AusSpeedruns" description="Sign In to AusSpeedruns" pageUrl="/signin" />
			</Head>
			<div className={styles.background} />
			<div className={`${styles.content} ${styles.form}`}>
				<h1>Sign In</h1>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						signIn();
						setSpinner(true);
					}}
				>
					<TextField
						label="Email"
						variant="outlined"
						value={email}
						onChange={(event) => {
							setEmail(event.target.value);
						}}
						fullWidth
					/>

					<TextField
						label="Password"
						type={'password'}
						variant="outlined"
						value={password}
						onChange={(event) => {
							setPassword(event.target.value);
						}}
						fullWidth
					/>
					<h3>{error}</h3>
					{error && <h4>{HumanErrorMsg(error)}</h4>}
					<Button type="submit" variant="contained">
						Sign In
					</Button>
					{/* <Button type="submit" actionText='Sign In' /> */}
					{spinner && <CircularProgress className={styles.spinner} />}
				</form>
				<hr />
				<Link className={styles.links} href="/signup">Want to join instead?</Link>
				<Link className={styles.links} href="/reset-password">Forgot password?</Link>
			</div>
		</ThemeProvider>
	);
};

export default SignInPage;
