"use client";

import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { resetPassword } from "./reset-password-action";
import { useSearchParams } from "next/navigation";
import styles from "./User.PasswordReset.code.module.scss";

export function PasswordResetForm() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");

	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [passwordsMatch, setPasswordsMatch] = useState(true);

	function checkPasswordsMatch() {
		setPasswordsMatch(password === passwordConfirm);
	}

	return (
		<form action={resetPassword}>
			<input type="hidden" name="email" value={searchParams.get("email") ?? ""} />
			<input type="hidden" name="token" value={searchParams.get("code") ?? ""} />
			<TextField
				value={password}
				type="password"
				onChange={(e) => setPassword(e.target.value)}
				label="Password"
				name="password"
				required
			/>
			<TextField
				value={passwordConfirm}
				type="password"
				onChange={(e) => setPasswordConfirm(e.target.value)}
				onBlur={() => checkPasswordsMatch()}
				label="Confirm Password"
				name="passwordConfirm"
				required
				error={!passwordsMatch}
			/>
			<div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}></div>
			<Button variant="contained" type="submit">
				Submit
			</Button>
			{error && (
				<p className={styles.errorMessage} role="alert">
					{getErrorMessage(error)}
				</p>
			)}
		</form>
	);
}

function getErrorMessage(error: string) {
	switch (error) {
		case "MissingDetails":
			return "This password reset link is incomplete. Request a new one and try again.";
		case "PasswordsDoNotMatch":
			return "The passwords do not match.";
		case "TurnstileError":
			return "Turnstile verification failed. Please try again.";
		case "InvalidOrExpiredLink":
			return "This password reset link has expired or has already been used. Request a new one.";
		case "ResetFailed":
			return "We could not reset your password. Please try again.";
		default:
			return "An unknown error occurred.";
	}
}
