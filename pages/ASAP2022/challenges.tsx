import Head from 'next/head';
import { gql, useQuery } from 'urql';

import styles from '../../styles/Event.incentives.ASAP2022.module.scss';

import Navbar from '../../components/Navbar/Navbar';
import DiscordEmbed from '../../components/DiscordEmbed';
import Footer from '../../components/Footer/Footer';
import { Goal } from '../../components/Incentives/IncentiveGoal';
import { War } from '../../components/Incentives/IncentiveWar';

const INCENTIVES_QUERY = gql`
	query {
		event(where: { shortname: "ASAP2022" }) {
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

	let incentiveElements = {
		active: [],
		inactive: [],
	};

	sortedIncentives.forEach((incentive) => {
		if (incentive.active) {
			incentiveElements.active.push(getIncentiveElement(incentive));
		} else {
			incentiveElements.inactive.push(getIncentiveElement(incentive));
		}
	});

	return (
		<div className={styles.app}>
			<Head>
				<title>ASAP2022 Donation Challenges - AusSpeedruns</title>
				<DiscordEmbed title="ASAP2022 Donation Challenges - AusSpeedruns" pageUrl="/ASAP2022/challenges" />
			</Head>
			<Navbar />
			<main className={styles.content}>
				<h2>Donation Challenges</h2>
				<div className={styles.instructions}>
					In your <span className={styles.emphasis}>donation message</span>, mention the challenge and how much you want
					to put in for it!
				</div>
				{incentiveElements.active.length > 0 && (
					<>
						<h3>Closing Soon!</h3>
						<div className={styles.divider} />
						<div className={styles.soon}>{incentiveElements.active[0]}</div>
						<h3>All Challenges</h3>
						<div className={styles.divider} />
						{incentiveElements.active}
					</>
				)}

				<h3>Closed Challenges</h3>
				<div className={styles.divider} />
				{/* All closed incentives */}
				{incentiveElements.inactive}
			</main>
			<Footer />
		</div>
	);
};

function getIncentiveElement(incentive): JSX.Element {
	const runMetadata = {
		title: incentive.title,
		run: incentive.run,
		active: incentive.active,
		notes: incentive.notes,
	};
	switch (incentive.type) {
		case 'goal':
			return <Goal key={incentive.id} {...runMetadata} {...incentive.data} />;
		case 'war':
			return <War key={incentive.id} {...runMetadata} {...incentive.data} />;
		default:
			return <></>;
	}
}

export default Challenges;
