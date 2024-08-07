import React, { useEffect, useState } from "react";
import styles from "./Heroblock.module.scss";
import Image from "next/image";
import {
	faCalendar,
	faChevronRight,
	faPersonRunning,
	faTicket,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../Button/Button";
import { AusSpeedrunsEvent } from "../../types/types";

type HeroBlockProps = {
	event: AusSpeedrunsEvent;
	tagLine?: string;
	darkText?: boolean;
	schedule?: boolean;
	submitRuns?: boolean;
	ticketLink?: string;
};

function zeroPad(num: number): string {
	return num.toString().padStart(2, "0");
}

function countdownRender(currentTime: number, eventDate: number) {
	// Calculate the difference in seconds between the target date and current date
	let diffInSeconds = (eventDate - currentTime) / 1000;

	// Calculate the days, hours, minutes and seconds from the difference in seconds
	let days = Math.floor(diffInSeconds / 86400);
	let hours = Math.floor(diffInSeconds / 3600) % 24;
	let minutes = Math.floor(diffInSeconds / 60) % 60;
	let seconds = Math.floor(diffInSeconds % 60);

	if (days > 0) {
		return (
			<span>
				<span className="sr-only">
					{days} days, {hours} hours, {minutes} minutes and {seconds}{" "}
					seconds remaining
				</span>
				<span aria-hidden>
					{zeroPad(days)}:{zeroPad(hours)}:{zeroPad(minutes)}:
					{zeroPad(seconds)}
				</span>
			</span>
		);
	}

	if (hours > 0) {
		return (
			<span>
				<span className="sr-only">
					{hours} hours, {minutes} minutes and {seconds} seconds
					remaining
				</span>
				<span aria-hidden>
					{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
				</span>
			</span>
		);
	}

	return (
		<span>
			<span className="sr-only">
				{minutes} minutes and {seconds} seconds remaining
			</span>
			<span aria-hidden>
				{zeroPad(minutes)}:{zeroPad(seconds)}
			</span>
		</span>
	);
}

const HeroBlock = ({ event, tagLine, darkText, schedule, submitRuns, ticketLink }: HeroBlockProps) => {
	const [countdownElement, setCountdownElement] = useState(<></>);

	function updateCountdown() {
		if (!event.startDate) return;
		if (Date.now() < new Date(event.startDate).getTime()) {
			setCountdownElement(countdownRender(Date.now(), new Date(event.startDate).getTime()));
		}
	}

	useEffect(() => {
		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<section
			className={styles.heroblock}
			style={{
				backgroundImage: `url("${
					require(`../../styles/img/${event.heroImage}`).default.src
				}")`,
				color: darkText ? "#000" : "#fff",
			}}>
			<div className={`${styles.content} content`}>
				<div className={styles.ctaBlock}>
					<h1>{event.preferredName}</h1>
					<h2>{event.dates}</h2>
					<h3
						className={[styles.countdown, styles.monospaced].join(
							" ",
						)}>
						{/* <Countdown date={eventDate} renderer={countdownRender} zeroPadTime={2} /> */}
						{countdownElement}
					</h3>
					<br />
					<p>
						{tagLine}
					</p>
					<Button
						actionText={event.preferredName}
						link={`/${event.shortName}`}
						iconRight={faChevronRight}
						colorScheme={"secondary"}
					/>
					{schedule && (
						<Button
							actionText="Schedule"
							link={`/${event.shortName}/schedule`}
							iconRight={faCalendar}
							colorScheme={"secondary"}
						/>
					)}
					{(event.website || ticketLink) && (
						<Button
							actionText="Purchase Tickets"
							link={event.website ?? ticketLink}
							iconRight={faTicket}
							colorScheme={"secondary"}
						/>
					)}
					{submitRuns && (
						<Button
							actionText="Submit a run!"
							link="/submit-game"
							iconRight={faPersonRunning}
							colorScheme={"secondary"}
						/>
					)}
				</div>
				<div className={styles.logoBlock}>
					<Image
						src={require(`../../styles/img/${event.logo}`).default}
						alt="Event Logo"
						style={{
							maxWidth: "100%",
							height: "auto",
						}}
					/>
				</div>
			</div>
		</section>
	);
};

export default HeroBlock;
