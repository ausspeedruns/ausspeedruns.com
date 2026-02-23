"use server";

import { getRegisteredClient } from "@libs/urql";
import { gql } from "urql";

type PasswordResetData = {
	email: string;
	token: string;
	password: string;
};

const RESET_PASSWORD = gql`
	mutation ($email: String!) {
		sendUserPasswordResetLink(email: $email)
	}
`;

export async function resetPassword(formData: FormData) {
	const email = formData.get("email") as string;
	const turnstileResponse = formData.get("cf-turnstile-response") as string;

	if (!email) {
		throw new Error("Email missing");
	}

	if (!turnstileResponse) {
		throw new Error("Turnstile verification failed");
	}

	const turnstileVerify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileResponse}`,
	});

	const turnstileVerifyJson = await turnstileVerify.json();

	if (!turnstileVerifyJson.success) {
		throw new Error("Turnstile verification failed");
	}

	const result = await getRegisteredClient().mutation(RESET_PASSWORD, { email }).toPromise();

	if (result.error) {
		console.error(result.error);
		throw result.error;
	}

	return;
}
