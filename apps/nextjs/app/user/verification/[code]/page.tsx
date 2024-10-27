"use client";

import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation, useQuery, gql } from 'urql';

import styles from '../../../styles/User.Verification.code.module.scss';
import { useAuth } from '../../../../components/auth';

export default function Verification() {
	const router = useRouter();
	const auth = useAuth();

	const [verificationResults] = useQuery({
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
		pause: !router.query.code
	});

	const [, deleteVerification] = useMutation(gql`
		mutation ($code: String) {
			deleteVerification(where: { code: $code }) {
				__typename
			}
		}
	`);

	useEffect(() => {
		console.log(verificationResults)
		if (!verificationResults.fetching && verificationResults.data?.accountVerification) {
			deleteVerification({ code: router.query.code });
			if (auth.ready && auth.sessionData) {
				router.push('/');
			} else {
				router.push('/signin');
			}
		}
	}, [verificationResults, router, deleteVerification, auth]);

	return (
		<div className={styles.content}>
			<h2>Email verification</h2>
			{verificationResults.fetching && <span>Loading</span>}
			{!verificationResults.fetching && !verificationResults.data?.verification && (
				<span>Expired/Incorrect verification code</span>
			)}
		</div>
		// <ThemeProvider theme={theme}>
		// 	<Head>
		// 		<title>Email Verification - AusSpeedruns</title>
		// 	</Head>
		// </ThemeProvider>
	);
}
