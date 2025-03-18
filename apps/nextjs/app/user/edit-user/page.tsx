import styles from "../../../styles/User.EditUser.module.scss";

import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {  gql } from "@urql/core";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { EditUserForm } from "./form";
import { auth } from "../../../auth";
import { getRegisteredUrqlCookieClient } from "@libs/urql";

export const metadata: Metadata = {
	title: "Edit User",
};

export default async function EditUser() {
	const session = await auth();

	if (!session || !session.user.id) {
		redirect("/signin");
	}

	const client = getRegisteredUrqlCookieClient();

	if (!client) {
		redirect("/signin");
	}

	const result = await client().query(
		gql`
			query Profile($userId: ID!) {
				user(where: { id: $userId }) {
					name
					username
					email
					dateOfBirth
					pronouns
					state
					verified
					discord
					twitter
					twitch
					bluesky
				}
			}
		`,
		{ userId: session.user.id },
	).toPromise();

	if (!result.data?.user) {
		return <div>User not found</div>;
	}

	const user = result.data.user;

	return (
		<div className={styles.content}>
			<h1>{session.user.username}</h1>
			<Link href={`/user/${session.user.username}`} passHref className={styles.return}>
				<FontAwesomeIcon icon={faChevronLeft} /> Return
			</Link>
			<EditUserForm
				data={{
					userId: session.user.id,
					name: user?.name,
					email: user.email,
					state: user?.state,
					pronouns: user?.pronouns,
					discord: user?.discord,
					twitter: user?.twitter,
					twitch: user?.twitch,
					dateOfBirth: user.dateOfBirth,
					verified: user?.verified,
					bluesky: user?.bluesky,
				}}
			/>
		</div>
	);
}
