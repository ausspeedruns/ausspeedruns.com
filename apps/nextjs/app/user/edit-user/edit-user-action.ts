"use server";

import { getUrqlCookieClient } from "@libs/urql-cookie";
import { gql } from "urql";
import { parse } from "date-fns";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";

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
	bluesky: string;
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
		$bluesky: String!
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
				bluesky: $bluesky
			}
		) {
			__typename
		}
	}
`;

export async function updateProfile(formData: FormData) {
	const session = await auth();

	if (!session || !session.user.id) {
		redirect("/signin");
	}

	const dateOfBirth = parse(formData.get("dateOfBirth") as string, "dd/MM/yyyy", new Date());

	const profileData: EditProfileData = {
		userId: session.user.id,
		name: formData.get("name") as string,
		email: formData.get("email") as string,
		pronouns: formData.get("pronouns") as string,
		discord: formData.get("discord") as string,
		twitter: formData.get("twitter") as string,
		twitch: formData.get("twitch") as string,
		bluesky: formData.get("bluesky") as string,
		dateOfBirth: dateOfBirth.toISOString(),
		state: formData.get("state") as string,
	};

	await getUrqlCookieClient()?.mutation(UPDATE_PROFILE, profileData).toPromise();

	redirect(`/user/${session.user.username}`);
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
	const result = await getUrqlCookieClient()
		?.mutation(UPDATE_VERIFICATION, { userId, time: new Date().toISOString() })
		.toPromise();

	if (!result) {
		return;
	}

	return result.data;
}
