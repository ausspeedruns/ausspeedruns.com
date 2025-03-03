import React from "react";
import styles from "./Heroblock.module.scss";
import Image from "next/image";
import { faCalendar, faChevronRight, faPersonRunning, faTicket } from "@fortawesome/free-solid-svg-icons";
import Button from "../Button/Button";
import { AusSpeedrunsEvent } from "../../types/types";
import { Countdown } from "./Countdown";

type HeroBlockProps = {
	event: AusSpeedrunsEvent;
	tagLine?: string;
	darkText?: boolean;
	schedule?: boolean;
	submitRuns?: boolean;
	ticketLink?: string;
};

const HeroBlock = ({ event, tagLine, darkText, schedule, submitRuns, ticketLink }: HeroBlockProps) => {
	return (
		<section
			className={styles.heroblock}
			style={{
				backgroundImage: `url("${require(`../../styles/img/${event.heroImage}`).default.src}")`,
				color: darkText ? "#000" : "#fff",
			}}>
			<div className={`${styles.content} content`}>
				<div className={styles.ctaBlock}>
					<h1>{event.preferredName}</h1>
					<h2>{event.dates}</h2>
					<h3 className={[styles.countdown, styles.monospaced].join(" ")}>
						{/* <Countdown date={eventDate} renderer={countdownRender} zeroPadTime={2} /> */}
						<Countdown eventDate={event.startDate} />
					</h3>
					<br />
					<p>{tagLine}</p>
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
							actionText="Submit a Run!"
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
