"use server";

import { APIError, getPayload } from "payload";

import configPromise from "#payload-config";

export interface ResetPasswordFormValues {
	password: string;
	confirmPassword: string;
}

export async function updatePassword(token: string, values: ResetPasswordFormValues) {
	if (!token) {
		return { success: false, message: "This password reset link is invalid or has expired." };
	}

	if (values.password !== values.confirmPassword) {
		return { success: false, message: "Passwords do not match." };
	}

	if (values.password.length < 8) {
		return { success: false, message: "Password must be at least 8 characters." };
	}

	const payload = await getPayload({ config: configPromise });

	try {
		await payload.resetPassword({
			collection: "users",
			data: { token, password: values.password },
			overrideAccess: false,
		});

		return { success: true, message: "Password updated. You can now log in with your new password." };
	} catch (error) {
		// Payload uses a 403 for unknown, already-used and expired tokens
		if (error instanceof APIError && error.status === 403) {
			return {
				success: false,
				expired: true,
				message: "This password reset link is invalid or has expired. Please request a new one.",
			};
		}

		payload.logger.error({ err: error, msg: "Error resetting password" });
		return { success: false, message: "Something went wrong. Please try again." };
	}
}
