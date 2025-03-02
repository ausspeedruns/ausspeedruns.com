import Link from "next/link";
import Image from "next/image";
import { auth } from "../../auth";
import Button from "../../components/Button/Button";

import styles from "./asm2025.module.scss";
import { stripeCheckoutAction } from "./ticket-checkout";
import { TicketPurchase } from "./ticket-purchase";
import { gql } from "urql";
import { getUrqlClient } from "@libs/urql";
import Marquee from "react-fast-marquee";
import { faArrowRight, faTicket, faCalendar, faPerson, faShirt, faGamepad } from "@fortawesome/free-solid-svg-icons";

import ImageFiveMinShowcase01 from "./images/5MinsShowcase.jpg";
import ImageFiveMinShowcase02 from "./images/5MinsShowcase2.jpg";
import ImageCrowd from "./images/Crowd.jpg";
import ImageLiquid from "./images/Liquid.jpg";
import ImageLumpyPumpkin from "./images/LumpyPumpkin.jpg";
import ImageRunners from "./images/Runners.jpg";

import Logo from "../../styles/img/events/asm25/logo.svg";

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

export default async function ASM2025() {
	const session = await auth();

	const client = getUrqlClient();

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
						iconLeft={faGamepad}
					/>
				)}
				<Button actionText="Buy a Ticket" link="#tickets" iconLeft={faTicket} />
				{acceptingShirts && <Button actionText="Buy a Shirt" link="#shirts" iconLeft={faShirt} />}
				{acceptingVolunteers && <Button actionText="Volunteer" link="/volunteer" iconLeft={faPerson} />}
			</section>
			<hr className={styles.divider} />
			<section className={styles.content}>
				<p>Join us as we celebrate 10 years of Australian Speedrunning in Adelaide.</p>
				<p>
					The Australian Speedrun Marathon will be held at the Adelaide Rockford Hotel between the 15th and
					20th of July 2025.
				</p>
				<p>
					If you are planning to stay at the Hotel, please use our link for room discounts!{" "}
					<Link href="https://www.idem.events/r/ausspeedruns-2025-6d96b342" target="_blank">
						Adelaide Rockford Booking
					</Link>
				</p>
			</section>
			<section className={styles.infoTable}>
				<table>
					<tbody>
						<tr>
							<td>Location</td>
							<td>Adelaide Rockford Hotel, Adelaide, Australia</td>
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
				{!session && (
					<p>
						You must be logged in to purchase a ticket. <Link href="/login">Login</Link>
					</p>
				)}
				<form action={stripeCheckoutAction}>
					<TicketPurchase
						canBuy={emailVerified}
						userId={session?.user.id}
						event={EVENT}
						eventAcceptingTickets={acceptingTickets}
					/>
				</form>
			</section>
			{/* <section className={styles.content} id="shirts">
				<h1>Shirt</h1>
				{!session && (
					<p>
						You must be logged in to purchase a shirt. <Link href="/login">Login</Link>
					</p>
				)}
			</section> */}
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
