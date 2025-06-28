import Image from "next/image";
import Button from "../../components/Button/Button";

import styles from "./asap2025.module.scss";
import { gql } from "urql";
import { getRegisteredClient } from "@libs/urql";
import Marquee from "react-fast-marquee";
import { faTicket, faCalendar, faPerson, faShirt, faPersonRunning } from "@fortawesome/free-solid-svg-icons";

import ImageCrowdAbove from "./images/CrowdAbove.jpg";
import ImageHappyRunner from "./images/HappyRunner.jpg";
import ImageRunners from "./images/Runners.jpg";
import ImageSpeedrunning from "./images/Speedrchokochinning.jpg";
import ImageSyo from "./images/Syo.jpg";
import ImageVi from "./images/Vi.jpg";
import ImageWhiteboard from "./images/Whiteboard.jpg";

import Logo from "../../styles/img/events/asap25/asap25-logo.svg";
import { Metadata } from "next";

const images = [
	{ src: ImageCrowdAbove, alt: "Crowd at ASAP 2024" },
	{ src: ImageHappyRunner, alt: "Happy Runner at ASAP 2024" },
	{ src: ImageSpeedrunning, alt: "Speedrunning at ASAP 2024" },
	{ src: ImageSyo, alt: "Syo at ASAP 2024" },
	{ src: ImageVi, alt: "Vi at ASAP 2024" },
	{ src: ImageWhiteboard, alt: "Whiteboard at ASAP 2024" },
	{ src: ImageRunners, alt: "Runners at ASAP 2024" },
];

const EVENT = "ASAP2025";

const EVENT_QUERY = gql`
	query Event($eventShortname: String) {
		event(where: { shortname: $eventShortname }) {
			acceptingSubmissions
			acceptingBackups
			scheduleReleased
			acceptingVolunteers
		}
	}
`;

export const metadata: Metadata = {
	title: "ASAP2025",
	description:
		"AusSpeedruns At PAX 2025 is coming up! Join us at PAX Australia October 10 - 12.",
};

export default async function ASAP2025() {
	const client = getRegisteredClient();

	const acceptingTicketsQuery = await client.query(EVENT_QUERY, { eventShortname: EVENT }).toPromise();

	const acceptingSubmissions = acceptingTicketsQuery.data?.event?.acceptingSubmissions ?? false;
	const acceptingBackups = acceptingTicketsQuery.data?.event?.acceptingBackups ?? false;
	const scheduleReleased = acceptingTicketsQuery.data?.event?.scheduleReleased ?? false;
	const acceptingVolunteers = acceptingTicketsQuery.data?.event?.acceptingVolunteers ?? false;

	return (
		<main>
			<section className={styles.hero}>
				<Marquee className={styles.marquee} speed={20}>
					{images.map((image, i) => (
						<Image key={i} src={image.src} alt={image.alt} height="600" style={{ marginRight: -0.1 }} />
					))}
				</Marquee>
				<div className={styles.heroContent}>
					<Image className={styles.logo} src={Logo} alt="ASM 2025 Logo" />
					<h1>AusSpeedruns At PAX 2025</h1>
				</div>
			</section>
			<section className={styles.quickActions}>
				{scheduleReleased && (
					<Button actionText="View Schedule" link={`/${EVENT}/schedule`} iconLeft={faCalendar} />
				)}
				{(acceptingSubmissions || acceptingBackups) && (
					<Button
						actionText={acceptingSubmissions ? "Submit a Run" : "Submit a Backup"}
						link="/submit-game"
						iconLeft={faPersonRunning}
					/>
				)}
				<Button actionText="Tickets to PAX" link="https://aus.paxsite.com/" openInNewTab iconLeft={faTicket} />
				{acceptingVolunteers && <Button actionText="Volunteer" link="/volunteer" iconLeft={faPerson} />}
			</section>
			<hr className={styles.divider} />
			<section className={styles.content}>
				<p>
					PAX is one of the biggest video gaming expos across the globe and AusSpeedruns has been a part of their Australian events since 2016! Perform infront of a live audience and showcase your skills and game to hundreds of people, all while raising money for charity!
				</p>
				<p>
					ASAP 2025 will take place at PAX Australia in Melbourne, Australia from the 10th to the 12th of October.
				</p>
			</section>
			<section className={styles.infoTable}>
				<table>
					<tbody>
						<tr>
							<td>Location</td>
							<td>MCEC, Melbourne, Australia</td>
						</tr>
						<tr>
							<td>Event Dates</td>
							<td>10th – 12th October 2025</td>
						</tr>
						<tr>
							<td>Submission Dates</td>
							<td>28th June – 26th July 2025</td>
						</tr>
					</tbody>
				</table>
			</section>
		</main>
	);
}
