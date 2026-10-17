import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { auth } from "../../auth";
import Button from "../../components/Button/Button";

import styles from "./aso2027.module.scss";
import { gql } from "urql";
import { getRegisteredClient } from "@libs/urql";
import Marquee from "react-fast-marquee";
import { faTicket, faCalendar, faPerson, faShirt, faPersonRunning } from "@fortawesome/free-solid-svg-icons";

import Image0 from "./images/5ce172ddcbaee8117aca076a4dd9.JPG";
import Image1 from "./images/24bbd3b30d832a64509e6d910b19.JPG";
import Image2 from "./images/b419b7ec3ac6e6673e46609d4489.JPG";
import Image3 from "./images/beb3ff31dcbcaf2e3d85cbc4640e.JPG";
import Image4 from "./images/cc8fa3fbccae626b93a2536e6838.JPG";
import Image5 from "./images/da62f7d434746c71d000d3545a43.JPG";
import Image6 from "./images/edbb0a38f58b9e6919c0a55a7d31.JPG";

import HeroImage from "../../styles/img/events/aso26/sydney.jpg";

import Logo from "../../styles/img/events/aso27/logo.svg";
import { Metadata } from "next";

const images: { src: StaticImageData; alt: string }[] = [
	// { src: ImageFiveMinShowcase01, alt: "An enthusiastic watcher" },
	// { src: ImageFiveMinShowcase02, alt: "The whole crowd enthusiastically cheering at the end of a run" },
	// { src: ImageCrowd, alt: "The Crowd at ASM2024 clapping" },
	// { src: ImageLiquid, alt: "A close up photos of speedrunners laughing" },
	// { src: ImageLumpyPumpkin, alt: "A group of speedrunners cheering" },
	// { src: ImageRunners, alt: "Runners at ASM2024" },
	{ src: Image0, alt: "ASO2027 Image 0" },
	{ src: Image1, alt: "ASO2027 Image 1" },
	{ src: Image2, alt: "ASO2027 Image 2" },
	{ src: Image3, alt: "ASO2027 Image 3" },
	{ src: Image4, alt: "ASO2027 Image 4" },
	{ src: Image5, alt: "ASO2027 Image 5" },
	{ src: Image6, alt: "ASO2027 Image 6" },
];

const EVENT = "ASO2027";

const EMAIL_VERIFIED_QUERY = gql`
	query EmailVerified($userId: ID) {
		user(where: { id: $userId }) {
			verified
		}
	}
`;

const EVENT_QUERY = gql`
	query Event($eventShortname: String) {
		event(where: { shortname: $eventShortname }) {
			acceptingTickets
			acceptingSubmissions
			acceptingBackups
			scheduleReleased
			acceptingVolunteers
			acceptingShirts
		}
	}
`;

export const metadata: Metadata = {
	title: "ASO2027",
	description: "Join us in Sydney on January 23 - 24, 2027 for the AusSpeedruns Open 2027!",
};

export const revalidate = 0;

export default async function ASO2027() {
	const session = await auth();

	const client = getRegisteredClient();

	const acceptingTicketsQuery = await client.query(EVENT_QUERY, { eventShortname: EVENT }).toPromise();

	const acceptingSubmissions = acceptingTicketsQuery.data.event?.acceptingSubmissions ?? false;
	const acceptingBackups = acceptingTicketsQuery.data.event?.acceptingBackups ?? false;
	return (
		<main>
			<section
				className={styles.hero}
				// style={{
				// 	backgroundImage: `url(${HeroImage.src})`,
				// 	backgroundPosition: "center",
				// 	backgroundSize: "cover",
				// }}
			>
				<Marquee className={styles.marquee} speed={20}>
					{images.map((image, i) => (
						<Image key={i} src={image.src} alt={image.alt} height="600" style={{ marginRight: -0.1 }} />
					))}
				</Marquee>
				<div className={styles.heroContent}>
					<Image className={styles.logo} src={Logo} alt="ASO 2027 Logo" />
					<h1>AusSpeedrun Open 2027</h1>
					<p>The AusSpeedruns Open returns to Sydney in 2027!</p>
				</div>
			</section>
			<section className={styles.quickActions}>
				<Button
					actionText="Submit a Run"
					link="/submit-game"
					iconLeft={faPersonRunning}
				/>
			</section>
			<hr className={styles.divider} />
			<section className={styles.content}>
				<p>
					ASO2027 will be held at Haymarket HQ from Saturday the 23rd to Sunday the 24th of January. Watch
					talented runners push their favourite video games to the limit, discover an amazing community, and
					experience the excitement of live speedrunning, all while supporting a great cause.
				</p>
				<p>
					Join us for another unforgettable event!
				</p>
			</section>
			<section className={styles.infoTable}>
				<table>
					<tbody>
						<tr>
							<td>Location</td>
							<td>Haymarket HQ, Sydney</td>
						</tr>
						<tr>
							<td>Event Dates</td>
							<td>23rd – 24th January 2027</td>
						</tr>
						<tr>
							<td>Submission Dates</td>
							<td>18th October – 15th November 2026</td>
						</tr>
						<tr>
							<td>Tickets</td>
							<td>TBA</td>
						</tr>
					</tbody>
				</table>
			</section>
		</main>
	);
}
