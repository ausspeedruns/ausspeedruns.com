"use server";

import { redirect } from "next/navigation";
import { signUp, SignUpError } from "../../auth";

export async function signUpAction(formData: FormData) {
	try {
		await signUp(formData);
	} catch (error) {
		console.error(error);
		if (error instanceof SignUpError) {
			redirect(`/signup?error=${error.type}`);
		}

		throw error;
	}

	redirect("/user/edit-user");
}
