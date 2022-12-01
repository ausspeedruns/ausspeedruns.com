import Head from 'next/head';
import Image from "next/image";
import Link from 'next/link';
import React from 'react';
import { useQuery, gql } from 'urql';
import { faArrowRight, faCalendar, faPerson, faShirt, faTicket } from '@fortawesome/free-solid-svg-icons';

import styles from '../styles/Event.ASM2022.module.scss';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import Button from '../components/Button/Button';
import DiscordEmbed from '../components/DiscordEmbed';

import ASM2022Logo from '../styles/img/ASM2022-Logo.svg';
import StockPhoto1 from '../styles/img/StockPhoto1.jpg';
import StockPhoto2 from '../styles/img/StockPhoto2.jpg';
import StockPhoto3 from '../styles/img/StockPhoto3.jpg';
import GoCStockPhoto1 from '../styles/img/sponsors/GameOnCancer/GoCStockPhoto1.png';

import GoCLogo from '../styles/img/sponsors/GameOnCancer/GoCCCWhite.svg';
import HyperX from '../styles/img/sponsors/HyperX/HyperX Solid White.svg';
import Landfall from '../styles/img/sponsors/Landfall.png';

export default function EventPage() {
	const [queryResult, eventQuery] = useQuery({
		query: gql`
			query {
				event(where: { shortname: "ASM2022" }) {
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
				<title>ASM2022 - AusSpeedruns</title>
				<DiscordEmbed title="ASM2022 - AusSpeedruns" pageUrl="/event/ASM2022" />
			</Head>
			<div className={styles.header}>
				<div className={styles.logo}>
					<Image
                        src={ASM2022Logo}
                        alt="Australian Speedrun Marathon 2022 Logo"
                        style={{
                            maxWidth: "100%",
                            height: "auto"
                        }} />
				</div>
				<div className={styles.buttons}>
					<Button
						actionText="Donate"
						link="https://tiltify.com/@ausspeedruns/aus-speedrun-marathon-2022"
						target="_blank"
						rel="noopener noreferrer"
					/>

					{queryResult.data?.event?.acceptingSubmissions && (
						<Button actionText="Submissions are open!" link="/submit-game" iconRight={faArrowRight} />
					)}

					{queryResult.data?.event?.acceptingBackups && (
						<Button actionText="Backup submissions are open!" link="/submit-game" iconRight={faArrowRight} />
					)}

					{queryResult.data?.event?.acceptingTickets && (
						<Button actionText="Purchase tickets" link="/ASM2022/tickets" iconRight={faTicket} />
					)}

					{queryResult.data?.event?.scheduleReleased && (
						<Button actionText="Schedule" link="/schedule" iconRight={faCalendar} />
					)}

					{queryResult.data?.event?.acceptingVolunteers && (
						<Button actionText="Be a volunteer!" link="/volunteers" iconRight={faPerson} />
					)}

					{queryResult.data?.event?.acceptingShirts && (
						<Button actionText="Buy the ASM2022 Shirt! (Limited Time)" link="/store" iconRight={faShirt} />
					)}

					<Button actionText="Donation Challenges" link="/ASM2022/challenges" iconRight={faArrowRight} />

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
						<h2>Australian Speedrun Marathon 2022</h2>
						<p>
							ASM2022 is a speedrunning event, featuring exhibitions of talent from all across Australia, as our runners
							try to complete some of your favourite games as quickly as possible. ASM2022 will be running for almost 5
							consecutive days, with over 100 hours of content! This event will be livestreamed on twitch, as well as
							viewable in person, in Adelaide, Australia!
						</p>
					</div>
					<div className={styles.image}>
						<Image
                            src={StockPhoto1}
                            alt="Runner speedrunning on stage"
                            fill
                            sizes="100vw"
                            style={{
                                objectFit: "cover"
                            }} />
					</div>
				</div>
				<div className={styles.contentRow}>
					<div className={styles.image}>
						<Image
                            src={StockPhoto2}
                            alt="The crowd cheering on the runner"
                            fill
                            sizes="100vw"
                            style={{
                                objectFit: "cover"
                            }} />
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
				</div>
				<div className={styles.contentRow}>
					<div className={styles.moreInfo}>
						<p>
							We are super excited to be supporting Cure Cancer through its Game on Cancer initiative. Cure Cancer has
							been raising money for 55 years to fund early career cancer researchers. Over 540 research grants have
							been funded thanks to Cure Cancer donors and partners.
						</p>
					</div>
					<div className={styles.image}>
						<Image
                            src={GoCStockPhoto1}
                            alt="Game on Cancer Logo"
                            fill
                            sizes="100vw"
                            style={{
                                objectFit: "cover"
                            }} />
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
							<Image
                                src={HyperX}
                                width={500}
                                height={200}
                                alt="HyperX Logo"
                                style={{
                                    maxWidth: "100%",
                                    height: "auto"
                                }} />
						</div>
					</div>
					<div className={styles.secondary}>
						<div className={styles.sponsor}>
							<span>Minor Partner</span>
							<Image
                                src={Landfall}
                                width={200}
                                height={153}
                                alt="Landfall Games Logo"
                                style={{
                                    maxWidth: "100%",
                                    height: "auto"
                                }} />
						</div>
					</div>
				</div>
				<div className={styles.informationSection}>
					<h3>Information</h3>
					<div className={styles.information}>
						<span>Dates</span>
						<span>July 13-17</span>
						<span>Location</span>
						<span>in. Studio + Cafe, Adelaide</span>
						<span>Price</span>
						<span>$35</span>
						<span>Submissions period</span>
						<span>25 March - 29 April</span>
						<span>Charity</span>
						<span>Game On Cancer</span>
						<span>Number of Games</span>
						<span>66</span>
						<span>Event Duration</span>
						<span>105 Hours</span>
						<span>Number of Speedrunners</span>
						<span>70</span>
					</div>
				</div>
			</main>
			<div className={styles.footer}>
				<Image
                    src={StockPhoto3}
                    alt="Photo of the whole auditorium while the event runs"
                    fill
                    sizes="100vw"
                    style={{
                        objectFit: "cover"
                    }} />
			</div>
		</div>
    );
}
