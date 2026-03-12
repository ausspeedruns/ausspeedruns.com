"use client";

import { useSearchParams } from "next/navigation";
import styles from "../../styles/SignIn.module.scss";

export default function ResetPasswordStatus() {
	const params = useSearchParams();

	const error = params.get("error");
	const success = params.get("success");

	if (success) {
		return (
			<div className={styles.successBox}>
				<p>If an account with that email exists, a password reset link has been sent.</p>
			</div>
		);
	}

	if (!error) {
		return null;
	}

	let readableError;

	switch (error) {
		case "TurnstileError":
			readableError = "Turnstile verification failed. Please try again.";
			break;
		case "EmailMissing":
			readableError = "Please enter your email address.";
			break;
		default:
			readableError = "An unknown error occurred.";
			break;
	}

	return (
		<div className={styles.errorBox}>
			<h2>Error</h2>
			<p>{readableError}</p>
		</div>
	);
}
