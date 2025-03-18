import React from "react";
import { gql } from "urql";

import styles from "../../styles/Volunteers.module.scss";
import LinkButton from "../../components/Button/Button";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { getRegisteredClient } from "@libs/urql";
import { registerUrql } from "@urql/next/rsc";
import { auth } from "../../auth";
import { Metadata } from "next";
import { Form } from "./form";

export const metadata: Metadata = {
	title: "Volunteer Submission",
	description: "Volunteer for AusSpeedrun Marathons!",
};

function HumanErrorMsg(error: string) {
	// console.log(error.replace(/(\r\n|\n|\r)/gm, ""));
	switch (error.replace(/(\r\n|\n|\r)/gm, "")) {
		case "":
			return "Error";

		default:
			return error;
	}
}

const { getClient } = registerUrql(getRegisteredClient);

type VolunteerData = {
	user: {
		verified: boolean;
		discord: string;
	};
	events: {
		id: string;
		shortname: string;
		startDate: string;
		endDate: string;
		eventTimezone: string;
	}[];
};

async function getUserAndEventInfo(userId: string) {
	return await getClient().query<VolunteerData>(
		gql`
			query VolunteerData($userId: ID!) {
				user(where: { id: $userId }) {
					verified
					discord
				}
				events(where: { acceptingVolunteers: { equals: true } }) {
					id
					shortname
					startDate
					endDate
					eventTimezone
				}
			}
		`,
		{
			userId,
		},
	);
}

export default async function SubmitGamePage() {
	const session = await auth();
	const { data } = await getUserAndEventInfo(session?.user.id ?? "");

	if (!data || data.events.length === 0) {
		return <NoEvent />;
	}

	if (session === null || !session.user.id) {
		return <NoAuth />;
	}

	if (!data.user.verified || !data.user.discord) {
		<main>
			<p>Please make sure you have these set on your profile:</p>
			<ul>
				<li>Verified Email</li>
				<li>Discord ID</li>
			</ul>
		</main>;
	}

	return (
		<main className={styles.content}>
			<Form events={data.events} userId={session.user.id} />
		</main>
	);
}

const NoAuth = () => {
	return (
		<main className={`content ${styles.content} ${styles.noEvents}`}>
			<h2>Please sign in to Volunteer.</h2>
			<LinkButton actionText="Sign In" iconRight={faArrowRight} link="/signin" />
			<br />
			<LinkButton actionText="Join" iconRight={faArrowRight} link="/signup" />
		</main>
	);
};

const NoEvent = () => {
	return (
		<main className={`content ${styles.content} ${styles.noEvents}`}>
			<h2>Unfortunately we have no events currently accepting volunteers.</h2>
			<p>Follow us on Twitter and Join our Discord to stay up to date!</p>
			<LinkButton actionText="Home" iconRight={faArrowRight} link="/" />
		</main>
	);
};
