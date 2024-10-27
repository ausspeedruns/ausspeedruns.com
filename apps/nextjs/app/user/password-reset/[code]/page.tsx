"use client";

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Button, TextField, ThemeProvider } from '@mui/material';
import { gql, useMutation } from 'urql';

import { useAuth } from '../../../../components/auth';
import styles from '../../../styles/User.PasswordReset.code.module.scss';
import theme from '../../../../mui-theme';

export default function PasswordResetPage() {
	const auth = useAuth();
	const router = useRouter();
	const [password, setPassword] = useState('');
	const [passwordConfirm, setPasswordConfirm] = useState('');
	const [passwordsMatch, setPasswordsMatch] = useState(true);

	// Mutation for game submission
	const [_, resetPassword] = useMutation(gql`
		mutation ($email: String!, $token: String!, $password: String!) {
			redeemUserPasswordResetToken(email: $email, token: $token, password: $password) {
				code
				message
			}
		}
	`);

	function checkPasswordsMatch() {
		setPasswordsMatch(password === passwordConfirm);
	}

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>Password Reset - AusSpeedruns</title>
			</Head>
			<main className={styles.content}>
				<h1>Password Reset</h1>
				<form
					className={styles.form}
					onSubmit={(e) => {
						e.preventDefault();
						// console.log({
						// 	email: router.query.email,
						// 	password,
						// 	token: router.query.code,
						// });
						resetPassword({
							email: router.query.email,
							password,
							token: router.query.code,
						}).then((result) => {
							// console.log('Reset result', result)
							if (!result.error && !['TOKEN_REDEEMED', 'TOKEN_EXPIRED', 'FAILURE'].includes(result.data.code)) {
								if (auth.ready) {
									auth.signIn({ email: router.query.email as string, password }).then(signInResult => {
										// console.log('Sign in result', signInResult)
										if (top) {
											signInResult.success ? top.location.href = '/' : router.push('/signin');
										}
									});
								} else {
									router.push('/signin')
								}
							} else {
								console.error(result.error);
								console.error(result.data);
							}
						});
					}}
				>
					<TextField
						value={password}
						type="password"
						onChange={(e) => setPassword(e.target.value)}
						label="Password"
						required
					/>
					<TextField
						value={passwordConfirm}
						type="password"
						onChange={(e) => setPasswordConfirm(e.target.value)}
						onBlur={() => checkPasswordsMatch()}
						label="Confirm Password"
						required
						error={!passwordsMatch}
					/>
					<Button variant="contained" type="submit">
						Submit
					</Button>
				</form>
			</main>
		</ThemeProvider>
	);
}
