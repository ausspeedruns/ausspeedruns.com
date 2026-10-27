"use server";

import { headers } from "next/headers";
import { getPayload } from "payload";

import configPromise from "#payload-config";
import { checkForBots } from "#utilities/botCheck/server.ts";
import { TURNSTILE_ACTIONS, type BotCheckInput } from "#utilities/botCheck/shared.ts";

export interface ForgotPasswordFormValues {
	email: string;
}

export async function requestPasswordReset(values: ForgotPasswordFormValues, botCheck: BotCheckInput) {
	const check = await checkForBots(botCheck, {
		action: TURNSTILE_ACTIONS.forgotPassword,
		requestHeaders: await headers(),
	});
	if (!check.ok) {
		if (check.isBot) console.warn("Rejected password reset request: honeypot field was filled in");
		return { success: false, message: check.message };
	}

	try {
		const payload = await getPayload({ config: configPromise });

		await payload.forgotPassword({
			collection: "users",
			data: {
				email: values.email,
			},
		});

		return {
			success: true,
			message: "If an account exists for that email, a reset link has been sent.",
		};
	} catch {
		return {
			success: false,
			message: "Unable to send reset email right now. Please try again.",
		};
	}
}
