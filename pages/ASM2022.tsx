import Head from 'next/head';
import Image from 'next/image';
import React from 'react';
import { gql } from '@keystone-6/core';
import { useQuery } from 'urql';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

import styles from '../styles/Event.ASM2022.module.scss';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import Button from '../components/Button/Button';

import ASM2022Logo from '../styles/img/ASM2022-Logo.svg';
import StockPhoto1 from '../styles/img/StockPhoto1.jpg';
import StockPhoto2 from '../styles/img/StockPhoto2.jpg';
import StockPhoto3 from '../styles/img/StockPhoto3.jpg';
import DiscordEmbed from '../components/DiscordEmbed';

export default function EventPage() {
	const [queryResult, profileQuery] = useQuery({
		query: gql`
			query {
				event(where: { shortname: "ASM2022" }) {
					id
					acceptingSubmissions
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
			<Navbar />
			<header className={styles.header}>
				<div className={styles.logo}>
					<Image src={ASM2022Logo} alt="Australian Speedrun Marathon 2022 Logo" />
				</div>
				{queryResult.data?.event.acceptingSubmissions && (
					<Button actionText="Submissions are open!" link="/submit-game" iconRight={faArrowRight} />
				)}
			</header>
			<main>
				<div className={styles.contentRow}>
					<div className={styles.intro}>
						<h2>Australian Speedrun Marathon 2022</h2>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ultricies quam eros, vitae congue est auctor
							et. Suspendisse eget libero tempor, egestas velit id, luctus risus. Fusce pharetra ut dolor id vehicula.
							Vestibulum dignissim quam eget euismod ullamcorper. Suspendisse hendrerit massa non lectus pellentesque,
							id tincidunt leo luctus.
						</p>
					</div>
					<div className={styles.image}>
						<Image layout="fill" objectFit="cover" src={StockPhoto1} alt="Runner speedrunning on stage" />
					</div>
				</div>
				<div className={styles.contentRow}>
					<div className={styles.image}>
						<Image layout="fill" objectFit="cover" src={StockPhoto2} alt="The crowd cheering on the runner" />
					</div>
					<div className={styles.moreInfo}>
						<p>
							We will be releasing more information about the event soon.
							<br />
							Follow us on Twitter or Join the Discord to be notified as soon as possible!
						</p>
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
						<span>Beyond Blue</span>
					</div>
				</div>
			</main>
			<div className={styles.footer}>
				<Image src={StockPhoto3} layout="fill" objectFit="cover" alt="Photo of the whole auditorium while the event runs" />
			</div>
			<Footer />
		</div>
	);
}
