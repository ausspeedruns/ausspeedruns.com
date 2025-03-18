"use server";

import { getRegisteredClient } from "@libs/urql";
import { gql } from "urql";
import { signInAction } from "../../signin/signin-action";

type PasswordResetData = {
	email: string;
	token: string;
	password: string;
};

const RESET_PASSWORD = gql`
	mutation ($email: String!, $token: String!, $password: String!) {
		redeemUserPasswordResetToken(email: $email, token: $token, password: $password) {
			code
			message
		}
	}
`;

export async function resetPassword(formData: FormData) {
	const password = formData.get("password") as string;
	const passwordConfirm = formData.get("passwordConfirm") as string;
	const email = formData.get("email") as string;
	const token = formData.get("token") as string;

	if (!email || !token || !password) {
		console.error(email, token, password);
		throw new Error("Email, token, or password missing");
	}

	if (password !== passwordConfirm) {
		throw new Error("Passwords do not match");
	}

	const passwordResetData: PasswordResetData = {
		email,
		token,
		password,
	};

	const client = getRegisteredClient();
	const result = await client.mutation(RESET_PASSWORD, passwordResetData).toPromise();

	if (
		result.error ||
		["TOKEN_REDEEMED", "TOKEN_EXPIRED", "FAILURE"].includes(result.data?.redeemUserPasswordResetToken?.code)
	) {
		console.error(result);
		throw result.error;
	}

	return signInAction(formData);
}
