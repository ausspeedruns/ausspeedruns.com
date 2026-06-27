import Image from "next/image";
import Button from "../../components/Button/Button";

import styles from "./asap2026.module.scss";
import { gql } from "urql";
import { getRegisteredClient } from "@libs/urql";
import Marquee from "react-fast-marquee";
import { faTicket, faCalendar, faPerson, faShirt, faPersonRunning } from "@fortawesome/free-solid-svg-icons";

import image1 from "./images/1f426b44387dac9cc05ffd27b493.JPG";
import image2 from "./images/2d706231742758fb3df2bda45655.JPG";
import image3 from "./images/79a8c37c7874cee3ee27b019e4c8.jpg";
import image4 from "./images/6771aaddc3bc6ba46a2265a67701.jpg";
import image5 from "./images/69383807f84995d14eb7ad1ebdbf.JPG";
import image6 from "./images/d23e100a3bdd36cb9ad32e5a12a2.JPG";
import image7 from "./images/e0e190bade4a64bf41ecce03c708.JPG";
import image8 from "./images/e27fb5c1dca76227a7dd68105575.JPG";

import Logo from "../../styles/img/events/asap26/logo.png";
import { Metadata } from "next";

const images = [
	{ src: image6, alt: "The best crowd at PAX" },
	{ src: image5, alt: "The photo I keep asking the photographers to take." },
	{ src: image2, alt: "The best speedrun community known to humanity in 2025" },
	{ src: image8, alt: "Snowboard kids GAMING" },
	{ src: image3, alt: "Top down view of a crowd watching the best speedruns at PAX in 2025" },
	{ src: image1, alt: "BryanBrews going while Ninten, Syo and Liquid (behind BryanBrews) watch and applaud in horror." },
	{ src: image4, alt: "A crowd very intently watching a whiteboard" },
	{ src: image7, alt: "A very happy host in front of the Speedrunning Banner" },
];

const EVENT = "ASAP2026";

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
	title: "ASAP2026",
	description: "AusSpeedruns At PAX 2026 is coming up! Join us at PAX Australia October 9 - 11.",
};

export default async function ASAP2026() {
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
					<Image className={styles.logo} src={Logo} alt="ASM 2026 Logo" />
					<h1>AusSpeedruns At PAX 2026</h1>
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
					PAX is one of the biggest video gaming expos across the globe and AusSpeedruns has been a part of
					their Australian events since 2016! Perform infront of a live audience and showcase your skills and
					game to hundreds of people, all while raising money for charity!
				</p>
				<p>
					ASAP 2026 will take place at PAX Australia in Melbourne, Australia from the 9th to the 11th of
					October.
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
							<td>9th – 11th October 2026</td>
						</tr>
						<tr>
							<td>Submission Dates</td>
							<td>27th June – 27th July 2026</td>
						</tr>
					</tbody>
				</table>
			</section>
		</main>
	);
}
