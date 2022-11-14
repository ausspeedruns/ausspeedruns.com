import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation, useQuery, gql } from 'urql';

import { theme } from '../../../components/mui-theme';
import Navbar from '../../../components/Navbar/Navbar';
import { ThemeProvider } from '@mui/material';
import styles from '../../../styles/User.Verification.code.module.scss';
import { useAuth } from '../../../components/auth';

export default function Verification() {
	const router = useRouter();
	const auth = useAuth();

	const [verificationResults, requery] = useQuery({
		query: gql`
			query Verify($code: String) {
				accountVerification(where: { code: $code }) {
					__typename
				}
			}
		`,
		variables: {
			code: router.query.code,
		},
	});

	const [deleteVerifResults, deleteVerification] = useMutation(gql`
		mutation ($code: String) {
			deleteVerification(where: { code: $code }) {
				__typename
			}
		}
	`);

	useEffect(() => {
		if (!verificationResults.fetching && verificationResults.data.verification) {
			deleteVerification({ code: router.query.code });
			if (auth.ready && auth.sessionData) {
				router.push('/');
			} else {
				router.push('/signin');
			}
		}
	}, [verificationResults, router, deleteVerification, auth]);

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>Email Verification - AusSpeedruns</title>
			</Head>
			<Navbar />
			<div className={styles.content}>
				<h2>Email verification</h2>
				{verificationResults.fetching && <span>Loading</span>}
				{!verificationResults.fetching && !verificationResults.data?.verification && (
					<span>Expired/Incorrect verification code</span>
				)}
			</div>
		</ThemeProvider>
	);
}
