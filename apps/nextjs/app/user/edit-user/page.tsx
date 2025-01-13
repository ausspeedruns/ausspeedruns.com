import styles from "../../../styles/User.EditUser.module.scss";

import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { registerUrql } from "@urql/next/rsc";
import { cacheExchange, createClient, fetchExchange, gql } from "@urql/core";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { EditUserForm } from "./form";
import { auth } from "../../../auth";
import { cookies } from "next/headers";

const makeClient = () => {
	return createClient({
		url: "http://localhost:8000/api/graphql",
		// url: "https://keystone.ausspeedruns.com/api/graphql",
		exchanges: [cacheExchange, fetchExchange],
		fetchOptions: () => {
			const cookie = cookies();
			if (cookie.has("keystonejs-session")) {
				const keystoneCookie = cookie.get("keystonejs-session");
				return {
					headers: {
						cookie: `keystonejs-session=${keystoneCookie?.value}`,
					},
				};
			}

			return {};
		},
	});
};

const { getClient } = registerUrql(makeClient);

export const metadata: Metadata = {
	title: "Edit User",
};

export default async function EditUser() {
	const session = await auth();

	if (!session || !session.user.id) {
		return redirect("/signin");
	}

	const { data } = await getClient().query(
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
				}
			}
		`,
		{ userId: session.user.id },
	);

	const user = data.user;

	return (
		<div className={styles.content}>
			<h1>{session.user.name}</h1>
			<Link href={`/user/${session.user.name}`} passHref className={styles.return}>
				<FontAwesomeIcon icon={faChevronLeft} /> Return
			</Link>
			<EditUserForm
				data={{
					userId: session.user.id,
					name: user.name,
					email: user.email,
					state: user.state,
					pronouns: user.pronouns,
					discord: user.discord,
					twitter: user.twitter,
					twitch: user.twitch,
					dateOfBirth: user.dateOfBirth,
					verified: user.verified,
				}}
			/>
		</div>
	);
}
