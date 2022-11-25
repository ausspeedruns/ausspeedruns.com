import Head from 'next/head';
import { gql, useQuery } from 'urql';

import styles from '../../styles/Event.incentives.module.scss';

import Navbar from '../../components/Navbar/Navbar';
import DiscordEmbed from '../../components/DiscordEmbed';
import Footer from '../../components/Footer/Footer';
import { Goal } from '../../components/Incentives/IncentiveGoal';
import { War } from '../../components/Incentives/IncentiveWar';

const INCENTIVES_QUERY = gql`
	query {
		event(where: { shortname: "ASM2022" }) {
			donationIncentives {
				id
				title
				notes
				type
				run {
					id
					game
					category
					scheduledTime
				}
				data
				active
			}
		}
	}
`;

const Challenges = () => {
	const [incentivesQuery, incentivesQueryRefetch] = useQuery({ query: INCENTIVES_QUERY });

	const sortedIncentives: any[] = incentivesQuery.data?.event.donationIncentives.map((a) => ({ ...a })) ?? [];
	sortedIncentives.sort(
		(a, b) => new Date(a.run?.scheduledTime ?? 0).getTime() - new Date(b.run?.scheduledTime ?? 0).getTime()
	);

	let activeIndex = -1;
	let activeIncentiveElements = sortedIncentives.map((incentive) => {
		if (incentive.active) {
			activeIndex++;
			return getIncentiveElement(incentive, activeIndex);
		} else {
			return undefined;
		}
	});
	activeIncentiveElements = activeIncentiveElements.filter((el) => el);

	activeIndex = -1;
	let inactiveIncentiveElements = sortedIncentives.map((incentive) => {
		if (!incentive.active) {
			activeIndex++;
			return getIncentiveElement(incentive, activeIndex);
		} else {
			return undefined;
		}
	});
	inactiveIncentiveElements = inactiveIncentiveElements.filter((el) => el);

	return (
		<div className={styles.app}>
			<Head>
				<title>ASM2022 Donation Challenges - AusSpeedruns</title>
				<DiscordEmbed title="ASM2022 Donation Challenges - AusSpeedruns" pageUrl="/ASM2022/tickets" />
			</Head>
			<Navbar />
			<main className={styles.content}>
				<h2>Donation Challenges</h2>
				<div className={styles.instructions}>
					In your <span className={styles.emphasis}>donation message</span>, mention the challenge and how much you want
					to put in for it!
				</div>
				{/* Incentive coming up */}
				<h3>Closing Soon!</h3>
				<div className={styles.divider} />
				<div className={styles.soon}>{activeIncentiveElements[0]}</div>
				{/* Close incentive */}
				{/* All active incentives */}
				<h3>All Challenges</h3>
				<div className={styles.divider} />
				{activeIncentiveElements}
				<h3>Closed Challenges</h3>
				<div className={styles.divider} />
				{/* All closed incentives */}
				{inactiveIncentiveElements}
			</main>
			<Footer />
		</div>
	);
};

function getIncentiveElement(incentive, index): JSX.Element {
	const runMetadata = {
		title: incentive.title,
		run: incentive.run,
		active: incentive.active,
		notes: incentive.notes,
	};
	switch (incentive.type) {
		case 'goal':
			return (
				<>
					{index !== 0 && <div className={styles.incentiveDivider} />}
					<Goal key={incentive.id} {...runMetadata} {...incentive.data} />
				</>
			);
		case 'war':
			return (
				<>
					{index !== 0 && <div className={styles.incentiveDivider} />}
					<War key={incentive.id} {...runMetadata} {...incentive.data} />
				</>
			);
		default:
			return <></>;
	}
}

export default Challenges;
