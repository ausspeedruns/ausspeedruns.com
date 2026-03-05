import Link from "next/link";
import Image from "next/image";
import { auth } from "../../auth";
import Button from "../../components/Button/Button";

import styles from "./asm2026.module.scss";
import { stripeCheckoutAction } from "./ticket-checkout";
import { TicketPurchase } from "./ticket-purchase";
import { ShirtPurchase } from "./shirt-purchase";
import { stripeCheckoutAction as shirtStripeCheckoutAction } from "./shirt-checkout";
import { gql } from "urql";
import { getRegisteredClient } from "@libs/urql";
import Marquee from "react-fast-marquee";
import { faTicket, faCalendar, faPerson, faShirt, faPersonRunning } from "@fortawesome/free-solid-svg-icons";

import ImageCrowdCheer from "./images/CrowdCheer.JPG";
import ImageCrowd from "./images/CrowdStoic.JPG";
import ImageCrowdGoingWild from "./images/CrowdGoingWild.JPG";
import ImagePointingAtCamera from "./images/PointingAtCamera.JPG";
import ImageSpeedrunning from "./images/Speedrunning.JPG";
import ImageWhiteboard from "./images/Whiteboard.JPG";
import ImageBand from "./images/ZoomieAndTheGs.JPG";

import Logo from "../../styles/img/events/asm26/ASM26_Logo.png";
import { Metadata } from "next";

const images = [
	{ src: ImageCrowdCheer, alt: "The crowd cheering after a goal in speedrunning" },
	{ src: ImageCrowdGoingWild, alt: "The whole crowd enthusiastically cheering at the end of a run" },
	{ src: ImageCrowd, alt: "Beautiful crowd watching the event" },
	{ src: ImagePointingAtCamera, alt: "A close up photos of speedrunners laughing" },
	{ src: ImageSpeedrunning, alt: "syo going at it ferociously in FFX" },
	{ src: ImageWhiteboard, alt: "ASM2025 whiteboard" },
	{ src: ImageBand, alt: "Zoomie and the Gs performing" },
];

const EVENT = "ASM2026";

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
	title: "ASM2026",
	description: "Australian Speedrun Marathon 2026, July 14 - 19. Run submissions open!",
};

export default async function ASM2026() {
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
		emailVerified = data.user?.verified;
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
					<Image className={styles.logo} src={Logo} alt="ASM 2026 Logo" />
					<h1>Australian Speedrun Marathon 2026 | July 14 - 19</h1>
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
					The Australian Speedrunning Marathon is back in 2026 at beloved home of the event the Adelaide
					Rockford! ASM 2026 will run from the 14th to the 19th of July. Each night at 7pm will be something
					worth coming in or tuning in for!
				</p>
				<p>
					Please book your hotel rooms through our event link for a discount and to directly support the event{" "}
					<Link href="https://www.idem.events/r/ausspeedruns-2026-f7205658" target="_blank">
						here
					</Link>
				</p>
				<p>
					Tickets are now on sale with shirt design submissions to come after the schedule is released. There
					are so many fun surprises in store! You never know what might pop up!
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
							<td>Hotel Booking</td>
							<td>
								<Link href="https://www.idem.events/r/ausspeedruns-2026-f7205658" target="_blank">
									Adelaide Rockford
								</Link>
							</td>
						</tr>
						<tr>
							<td>Event Dates</td>
							<td>14th – 19th July 2026</td>
						</tr>
						<tr>
							<td>Submission Dates</td>
							<td>6th March – 6th April 2026</td>
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
					AusSpeedruns does not offer any refunds for purchased ASM2026 tickets, except as required by
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
