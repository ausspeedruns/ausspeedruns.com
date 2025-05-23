import { getRegisteredClient } from "@libs/urql";

import { gql } from "@urql/core";

import styles from "../../../styles/Schedule.event.module.scss";
import { notFound } from "next/navigation";
import { Schedule } from "./schedule";
import type { Metadata } from "next";

export type Block = {
	name: string;
	colour: string;
	textColour: string;
	startRunId: string;
	endRunId?: string;
};

const QUERY_EVENT = gql`
	query ($event: String) {
		event(where: { shortname: $event }) {
			id
			shortname
			eventTimezone
			startDate
			endDate
			scheduleReleased
			logo {
				url
				height
				width
			}
			ogImage {
				url
			}
			runs(orderBy: [{ scheduledTime: asc }]) {
				id
				runners {
					username
				}
				game
				category
				platform
				estimate
				finalTime
				donationIncentiveObject {
					id
					title
				}
				race
				racer
				coop
				twitchVOD
				youtubeVOD
				scheduledTime
			}
			scheduleBlocks
			oengus
			horaro
		}
	}
`;

interface QUERY_EVENT_RESULTS {
	event: {
		id: string;
		shortname: string;
		eventTimezone: string;
		startDate: string;
		endDate: string;
		scheduleReleased: boolean;
		logo: {
			url: string;
			height: number;
			width: number;
		};
		ogImage?: {
			url: string;
		};
		runs: {
			id: string;
			runners: {
				username: string;
			}[];
			game: string;
			category: string;
			platform: string;
			estimate: string;
			finalTime: string;
			donationIncentiveObject: {
				id: string;
				title: string;
			}[];
			race: boolean;
			racer: string;
			coop: boolean;
			twitchVOD: string;
			youtubeVOD: string;
			scheduledTime: string;
		}[];
		scheduleBlocks: string;
		oengus: string;
		horaro: string;
	};
}

export const metadata: Metadata = {
	title: "Schedule",
	description: "AusSpeedruns Schedule",
	openGraph: {
		title: "Schedule",
		description: "AusSpeedruns Schedule",
	},
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventSchedule({ params }: { params: { event: string } }) {
	const { data } = await getRegisteredClient()
		.query<QUERY_EVENT_RESULTS>(QUERY_EVENT, { event: params.event })
		.toPromise();
	const event = data?.event;

	if (!event) {
		return notFound();
	}

	if (!event.scheduleReleased)
	{
		return notFound();
	}

	return (
		<main className={styles.content}>
			<Schedule event={event} />
		</main>
	);
}
