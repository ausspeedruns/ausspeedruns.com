import Link from 'next/link';
import React, { useState } from 'react';
import { useAuth } from '../components/auth';
import { TextField, ThemeProvider } from '@mui/material';
import styles from '../styles/SignIn.module.scss';

import Button from '../components/Button/Button';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import Head from 'next/head';
import { theme } from '../components/mui-theme';

export const SignInPage: React.FC = () => {
	const auth = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	// const router = useRouter();

	const signIn = async () => {
		if (!auth.ready) {
			setError('Auth is not ready, try again in a moment.');
			return;
		}
		if (!email.length || !password.length) {
			setError('Please enter a username and password.');
			return;
		}
		setError('');
		const result = await auth.signIn({ email, password });
		if (result.success) {
			// FIXME: there's a cache issue with Urql where it's not reloading the
			// current user properly if we do a client-side redirect here.
			// router.push('/');
			top.location.href = '/';
		} else if (result.success === false) {
			// This is silly ofc but TypeScript wasn't detecting that it was false
			setEmail('');
			setPassword('');
			setError(result.message);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<div className="App">
				<Head>
					<title>Sign In - AusSpeedruns</title>
				</Head>
				<Navbar />
				<div className={`content ${styles.form}`}>
					<h1>Sign In</h1>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							signIn();
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
						<h2>{error}</h2>
						<Button type="submit" actionText='Sign In' />
					</form>
					<hr />
					<div>
						<Link href="/signup">Want to join instead?</Link>
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
};

export default SignInPage;
