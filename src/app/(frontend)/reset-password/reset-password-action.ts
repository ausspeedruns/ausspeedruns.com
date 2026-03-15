"use server";

import { headers } from "next/headers";
import { getPayload } from "payload";

import configPromise from "#payload-config";

export interface ResetPasswordFormValues {
	password: string;
	confirmPassword: string;
}

export async function updatePassword(values: ResetPasswordFormValues) {
	if (values.password !== values.confirmPassword) {
		return { success: false, message: "Passwords do not match." };
	}

	const payload = await getPayload({ config: configPromise });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		return { success: false, message: "You must be logged in to change your password." };
	}

	try {
		await payload.update({
			collection: "users",
			id: user.id,
			data: { password: values.password },
		});

		return { success: true, message: "Password updated successfully." };
	} catch {
		return { success: false, message: "Something went wrong. Please try again." };
	}
}
