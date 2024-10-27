"use client";
// import Head from "next/head";
import React, { useEffect, useState } from "react";
import { TextField, CircularProgress, Button } from "@mui/material";
import styles from "../../styles/SignIn.module.scss";

import { useMutation, gql } from '@urql/next';
// import { Metadata } from "next";

// export const metadata: Metadata = {
// 	title: "Reset Password",
// 	description: "Reset Password to AusSpeedruns",
// };

export default function ResetPasswordPage() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [spinner, setSpinner] = useState(false);
	const [done, setDone] = useState(false);

	const [resetResult, resetMutation] = useMutation(gql`
		mutation ($email: String!) {
			sendUserPasswordResetLink(email: $email)
		}
	`);

	const sendPasswordLink = async () => {
		if (!email.length) {
			setError("Please enter an email.");
			return;
		}
		// console.log(email);
		resetMutation({ email });
		setError("");
	};

	// console.log(resetResult);
	useEffect(() => {
		if (error) {
			setSpinner(false);
		}
	}, [error]);

	useEffect(() => {
		if (!resetResult.fetching && !resetResult.error && resetResult.data) {
			setSpinner(false);
			setDone(true);
		}
	}, [resetResult]);

	return (
		<div className={`${styles.content} ${styles.form}`}>
			<h1>Reset Password</h1>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					sendPasswordLink();
					setSpinner(true);
				}}>
				<TextField
					label="Email"
					variant="outlined"
					value={email}
					onChange={(event) => {
						setEmail(event.target.value);
					}}
					fullWidth
				/>
				<h3>{error}</h3>
				<Button type="submit" variant="contained">
					Reset password
				</Button>
				{spinner && <CircularProgress className={styles.spinner} />}
				{done && <h3>Sent!</h3>}
			</form>
		</div>
	);
};
