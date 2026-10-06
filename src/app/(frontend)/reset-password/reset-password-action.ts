"use server";

import { getPayload } from "payload";

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

	const payload = await getPayload({ config: configPromise });

	try {
		await payload.resetPassword({
			collection: "users",
			data: { token, password: values.password },
			overrideAccess: false,
		});

		return { success: true, message: "Password updated successfully." };
	} catch {
		return { success: false, message: "Something went wrong. Please try again." };
	}
}