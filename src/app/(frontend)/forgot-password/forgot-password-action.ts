"use server";

import { getPayload } from "payload";

import configPromise from "#payload-config";

export interface ForgotPasswordFormValues {
	email: string;
}

export async function requestPasswordReset(values: ForgotPasswordFormValues) {
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
