import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from 'urql';
import { gql } from '@keystone-6/core';

import { theme } from '../../../components/mui-theme';
import Navbar from '../../../components/Navbar/Navbar';
import { Button, ThemeProvider } from '@mui/material';
import styles from '../../../styles/User.Verification.code.module.scss';

type Event = {
	name: string;
	shortname: string;
};

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

	console.log(verificationResults);

	const [deleteVerifResults, deleteVerification] = useMutation(gql`
		mutation ($code: String) {
			deleteVerification(where: { code: $code }) {
				__typename
			}
		}
	`);

	function returnHome() {
		deleteVerification({ code: router.query.code });
		router.push('/user/edit-user');
	}

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>Email Verification - AusSpeedruns</title>
			</Head>
			<Navbar />
			<div className={styles.content}>
				<h2>Email verification</h2>
				{!verificationResults.fetching && verificationResults.data.verification && (
					<Button variant="contained" onClick={returnHome}>Verify email</Button>
				)}
				{!verificationResults.fetching && !verificationResults.data?.verification && (
					<span>Expired/Incorrect verification code</span>
				)}
			</div>
		</ThemeProvider>
	);
}
