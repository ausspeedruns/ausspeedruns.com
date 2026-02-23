"use server";

import { signIn } from "../../auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function signInAction(formData: FormData) {
	let redirectUrl = "/";

	const turnstileResponse = formData.get("cf-turnstile-response") as string;

	if (!turnstileResponse) {
		redirect("/signin?error=TurnstileError");
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
		redirect("/signin?error=TurnstileError");
	}

	try {
		await signIn("credentials", formData);
	} catch (error) {
		console.log(error);

		if (error instanceof AuthError) {
			redirectUrl = `/signin?error=${error.type}`;
		}

		throw error;
	} finally {
		redirect(redirectUrl);
	}
}
