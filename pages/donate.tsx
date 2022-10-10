import React from 'react';
import Head from 'next/head';
import { gql, useQuery } from 'urql';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import styles from '../styles/Donate.module.scss';

import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import DiscordEmbed from '../components/DiscordEmbed';
import Button from '../components/Button/Button';
import { Incentive } from '../components/Incentives/Incentive';

const INCENTIVES_QUERY = gql`
	query {
		event(where: { shortname: "ASAP2022" }) {
			donationIncentives(take: 3, where: { active: { equals: true } }) {
				title
				type
				run {
					id
					game
					category
					scheduledTime
				}
				data
			}
		}
	}
`;

const DonatePage = () => {
	const [incentivesQuery] = useQuery({ query: INCENTIVES_QUERY });

	const incentivesParsed = incentivesQuery.data?.event.donationIncentives.map((incentive) => ({
		title: incentive.title,
		run: incentive.run,
		active: true,
		notes: incentive.notes,
		type: incentive.type,
		...incentive.data,
	}));

	return (
		<div className={styles.app}>
			<Head>
				<title>Donate - AusSpeedruns</title>
				<DiscordEmbed title="Donate - AusSpeedruns" description="Donate to ASM2022!" pageUrl="/donate" />
			</Head>
			<Navbar />
			<main className={styles.content}>
				<h2 className={styles.title}>Donate</h2>
				<section className={styles.incentives}>
					<h2>
						Be sure to mention which donation challenge you want your money to go towards in the donation message!
					</h2>
					{incentivesQuery.data && (
						<>
							<h2>Here are {incentivesQuery.data.event.donationIncentives.length} active challenges</h2>{' '}
							<div className={styles.data}>
								{incentivesParsed.map((incentive) => (
									<>
										<div className={styles.divider} />
										<Incentive incentive={incentive} />
									</>
								))}
							</div>
						</>
					)}
					<div className={styles.link}>
						<Button
							actionText="Check out more challenges!"
							link="/ASAP2022/challenges"
							colorScheme="secondary inverted"
						/>
					</div>
				</section>
				<section className={styles.prizes}>
					<h2>Prizes</h2>
					<div className={styles.prizeList}>
						{/* <div className={styles.prize}>
							<span>2 to giveaway!</span>
							<h2>HyperX Cloud II Headset</h2>
							<h3>Minimum $40 Donation</h3>
							<span>AUS Only</span>
						</div> */}
						<div className={styles.prize}>
							<span>5 to giveaway!</span>
							<h2>HyperX Cloud Mix Earbuds</h2>
							<h3>Minimum $25 Donation</h3>
							<span>AUS Only</span>
						</div>
						{/* <div className={styles.prize}>
							<span>8 to giveaway!</span>
							<h2>Landfall Games Bundle</h2>
							<h3>Minimum $10 Donation</h3>
							<span>Totally Accurate Battle Simulator, Clustertruck and Knightfall</span>
						</div> */}
					</div>
				</section>
				<div className={styles.donate}>
					<Button
						actionText="Donate"
						link="https://tiltify.com/@ausspeedruns/asap2022/donate"
						target="_blank"
						rel="noopener noreferrer"
						iconRight={faChevronRight}
					/>
				</div>
			</main>
			<Footer className={styles.footer} />
		</div>
	);
};

export default DonatePage;
