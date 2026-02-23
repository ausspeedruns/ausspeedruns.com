"use client";

import { useSearchParams } from "next/navigation";
import styles from "../../styles/SignIn.module.scss";

const SignUpError: React.FC = () => {
	const params = useSearchParams();

	const error = params.get("error");

	if (!error) {
		return null;
	}

	let readableError;

	switch (error) {
		case "email":
			readableError = "Email already in use or invalid";
			break;
		case "username":
			readableError = "Username already in use or invalid";
			break;
		case "password":
			readableError = "Password is too short";
			break;
		case "dob":
			readableError = "Invalid Date of Birth or you must be 13 or older";
			break;
		case "turnstile":
			readableError = "Turnstile verification failed";
			break;
		default:
			readableError = "An unknown error occurred";
			break;
	}

	console.error(`Sign Up Error: ${error}`);

	return (
		<div className={styles.errorBox}>
			<h2>Error</h2>
			<p>{readableError}</p>
		</div>
	);
};

export default SignUpError;
