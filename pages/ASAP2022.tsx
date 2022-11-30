import Head from 'next/head';
import Image from "next/legacy/image";
import Link from 'next/link';
import React from 'react';
import { useQuery, gql } from 'urql';
import { faArrowRight, faCalendar, faPerson, faShirt, faTicket } from '@fortawesome/free-solid-svg-icons';

import styles from '../styles/Event.ASAP2022.module.scss';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import Button from '../components/Button/Button';
import DiscordEmbed from '../components/DiscordEmbed';

import PAX2022Logo from '../styles/img/PAX2022 Logo White.png';
import StockPhoto1 from '../styles/img/PAXStock1.jpeg';
import StockPhoto2 from '../styles/img/StockPhoto2.jpg';
import StockPhoto3 from '../styles/img/PAXStock2.jpg';
import GoCStockPhoto1 from '../styles/img/sponsors/GameOnCancer/GoCStockPhoto1.png';

import GoCLogo from '../styles/img/sponsors/GameOnCancer/GoCCCWhite.svg';
import HyperX from '../styles/img/sponsors/HyperX/HyperX Solid White.svg';
import Landfall from '../styles/img/sponsors/Landfall.png';

export default function EventPage() {
	const [queryResult, eventQuery] = useQuery({
		query: gql`
			query {
				event(where: { shortname: "ASAP2022" }) {
					id
					acceptingSubmissions
					acceptingTickets
					scheduleReleased
					acceptingVolunteers
					acceptingBackups
					acceptingShirts
				}
			}
		`,
	});

	return (
		<div>
			<Head>
				<title>ASAP2022 - AusSpeedruns</title>
				<DiscordEmbed title="ASAP2022 - AusSpeedruns" pageUrl="/event/ASAP2022" />
			</Head>
			<Navbar />
			<div className={styles.header}>
				<div className={styles.logo}>
					<Image src={PAX2022Logo} alt="AusSpeedruns At PAX 2022 Logo" />
				</div>
				<div className={styles.buttons}>
					<Button
						actionText="Donate"
						link="https://tiltify.com/@ausspeedruns/asap2022"
						target="_blank"
						rel="noopener noreferrer"
					/>

					{queryResult.data?.event?.acceptingSubmissions && (
						<Button actionText="Submissions are open!" link="/submit-game" iconRight={faArrowRight} />
					)}

					{queryResult.data?.event?.acceptingBackups && !queryResult.data?.event?.acceptingSubmissions && (
						<Button actionText="Backup submissions are open!" link="/submit-game" iconRight={faArrowRight} />
					)}

					<Button actionText="Purchase tickets" link="https://aus.paxsite.com" iconRight={faTicket} />

					{queryResult.data?.event?.scheduleReleased && (
						<Button actionText="Schedule" link="/schedule" iconRight={faCalendar} />
					)}

					{queryResult.data?.event?.acceptingVolunteers && (
						<Button actionText="Be a volunteer!" link="/volunteers" iconRight={faPerson} />
					)}

					{queryResult.data?.event?.acceptingShirts && (
						<Button actionText="Buy the ASM2022 Shirt! (Limited Time)" link="/store" iconRight={faShirt} />
					)}

					{/* <Button actionText="Donation Challenges" link="/ASM2022/challenges" iconRight={faArrowRight} /> */}

					<Button
						actionText="Learn more about Game on Cancer"
						link="https://gameoncancer.com.au/"
						iconRight={faArrowRight}
						target="_blank"
						rel="noopener noreferrer"
					/>
				</div>
			</div>
			<main>
				<div className={styles.contentRow}>
					<div className={styles.intro}>
						<h2>AusSpeedruns At PAX 2022</h2>
						<p>
							Ausspeedruns is proud to be running AusSpeedruns x PAX 2022 at PAX Aus 2022, from October 7 - 9! This is a
							speedrunning event, featuring exhibitions of talent from all across Australia, as our runners try to
							complete some of your favourite games as quickly as possible. AusSpeedruns x PAX 2022 will be running for
							all the opening hours of PAX Aus, to be viewed in person, as well as being livestreamed on twitch!
						</p>
					</div>
					<div className={styles.image}>
						<Image layout="fill" objectFit="cover" src={StockPhoto1} alt="PAX Aus crowd watching speedruns" />
					</div>
				</div>
				{/* <div className={styles.contentRow}>
					<div className={styles.image}>
						<Image layout="fill" objectFit="cover" src={StockPhoto2} alt="The crowd cheering on the runner" />
					</div>
					<div className={styles.moreInfo}>
						<p>
							Checkout the schedule <Link href="/schedule">here</Link>
							!
							<br />
							<br />
							Follow us on Twitter or Join the Discord to stay up to date with all the latest information!
						</p>
					</div>
				</div> */}
				<div className={styles.contentRow}>
					<div className={styles.image}>
						<Image layout="fill" objectFit="cover" src={GoCStockPhoto1} alt="Game on Cancer Logo" />
					</div>
					<div className={styles.moreInfo}>
						<p>
							We are super excited to be supporting Cure Cancer through its Game on Cancer initiative. Cure Cancer has
							been raising money for 55 years to fund early career cancer researchers. Over 540 research grants have
							been funded thanks to Cure Cancer donors and partners.
						</p>
					</div>
				</div>
				<div className={styles.sponsors}>
					<div className={styles.main}>
						{/* <div className={styles.sponsor}>
							<span>Charity</span>
							<Image src={GoCLogo} width={500} height={200} />
						</div> */}
						<div className={styles.sponsor}>
							<span>Major Partner</span>
							<Image src={HyperX} width={500} height={200} alt="HyperX Logo" />
						</div>
					</div>
					<div className={styles.secondary}>
						<div className={styles.sponsor}>
							<span>Minor Partner</span>
							<Image src={Landfall} width={200} height={153} alt="Landfall Games Logo" />
						</div>
					</div>
				</div>
				<div className={styles.informationSection}>
					<h3>Information</h3>
					<table className={styles.information}>
						<tr>
							<td>Dates</td>
							<td>October 7-9</td>
						</tr>
						<tr>
							<td>Location</td>
							<td>
								Melbourne Convention Centre
								<br />
								(Outside the Main Theatre)
							</td>
						</tr>
						<tr>
							<td>Submissions period</td>
							<td>29 July - 14 August</td>
						</tr>
						<tr>
							<td>Charity</td>
							<td>Game On Cancer</td>
						</tr>
					</table>
				</div>
			</main>
			<div className={styles.footer}>
				<Image
					src={StockPhoto3}
					layout="fill"
					objectFit="cover"
					alt="Photo of the whole auditorium while the event runs"
				/>
			</div>
			<Footer />
		</div>
	);
}
