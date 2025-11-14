import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { auth } from "../../auth";
import Button from "../../components/Button/Button";

import styles from "./aso2026.module.scss";
import { stripeCheckoutAction } from "./ticket-checkout";
import { TicketPurchase } from "./ticket-purchase";
import { gql } from "urql";
import { getRegisteredClient } from "@libs/urql";
import Marquee from "react-fast-marquee";
import { faTicket, faCalendar, faPerson, faShirt, faPersonRunning } from "@fortawesome/free-solid-svg-icons";

// import ImageFiveMinShowcase01 from "./images/5MinsShowcase.JPG";
// import ImageFiveMinShowcase02 from "./images/5MinsShowcase2.JPG";
// import ImageCrowd from "./images/Crowd.JPG";
// import ImageLiquid from "./images/Liquid.JPG";
// import ImageLumpyPumpkin from "./images/LumpyPumpkin.JPG";
// import ImageRunners from "./images/Runners.JPG";

import HeroImage from "../../styles/img/events/aso26/sydney.jpg";

import Logo from "../../styles/img/events/aso26/aso26-temp.svg";
import { Metadata } from "next";

const images: { src: StaticImageData; alt: string }[] = [
	// { src: ImageFiveMinShowcase01, alt: "An enthusiastic watcher" },
	// { src: ImageFiveMinShowcase02, alt: "The whole crowd enthusiastically cheering at the end of a run" },
	// { src: ImageCrowd, alt: "The Crowd at ASM2024 clapping" },
	// { src: ImageLiquid, alt: "A close up photos of speedrunners laughing" },
	// { src: ImageLumpyPumpkin, alt: "A group of speedrunners cheering" },
	// { src: ImageRunners, alt: "Runners at ASM2024" },
];

const EVENT = "ASO2026";

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
	title: "ASO2026",
	description: "Join us in Sydney on January 24 - 25, 2026 for the AusSpeedruns Open 2026!",
};

export const revalidate = 0;

export default async function ASO2026() {
	const session = await auth();

	const client = getRegisteredClient();

	const acceptingTicketsQuery = await client.query(EVENT_QUERY, { eventShortname: EVENT }).toPromise();

	const acceptingTickets = acceptingTicketsQuery.data.event?.acceptingTickets ?? false;
	const acceptingSubmissions = acceptingTicketsQuery.data.event?.acceptingSubmissions ?? false;
	const acceptingBackups = acceptingTicketsQuery.data.event?.acceptingBackups ?? false;
	const scheduleReleased = acceptingTicketsQuery.data.event?.scheduleReleased ?? false;
	const acceptingVolunteers = acceptingTicketsQuery.data.event?.acceptingVolunteers ?? false;
	// const acceptingShirts = acceptingTicketsQuery.data.event?.acceptingShirts ?? false;

	let emailVerified = false;
	if (session) {
		const { data } = await client.query(EMAIL_VERIFIED_QUERY, { userId: session.user.id }).toPromise();
		emailVerified = data.user?.verified;
	}

	return (
		<main>
			<section className={styles.hero} style={{ backgroundImage: `url(${HeroImage.src})`, backgroundPosition: "center" }}>
				{/* <Marquee className={styles.marquee} speed={20}>
					{images.map((image, i) => (
						<Image key={i} src={image.src} alt={image.alt} height="600" style={{ marginRight: -0.1 }} />
					))}
				</Marquee> */}
				<div className={styles.heroContent}>
					<Image className={styles.logo} src={Logo} alt="ASO 2026 Logo" />
					<h1>AusSpeedrun Open 2026</h1>
					<p>Our inaugural event in Sydney!</p>
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
				{/* {acceptingShirts && <Button actionText="Buy a Shirt" link="#shirts" iconLeft={faShirt} />} */}
				{acceptingVolunteers && <Button actionText="Volunteer" link="/volunteer" iconLeft={faPerson} />}
			</section>
			<hr className={styles.divider} />
			<section className={styles.content}>
				<p>The AusSpeedruns Open arrives in 2026 for our inaugural event in Sydney!</p>
				<p>
					ASO 2026 will run over the weekend of January 24th - 25th 2026, and will be hosted at the Red Bull
					Gaming Hub UTS.
				</p>
			</section>
			<section className={styles.infoTable}>
				<table>
					<tbody>
						<tr>
							<td>Location</td>
							<td>Red Bull Gaming Hub UTS, 15 Broadway, Ultimo NSW</td>
						</tr>
						<tr>
							<td>Event Dates</td>
							<td>24th – 25th January 2026</td>
						</tr>
						<tr>
							<td>Submission Dates</td>
							<td>14th – 30th November 2025</td>
						</tr>
						<tr>
							<td>Volunteer Submission Dates</td>
							<td>1st – 14th December 2025</td>
						</tr>
						<tr>
							<td>Tickets</td>
							<td>$10</td>
						</tr>
					</tbody>
				</table>
			</section>
			<section className={styles.content} id="tickets">
				<h1>Tickets</h1>
				<form action={stripeCheckoutAction} className={styles.form}>
					<TicketPurchase
						canBuy={emailVerified}
						userId={session?.user.id}
						event={EVENT}
						eventAcceptingTickets={acceptingTickets}
					/>
				</form>
			</section>
			<hr className={styles.divider} />
			{/* <section className={styles.content} id="shirts">
				<h1>Shirts</h1>
				<form action={shirtStripeCheckoutAction} className={styles.form}>
					<ShirtPurchase
						canBuy={emailVerified}
						userId={session?.user.id}
						eventAcceptingShirts={acceptingShirts}
					/>
				</form>
			</section> */}
			<section className={styles.content}>
				<h3>Refund Policy</h3>
				<p>
					AusSpeedruns does not offer any refunds for purchased {EVENT} tickets except as required by
					Australian law (e.g. the Australian Consumer Law). Individual exceptions may be considered on a case
					by case basis, however we acknowledge our full discretion to not grant exceptions that are sought.
				</p>
				<p>
					Please contact JTMagicman via the AusSpeedruns <Link href="/discord">Discord</Link> for any
					inquires.
				</p>
			</section>
		</main>
	);
}
