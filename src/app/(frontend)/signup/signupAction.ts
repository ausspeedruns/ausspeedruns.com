"use server";

import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "#payload-config";

import { checkForBots } from "#utilities/botCheck/server.ts";
import { TURNSTILE_ACTIONS, type BotCheckInput } from "#utilities/botCheck/shared.ts";

import type { SignUpFormData } from "./SignUpForm";

// This is the only public way to create an account (REST/GraphQL creation is limited to user managers),
// so the bot check here can't be bypassed
export async function SignUp(form: SignUpFormData, botCheck: BotCheckInput) {
	const check = await checkForBots(botCheck, {
		action: TURNSTILE_ACTIONS.signup,
		requestHeaders: await headers(),
	});
	if (!check.ok) {
		if (check.isBot) console.warn("Rejected sign up: honeypot field was filled in");
		return { success: false, message: check.message };
	}

	const payload = await getPayload({ config });

	try {
		await payload.create({
			collection: "users",
			data: {
				username: form.username,
				email: form.email,
				password: form.password,
				dateOfBirth: form.dateOfBirth,
			},
		});
		return {
			success: true,
		};
	} catch (error) {
		console.error("Error creating user:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "An unknown error occurred.",
		};
	}
}
