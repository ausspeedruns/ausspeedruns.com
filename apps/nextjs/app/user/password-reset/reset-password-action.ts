"use server";

import { getUrqlClient } from "@libs/urql";
import { gql } from "urql";

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

export async function resetPassword(passwordResetData: PasswordResetData) {
	const client = getUrqlClient();
	const result = await client.mutation(RESET_PASSWORD, passwordResetData).toPromise();
	return result.data?.redeemUserPasswordResetToken;
}
