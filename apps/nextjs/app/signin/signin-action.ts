"use server";

import { signIn } from "../../auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function signInAction(formData: FormData) {
	try {
		await signIn("credentials", formData);
		return redirect("/");
	} catch (error) {
		if (error instanceof AuthError) {
			return redirect(`/signin?error=${error.type}`);
		}
		throw error;
	}
}
