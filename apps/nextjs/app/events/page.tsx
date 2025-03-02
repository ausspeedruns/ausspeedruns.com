import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import DiscordEmbed from "../../components/DiscordEmbed";
import styles from "../../styles/Events.module.scss";

import { cacheExchange, createClient, fetchExchange, gql } from "@urql/core";
import { registerUrql } from "@urql/next/rsc";
import { getUrqlClient } from "@libs/urql";

const QUERY_EVENT = gql`
	query {
		events(
			orderBy: { startDate: desc }
			where: { published: { equals: true } }
		) {
			id
			startDate
			endDate
			raised
			shortname
			name
			logo {
				width
				height
				url
			}
			darkModeLogo {
				width
				height
				url
			}
			heroImage {
				url
			}
		}
	}
`;

interface QUERY_EVENT_RESULTS {
	events: {
		id: string;
		startDate: string;
		endDate: string;
		raised: number;
		shortname: string;
		name: string;
		logo?: {
			width: number;
			height: number;
			url: string;
		};
		darkModeLogo?: {
			width: number;
			height: number;
			url: string;
		};
		heroImage?: {
			url: string;
		};
	}[];
}

export default async function Events() {
	const { data } = await getUrqlClient().query<QUERY_EVENT_RESULTS>(QUERY_EVENT, {});
	return (
		<div>
			<Head>
				<title>Events - AusSpeedruns</title>
				<DiscordEmbed title="AusSpeedruns Events" />
			</Head>
			<main className={styles.content}>
				<h1>Events</h1>
				<h2>Upcoming</h2>
				<div className={styles.eventList}>
					{data?.events
						.filter((event) => new Date(event.endDate) > new Date())
						.map((event) => {
							return (
								<EventBlock
									key={event.shortname}
									event={event}
								/>
							);
						})}
				</div>
				<h2>Past</h2>
				<div className={styles.eventList}>
					{data?.events
						.filter(
							(event) => new Date(event.startDate) < new Date(),
						)
						.map((event) => {
							return (
								<EventBlock
									key={event.shortname}
									event={event}
								/>
							);
						})}
				</div>
			</main>
		</div>
	);
}

interface EventBlockProps {
	event: QUERY_EVENT_RESULTS["events"][number];
}

function EventBlock({ event }: EventBlockProps) {
	const dateString =
		event.startDate && event.endDate
			? `${new Date(event.startDate).toLocaleDateString()} – ${new Date(
					event.endDate,
			  ).toLocaleDateString()}`
			: "";

	const raisedString = event.raised
		? `$${event.raised.toLocaleString()}`
		: "";

	return (
		<Link href={`${event.shortname}`} className={styles.event}>
			<section
				style={{ backgroundImage: `url("${event.heroImage?.url}")` }}>
				<div className={styles.eventTitle}>
					{event?.logo ? (
						<Image
							src={
								event.darkModeLogo
									? event.darkModeLogo.url
									: event.logo.url
							}
							fill
							alt={`${event.name} logo`}
						/>
					) : (
						<h2>{event.shortname}</h2>
					)}
				</div>
				<h3>{event.name}</h3>
				<p>
					{[dateString, raisedString].filter((el) => el).join(" | ")}
				</p>
			</section>
		</Link>
	);
}
