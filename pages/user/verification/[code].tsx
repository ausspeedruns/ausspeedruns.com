import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from 'urql';
import { gql } from '@keystone-6/core';

import { theme } from '../../../components/mui-theme';
import Navbar from '../../../components/Navbar/Navbar';
import { Button, ThemeProvider } from '@mui/material';
import styles from '../../../styles/User.Verification.code.module.scss';

export default function Verification() {
	const router = useRouter();

	const [verificationResults, requery] = useQuery({
		query: gql`
			query Verify($code: String) {
				verification(where: { code: $code }) {
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
			router.push('/user/edit-user');
		}
	}, [verificationResults]);

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
