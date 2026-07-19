"use server";

import { getRegisteredClient } from "@libs/urql";
import { gql } from "urql";
import { redirect } from "next/navigation";
import { signInAction } from "../../signin/signin-action";

type PasswordResetData = {
	email: string;
	token: string;
	password: string;
};

const RESET_PASSWORD = gql`
	mutation ($email: String!, $token: String!, $password: String!) {
		redeemUserPasswordResetToken(email: $email, token: $token, password: $password) {
			code
			message
		}
	}
`;

export async function resetPassword(formData: FormData) {
	const password = formData.get("password") as string;
	const passwordConfirm = formData.get("passwordConfirm") as string;
	const email = formData.get("email") as string;
	const token = formData.get("token") as string;
	const turnstileResponse = formData.get("cf-turnstile-response") as string;

	if (!email || !token || !password) {
		redirect("/user/password-reset?error=MissingDetails");
	}

	if (password !== passwordConfirm) {
		redirect("/user/password-reset?error=PasswordsDoNotMatch");
	}

	if (!turnstileResponse) {
		redirect("/user/password-reset?error=TurnstileError");
	}

	let turnstileVerified = false;

	try {
		const turnstileVerify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileResponse}`,
		});
		const turnstileVerifyJson = await turnstileVerify.json();
		turnstileVerified = turnstileVerify.ok && turnstileVerifyJson.success;
	} catch (error) {
		console.error("Unable to verify Turnstile response for password reset", error);
	}

	if (!turnstileVerified) {
		redirect("/user/password-reset?error=TurnstileError");
	}

	const passwordResetData: PasswordResetData = {
		email,
		token,
		password,
	};

	let result;

	try {
		result = await getRegisteredClient().mutation(RESET_PASSWORD, passwordResetData).toPromise();
	} catch (error) {
		console.error("Unable to reset password", error);
		redirect("/user/password-reset?error=ResetFailed");
	}

	const resetCode = result.data?.redeemUserPasswordResetToken?.code;

	if (["TOKEN_REDEEMED", "TOKEN_EXPIRED"].includes(resetCode)) {
		redirect("/user/password-reset?error=InvalidOrExpiredLink");
	}

	if (result.error || resetCode === "FAILURE") {
		console.error("Unable to reset password", result.error ?? result.data);
		redirect("/user/password-reset?error=ResetFailed");
	}

	return signInAction(formData);
}
