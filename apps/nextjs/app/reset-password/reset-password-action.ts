"use server";

import { getRegisteredClient } from "@libs/urql";
import { gql } from "urql";

type PasswordResetData = {
	email: string;
	token: string;
	password: string;
};

const RESET_PASSWORD = gql`
	mutation ($email: String!) {
		sendUserPasswordResetLink(email: $email)
	}
`;

export async function resetPassword(formData: FormData) {
	const email = formData.get("email") as string;

	if (!email) {
		throw new Error("Email missing");
	}

	const result = await getRegisteredClient().mutation(RESET_PASSWORD, { email }).toPromise();

	if (result.error) {
		console.error(result.error);
		throw result.error;
	}

	return;
}
