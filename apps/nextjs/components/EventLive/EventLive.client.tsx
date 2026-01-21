"use client";

import { useState } from "react";
import styles from "./EventLive.module.scss";
import Image from "next/image";
import useInterval from "../../hooks/useInterval";
import { format } from "date-fns";

import TwitchChatEmbed from "../TwitchChatEmbed/TwitchChatEmbed";
import TwitchVideoEmbed from "../TwitchVideoEmbed/TwitchVideoEmbed";

import EventLogo from "../../styles/img/events/aso26/aso26-temp.svg";
import { Incentive } from "../Incentives/Incentive";
import Button from "../Button/Button";

import Link from "next/link";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";

import { QUERY_EVENT_RESULTS } from "./EventLive";

import GameOnCancer from "../../styles/img/sponsors/GameOnCancer/logo-white.svg";

const aspectRatio = EventLogo.height / EventLogo.width;
const gocAspectRatio = GameOnCancer.height / GameOnCancer.width;

interface EventProps {
	eventData: QUERY_EVENT_RESULTS;
}

export function EventLiveClient(props: EventProps) {
	const [currentTime, setCurrentTime] = useState(new Date());

	useInterval(() => {
		setCurrentTime(new Date());
	}, 10 * 1000);

	// console.log(eventQuery);

	const sortedIncentives = props.eventData?.event.donationIncentives.sort((a, b) => {
		const aTime = new Date(a.run.scheduledTime).getTime();
		const bTime = new Date(b.run.scheduledTime).getTime();
		return aTime - bTime;
	});

	const nextActiveIncentive = sortedIncentives[0];

	const incentiveData = {
		title: nextActiveIncentive?.title ?? "",
		run: nextActiveIncentive?.run ?? "",
		active: true,
		notes: nextActiveIncentive?.notes ?? "",
		type: nextActiveIncentive?.type ?? "",
		...nextActiveIncentive?.data,
	};

	let nextRunIndex = -1;
	for (let index = 0; index < (props.eventData?.event.runs?.length ?? -1); index++) {
		const run = props.eventData?.event.runs[index];
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

	const numberOfRunners = props.eventData?.event.runs?.[currentRunIndex]?.runners.length ?? 1;
	const runnersString =
		props.eventData?.event.runs?.[currentRunIndex]?.runners.map((runner) => runner.username).join(", ") ??
		"Loading";

	return (
		<div className={styles.eventLive}>
			<div className={styles.logo}>
				<Link href={`/${props.eventData.event.shortname}`} passHref legacyBehavior>
					<Image
						src={EventLogo}
						width={200}
						height={aspectRatio * 200}
						alt="ASO2026 Logo"
						style={{
							maxWidth: "100%",
							height: "auto",
						}}
					/>
				</Link>
			</div>
			<div className={styles.eventInfo}>
				<h2>January 24 - 25 | Sydney</h2>
				<div className={styles.link}>
					<Button actionText="Donate!" link="/donate" colorScheme="primary" noMarginRight />
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

			{/* <div className={styles.sponsors}>
				<h2>Our Sponsors</h2>
				<div className={styles.images}>
					<Link href="https://www.aorus.com/" target="_blank" rel="noreferrer">
						<Image
							src={gigabyteLogo}
							width={300}
							height={gigabyteAspectRatio * 300}
							alt="AORUS - Gigabyte Logo"
						/>
					</Link>
					<Link href="https://urbanclimb.com.au/" target="_blank" rel="noreferrer">
						<Image
							src={urbanClimbLogo}
							width={300}
							height={urbanClimbAspectRatio * 300}
							alt="Urban Climb Logo"
						/>
					</Link>
					<Link href="https://www.infiniteworlds.com.au/" target="_blank" rel="noreferrer">
						<Image
							src={InfiniteWorldsLogo}
							width={125}
							height={infiniteWorldsAspectRatio * 125}
							alt="Infinite Worlds Logo"
						/>
					</Link>
				</div>
			</div> */}

			<div className={styles.onDeck}>
				<div className={styles.columnLeft}>
					<h4>{currentRunIndex == 0 ? "First Game" : "Game"}</h4>
					<h3>{props.eventData?.event.runs?.[currentRunIndex]?.game ?? "Loading"}</h3>
				</div>
				<div className={styles.columnMiddle}>
					<h4>{currentRunIndex == 0 ? "First Category" : "Category"}</h4>
					<h3>{props.eventData?.event.runs?.[currentRunIndex]?.category ?? "Loading"}</h3>
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
				{(props.eventData?.event.runs?.length ?? 0) > nextRunIndex && (
					<section className={styles.upcoming}>
						<div className={styles.liveContent}>
							<h2>Upcoming Run</h2>
							<div className={styles.info}>
								<span className={styles.game}>
									{props.eventData?.event.runs?.[nextRunIndex]?.game ?? "Loading"}
								</span>
								<span className={styles.category}>
									{props.eventData?.event.runs?.[nextRunIndex]?.category ?? "Loading"}
								</span>
								<span className={styles.subtitle}>Time</span>
								<span>
									{props.eventData?.event.runs?.[nextRunIndex]?.scheduledTime
										? format(
												new Date(props.eventData?.event.runs[nextRunIndex]?.scheduledTime),
												"H:mm a",
											)
										: "Loading"}
								</span>
								<span className={styles.subtitle}>
									{props.eventData?.event.runs?.[nextRunIndex]?.runners.length! > nextRunIndex
										? "Runners"
										: "Runner"}
								</span>
								<span>
									{props.eventData?.event.runs?.[nextRunIndex]?.runners
										.map((runner) => runner.username)
										.join(", ") ?? "Loading"}
								</span>
							</div>
							<div className={styles.link}>
								<Button
									actionText="Schedule"
									link={`/${props.eventData.event.shortname}/schedule`}
									colorScheme="secondary"
									openInNewTab
									iconRight={faCalendar}
								/>
							</div>
						</div>
					</section>
				)}

				{props.eventData?.event.donationIncentives.length! > 0 && (
					<section className={styles.incentive}>
						<div className={styles.liveContent}>
							<h2>Donation Incentives</h2>
							<span className={styles.instructions}>
								Make a donation and{" "}
								<span style={{ textDecoration: "underline" }}>write in the message</span> that you want
								to put the money towards this or another incentive
							</span>
							<div className={styles.divider} />
							<div style={{ margin: "20px 0" }}>
								{incentiveData.title !== "" ? (
									<Incentive incentive={incentiveData as any} />
								) : (
									<h4>Loading</h4>
								)}
							</div>
							<div className={styles.link}>
								<Button
									actionText="Incentives"
									link={`/${props.eventData.event.shortname}/incentives`}
									colorScheme="secondary"
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
}
