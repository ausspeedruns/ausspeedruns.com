import Link from "next/link";
import Image from "next/image";
import { auth } from "../../auth";
import Button from "../../components/Button/Button";

import styles from "./asm2025.module.scss";
import { stripeCheckoutAction } from "./ticket-checkout";
import { TicketPurchase } from "./ticket-purchase";
import { gql } from "urql";
import { getRegisteredClient } from "@libs/urql";
import Marquee from "react-fast-marquee";
import { faTicket, faCalendar, faPerson, faShirt, faPersonRunning } from "@fortawesome/free-solid-svg-icons";

import ImageFiveMinShowcase01 from "./images/5MinsShowcase.JPG";
import ImageFiveMinShowcase02 from "./images/5MinsShowcase2.JPG";
import ImageCrowd from "./images/Crowd.JPG";
import ImageLiquid from "./images/Liquid.JPG";
import ImageLumpyPumpkin from "./images/LumpyPumpkin.JPG";
import ImageRunners from "./images/Runners.JPG";

import Logo from "../../styles/img/events/asm25/logo.svg";
import { Metadata } from "next";

const images = [
	{ src: ImageFiveMinShowcase01, alt: "An enthusiastic watcher" },
	{ src: ImageFiveMinShowcase02, alt: "The whole crowd enthusiastically cheering at the end of a run" },
	{ src: ImageCrowd, alt: "The Crowd at ASM2024 clapping" },
	{ src: ImageLiquid, alt: "A close up photos of speedrunners laughing" },
	{ src: ImageLumpyPumpkin, alt: "A group of speedrunners cheering" },
	{ src: ImageRunners, alt: "Runners at ASM2024" },
];

const EVENT = "ASM2025";

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
	title: "ASM2025",
	description:
		"The Australian Speedrun Marathon 2025 is coming up! Celebrate 10 years of Aussie Speedrunning in Adelaide with us between July 15 - 20.",
};

export default async function ASM2025() {
	const session = await auth();

	const client = getRegisteredClient();

	const acceptingTicketsQuery = await client.query(EVENT_QUERY, { eventShortname: EVENT }).toPromise();

	const acceptingTickets = acceptingTicketsQuery.data.event?.acceptingTickets ?? false;
	const acceptingSubmissions = acceptingTicketsQuery.data.event?.acceptingSubmissions ?? false;
	const acceptingBackups = acceptingTicketsQuery.data.event?.acceptingBackups ?? false;
	const scheduleReleased = acceptingTicketsQuery.data.event?.scheduleReleased ?? false;
	const acceptingVolunteers = acceptingTicketsQuery.data.event?.acceptingVolunteers ?? false;
	const acceptingShirts = acceptingTicketsQuery.data.event?.acceptingShirts ?? false;

	let emailVerified = false;
	if (session) {
		const { data } = await client.query(EMAIL_VERIFIED_QUERY, { userId: session.user.id }).toPromise();
		emailVerified = data.user.verified;
	}

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
					<h1>Australian Speedrun Marathon 2025</h1>
					<p>Celebrate 10 Years of Aussie Speedrunning</p>
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
				<Button actionText="Buy a Ticket" link="#tickets" iconLeft={faTicket} />
				{acceptingShirts && <Button actionText="Buy a Shirt" link="#shirts" iconLeft={faShirt} />}
				{acceptingVolunteers && <Button actionText="Volunteer" link="/volunteer" iconLeft={faPerson} />}
			</section>
			<hr className={styles.divider} />
			<section className={styles.content}>
				<p>
					The Australian Speedrunning Marathon returns for its 10th anniversary in 2025! Join us for a
					celebration of the AusSpeedruns community's achievements as we ring in the decade. With something
					special planned every night, your ticket gives you 24 hour access to the greatest
					speedrunning show in the southern hemisphere!{" "}
				</p>
				<p>
					ASM 2025 will run from the 15th to the 20th of July at the Adelaide Rockford, 164 Hindley St,
					Adelaide SA 5000
				</p>
				<p>
					Please book your hotel rooms through our event link for a discount and to directly support the
					event:{" "}
					<Link href="https://www.idem.events/r/ausspeedruns-2025-6d96b342" target="_blank">
						Adelaide Rockford Booking
					</Link>
				</p>
				<p>Tickets are now on sale with shirt design submissions to come after the schedule is released.</p>
				<p>We can't wait to celebrate 10 years of the Australian Speedrunning Marathon with you at ASM 2025!</p>
			</section>
			<section className={styles.infoTable}>
				<table>
					<tbody>
						<tr>
							<td>Location</td>
							<td>Adelaide Rockford Hotel, Adelaide, Australia</td>
						</tr>
						<tr>
							<td>Hotel Booking</td>
							<td>
								<Link href="https://www.idem.events/r/ausspeedruns-2025-6d96b342" target="_blank">
									Adelaide Rockford
								</Link>
							</td>
						</tr>
						<tr>
							<td>Event Dates</td>
							<td>15th – 20th July 2025</td>
						</tr>
						<tr>
							<td>Submission Dates</td>
							<td>3rd March – 11th May 2025</td>
						</tr>
					</tbody>
				</table>
			</section>
			<section className={styles.content} id="tickets">
				<h1>Tickets</h1>
				<form action={stripeCheckoutAction}>
					<TicketPurchase
						canBuy={emailVerified}
						userId={session?.user.id}
						event={EVENT}
						eventAcceptingTickets={acceptingTickets}
					/>
				</form>
			</section>
			<section className={styles.content}>
				<h3>Refund Policy</h3>
				<p>
					AusSpeedruns does not offer any refunds for purchased ASM2025 tickets or ASM2025 shirts, except as
					required by Australian law (e.g. the Australian Consumer Law). Individual exceptions may be
					considered on a case by case basis, however we acknowledge our full discretion to not grant
					exceptions that are sought.
				</p>
				<p>
					Please contact Lacey via the AusSpeedruns <Link href="/discord">Discord</Link> for any inquires.
				</p>
			</section>
		</main>
	);
}
