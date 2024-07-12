import styles from "./EventLive.module.scss";
import Image from "next/image";
import useInterval from "../../hooks/useInterval";
import { gql, useQuery } from "urql";
import { format } from "date-fns";

import TwitchChatEmbed from "../TwitchChatEmbed/TwitchChatEmbed";
import TwitchVideoEmbed from "../TwitchVideoEmbed/TwitchVideoEmbed";

import EventLogo from "../../styles/img/events/asdh24/DreamHack24Logo.png";
import { Suspense, useState } from "react";
import { Incentive } from "../Incentives/Incentive";
import Button from "../Button/Button";

import GameOnCancer from "../../styles/img/sponsors/GameOnCancer/GoCCCPAX23.svg";
import Link from "next/link";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { Canvas } from "@react-three/fiber";
import { ASM2024Logo } from "../Heroblock/ASM24Logo";

import msiLogo from "../../styles/img/sponsors/msi.png";

const aspectRatio = EventLogo.height / EventLogo.width;
const gocAspectRatio = GameOnCancer.height / GameOnCancer.width;
const msiAspectRatio = msiLogo.height / msiLogo.width;

const QUERY_EVENT = gql`
	query ($event: String!) {
		event(where: { shortname: $event }) {
			runs(orderBy: { scheduledTime: asc }) {
				game
				runners {
					username
				}
				category
				scheduledTime
			}
			donationIncentives(take: 1, where: { active: { equals: true } }) {
				title
				type
				run {
					id
					game
					category
					scheduledTime
				}
				data
				notes
			}
		}
	}
`;

interface QUERY_EVENT_RESULTS {
	event: {
		runs: {
			game: string;
			runners: {
				username: string;
			}[];
			category: string;
			scheduledTime: string;
		}[];
		donationIncentives: {
			title: string;
			type: string;
			run: {
				id: string;
				game: string;
				category: string;
				scheduledTime: string;
			};
			data: object;
			notes: string;
		}[];
	};
}

interface EventProps {
	event: string;
}

