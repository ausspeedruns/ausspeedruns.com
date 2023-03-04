import { GetServerSideProps } from "next";
import { initUrqlClient } from "next-urql";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
	gql,
	ssrExchange,
	dedupExchange,
	cacheExchange,
	fetchExchange,
} from "urql";
import DiscordEmbed from "../components/DiscordEmbed";
import styles from "../styles/Events.module.scss";

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

export default function Events({ events }: QUERY_EVENT_RESULTS) {
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
					{events
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
					{events
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
	event: QUERY_EVENT_RESULTS["events"][0];
}

const LOGO_MAX_HEIGHT = 400;
const LOGO_MAX_WIDTH = 500;

function resizeImage(
	width: number,
	height: number,
): { width: number; height: number } {
	const widthScaleFactor = LOGO_MAX_WIDTH / width;
	const heightScaleFactor = LOGO_MAX_HEIGHT / height;
	const scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);

	return {
		width: width * scaleFactor,
		height: height * scaleFactor,
	};
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

	// let imageSize;
	// if (event.logo) imageSize = resizeImage(event.logo.width, event.logo.height);

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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const ssrCache = ssrExchange({ isClient: false });
	const client = initUrqlClient(
		{
			url:
				process.env.NODE_ENV === "production"
					? "https://keystone.ausspeedruns.com/api/graphql"
					: "http://localhost:8000/api/graphql",
			exchanges: [dedupExchange, cacheExchange, ssrCache, fetchExchange],
		},
		false,
	);

	if (!client) {
		return {
			notFound: true,
		};
	}

	const data = await client
		.query<QUERY_EVENT_RESULTS>(QUERY_EVENT, ctx.params)
		.toPromise();

	if (!data?.data || data?.error) {
		return {
			notFound: true,
		};
	}

	return {
		props: data.data,
	};
};
