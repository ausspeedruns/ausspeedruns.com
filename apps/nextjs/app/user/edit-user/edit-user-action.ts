"use server";

import { getUrqlCookieClient } from "@libs/urql";
import { gql } from "urql";
import { parse } from "date-fns";

type EditProfileData = {
	userId: string;
	name: string;
	email: string;
	pronouns: string;
	discord: string;
	twitter: string;
	twitch: string;
	dateOfBirth: string;
	state: string;
};

const UPDATE_PROFILE = gql`
	mutation UpdateProfile(
		$userId: ID
		$name: String!
		$email: String!
		$pronouns: String!
		$discord: String!
		$twitter: String!
		$twitch: String!
		$dateOfBirth: DateTime!
		$state: UserStateType!
	) {
		updateUser(
			where: { id: $userId }
			data: {
				name: $name
				email: $email
				pronouns: $pronouns
				dateOfBirth: $dateOfBirth
				state: $state
				discord: $discord
				twitter: $twitter
				twitch: $twitch
			}
		) {
			__typename
		}
	}
`;

// export async function updateProfile(boundData: { userId: string; cookie: string }, formData: FormData) {
export async function updateProfile(userId: string, formData: FormData) {
	const dateOfBirth = parse(formData.get("dateOfBirth") as string, "dd/MM/yyyy", new Date());

	const profileData: EditProfileData = {
		userId: userId,
		name: formData.get("name") as string,
		email: formData.get("email") as string,
		pronouns: formData.get("pronouns") as string,
		discord: formData.get("discord") as string,
		twitter: formData.get("twitter") as string,
		twitch: formData.get("twitch") as string,
		dateOfBirth: dateOfBirth.toISOString(),
		state: formData.get("state") as string,
	};

	const client = getUrqlCookieClient();
	const result = await client.mutation(UPDATE_PROFILE, profileData).toPromise();

	return result.data;
}

type UpdateVerificationData = {
	userId: string;
};

const UPDATE_VERIFICATION = gql`
	mutation UpdateVerificationTime($userId: ID, $time: DateTime) {
		updateUser(where: { id: $userId }, data: { sentVerification: $time }) {
			__typename
		}
	}
`;

export async function resendVerificationEmail(userId: string) {
	const client = getUrqlCookieClient();
	const result = await client.mutation(UPDATE_VERIFICATION, { userId, time: new Date().toISOString() }).toPromise();
	return result.data;
}
