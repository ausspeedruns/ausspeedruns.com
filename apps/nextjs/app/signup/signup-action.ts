"use server";

import { redirect } from "next/navigation";
import { signUp, SignUpError } from "../../auth";

export async function signUpAction(formData: FormData) {
	let redirectUrl = "/user/edit-user";

	try {
		await signUp(formData);
	} catch (error) {
		console.error(error);
		if (error instanceof SignUpError) {
			redirectUrl = `/signup?error=${error.type}`;
		} else {
			redirectUrl = `/signup?error=unknown`;
		}

		throw error;
	} finally {
		console.log("Redirecting to", redirectUrl);
		redirect(redirectUrl);
	}
}
