"use server";

import { getPayload } from "payload";
import config from "#payload-config";

import type { SignUpFormData } from "./SignUpForm";

export async function SignUp(form: SignUpFormData) {
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
