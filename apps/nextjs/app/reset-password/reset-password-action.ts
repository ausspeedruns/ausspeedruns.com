"use server";

import { getRegisteredClient } from "@libs/urql";
import { gql } from "urql";
import { redirect } from "next/navigation";

const RESET_PASSWORD = gql`
	mutation ($email: String!) {
		sendUserPasswordResetLink(email: $email)
	}
`;

export async function resetPassword(formData: FormData) {
	const email = formData.get("email") as string;
	const turnstileResponse = formData.get("cf-turnstile-response") as string;

	if (!email) {
		redirect("/reset-password?error=EmailMissing");
	}

	if (!turnstileResponse) {
		redirect("/reset-password?error=TurnstileError");
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
		redirect("/reset-password?error=TurnstileError");
	}

	// Always show success regardless of whether the email exists to prevent email enumeration
	await getRegisteredClient().mutation(RESET_PASSWORD, { email }).toPromise();

	redirect("/reset-password?success=true");
}
