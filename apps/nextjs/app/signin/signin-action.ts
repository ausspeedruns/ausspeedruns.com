"use server";

import { signIn } from "../../auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function signInAction(formData: FormData) {
	let redirectUrl = "/";

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