export const EventLive: React.FC<EventProps> = (props: EventProps) => {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [eventQuery] = useQuery<QUERY_EVENT_RESULTS>({
		query: QUERY_EVENT,
		variables: { event: props.event },
	});

	useInterval(() => {
		setCurrentTime(new Date());
	}, 10 * 1000);

	// console.log(eventQuery);

	const incentiveData = {
		title: eventQuery.data?.event.donationIncentives?.[0]?.title ?? "",
		run: eventQuery.data?.event.donationIncentives?.[0]?.run ?? "",
		active: true,
		notes: eventQuery.data?.event.donationIncentives?.[0]?.notes ?? "",
		type: eventQuery.data?.event.donationIncentives?.[0]?.type ?? "",
		...eventQuery.data?.event.donationIncentives?.[0]?.data,
	};

	let nextRunIndex = -1;
	for (let index = 0; index < eventQuery.data?.event.runs.length! ?? -1; index++) {
		const run = eventQuery.data?.event.runs[index];
		if (run && new Date(run.scheduledTime).getTime() > currentTime.getTime()) {
			// Next run
			nextRunIndex = index;
			break;
		}
	}

	if (nextRunIndex <= 0) {
		// Before the marathon
		nextRunIndex = 1;
	}

	let currentRunIndex = nextRunIndex - 1;

	const numberOfRunners = eventQuery.data?.event.runs?.[currentRunIndex]?.runners.length ?? 1;
	const runnersString =
		eventQuery.data?.event.runs?.[currentRunIndex]?.runners.map((runner) => runner.username).join(", ") ??
		"Loading";

	return (
		<div className={styles.eventLive}>
			<div className={styles.logo3D}>
				<Link href="/ASM2023" passHref legacyBehavior>
					<div style={{ width: "100%", padding: "0", maxWidth: 2000 }}>
						<Canvas flat style={{ imageRendering: "pixelated" }} camera={{ fov: 30 }}>
							<Suspense fallback={null}>
								<ASM2024Logo />
							</Suspense>
						</Canvas>
					</div>
				</Link>
			</div>
			<div className={styles.eventInfo}>
				<h2>July 16 – 21 | Adelaide</h2>
				<div className={styles.link}>
					<Button actionText="Donate!" link="/donate" colorScheme="primary" />
				</div>
				<Image
					src={GameOnCancer}
					width={200}
					height={gocAspectRatio * 200}
					alt="Game on Cancer Logo"
					style={{
						maxWidth: "100%",
						height: "auto",
					}}
				/>
			</div>

			<div className={styles.schedule}>
				<Button actionText="Schedule" link="/schedule" colorScheme="secondary lightHover" />
			</div>

			<div className={styles.sponsors}>
				<h2>Sponsor</h2>
				<div className={styles.images}>
					<Image src={msiLogo} width={300} height={msiAspectRatio * 300} alt="MSI Logo" />
				</div>
			</div>

			<div className={styles.onDeck}>
				<div className={styles.columnLeft}>
					<h4>{currentRunIndex == 0 ? "First Game" : "Game"}</h4>
					<h3>{eventQuery.data?.event.runs?.[currentRunIndex]?.game ?? "Loading"}</h3>
				</div>
				<div className={styles.columnMiddle}>
					<h4>{currentRunIndex == 0 ? "First Category" : "Category"}</h4>
					<h3>{eventQuery.data?.event.runs?.[currentRunIndex]?.category ?? "Loading"}</h3>
				</div>
				<div className={styles.columnRight}>
					<h4>
						{currentRunIndex == 0
							? `First Runner${numberOfRunners == 1 ? "" : "s"}`
							: `Runner${numberOfRunners == 1 ? "" : "s"}`}
					</h4>
					<h3>{runnersString}</h3>
				</div>
			</div>
			<div className={styles.twitch}>
				<div className={styles.twitchVideo}>
					{typeof window !== "undefined" && (
						<TwitchVideoEmbed muted={false} channel="ausspeedruns" parent={window.location.hostname} />
					)}
				</div>
				<div className={styles.twitchChat}>
					{typeof window !== "undefined" && (
						<TwitchChatEmbed darkMode alwaysShow channel="ausspeedruns" parent={window.location.hostname} />
					)}
				</div>
			</div>

			<div className={styles.dashboard}>
				{(eventQuery.data?.event.runs?.length ?? 0) > nextRunIndex && (
					<section className={styles.upcoming}>
						<div className={styles.liveContent}>
							<h2>Upcoming Run</h2>
							<div className={styles.info}>
								<span className={styles.game}>
									{eventQuery.data?.event.runs?.[nextRunIndex]?.game ?? "Loading"}
								</span>
								<span className={styles.category}>
									{eventQuery.data?.event.runs?.[nextRunIndex]?.category ?? "Loading"}
								</span>
								<span className={styles.subtitle}>Time</span>
								<span>
									{eventQuery.data?.event.runs?.[nextRunIndex]?.scheduledTime
										? format(
												new Date(eventQuery.data?.event.runs[nextRunIndex]?.scheduledTime),
												"H:mm a",
											)
										: "Loading"}
								</span>
								<span className={styles.subtitle}>
									{eventQuery.data?.event.runs?.[nextRunIndex]?.runners.length! > nextRunIndex
										? "Runners"
										: "Runner"}
								</span>
								<span>
									{eventQuery.data?.event.runs?.[nextRunIndex]?.runners
										.map((runner) => runner.username)
										.join(", ") ?? "Loading"}
								</span>
							</div>
							<div className={styles.link}>
								<Button
									actionText="Schedule"
									link={`/${props.event}/schedule`}
									colorScheme="secondary inverted"
									openInNewTab
									iconRight={faCalendar}
								/>
							</div>
						</div>
					</section>
				)}

				{eventQuery.data?.event.donationIncentives.length! > 0 && (
					<section className={styles.incentive}>
						<div className={styles.liveContent}>
							<h2>Donation Incentives</h2>
							<span className={styles.instructions}>
								Make a{" "}
								<span style={{ textDecoration: "underline" }}>donation and write in the message</span>{" "}
								that you want to put the money towards this or another incentive
							</span>
							<div className={styles.divider} />
							{incentiveData.title !== "" ? (
								<Incentive incentive={incentiveData as any} />
							) : (
								<h4>Loading</h4>
							)}
							<div className={styles.link}>
								<Button
									actionText="Incentives"
									link={`/${props.event}/incentives`}
									colorScheme="secondary inverted"
									openInNewTab
								/>
							</div>
						</div>
					</section>
				)}
			</div>

			{/* <div className={styles.crowdcontrol}>
				<Button
					actionText="Learn about our Crowd Control runs"
					link={`/crowd-control`}
					colorScheme="orange"
					openInNewTab
				/>
			</div> */}
		</div>
	);
};
