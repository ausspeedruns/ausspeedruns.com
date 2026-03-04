"use client";

import { useSearchParams } from "next/navigation";
import styles from "../../styles/SignIn.module.scss";

const SignInError: React.FC = () => {
	const params = useSearchParams();

	const error = params.get("error");

	if (!error) {
		return;
	}

	let readableError;

	switch (error) {
		case "CallbackRouteError":
			readableError = "Invalid Email or Password";
			break;
		case "TurnstileError":
			readableError = "Turnstile verification failed";
			break;
		default:
			readableError = "An unknown error occurred";
			break;
	}

	console.error(`Sign In Error: ${error}`);

	return (
		<div className={styles.errorBox}>
			<h2>Error</h2>
			<p>{readableError}</p>
		</div>
	);
};

export default SignInError;
