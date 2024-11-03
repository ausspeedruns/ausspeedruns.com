"use client";

import { useSearchParams } from "next/navigation";

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
		default:
			readableError = "An unknown error occurred";
			break;
	}

	console.error(`Sign In Error: ${error}`);

	return (
		<div>
			<h2>Error</h2>
			<p>{readableError}</p>
		</div>
	);
};

export default SignInError;