import Head from "next/head";
import { gql, useQuery } from "urql";
import styles from "../../styles/Event.incentives.module.scss";

import DiscordEmbed from "../../components/DiscordEmbed";
import { Goal } from "../../components/Incentives/IncentiveGoal";
import { War } from "../../components/Incentives/IncentiveWar";
import Button from 'apps/nextjs/components/Button/Button';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const EVENT = "ASM2023";

const INCENTIVES_QUERY = gql`
	query {
		event(where: { shortname: "${EVENT}" }) {
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

type QUERY_INCENTIVES_RESULTS = {
	event: {
		donationIncentives: {
			id: string;
			title: string;
			notes: string;
			type: string;
			run: {
				id: string;
				game: string;
				category: string;
				scheduledTime: string;
			};
			data: string;
			active: string;
		}[];
	};
};

const Incentives = () => {
	const [incentivesQuery] = useQuery<QUERY_INCENTIVES_RESULTS>({
		query: INCENTIVES_QUERY,
	});

	const sortedIncentives = incentivesQuery.data?.event.donationIncentives.map((a) => ({ ...a })) ?? [];
	sortedIncentives.sort(
		(a, b) => new Date(a.run?.scheduledTime ?? 0).getTime() - new Date(b.run?.scheduledTime ?? 0).getTime(),
	);

	let incentiveElements = {
		active: [] as JSX.Element[],
		inactive: [] as JSX.Element[],
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
				<title>{`${EVENT} Donation Incentives - AusSpeedruns`}</title>
				<DiscordEmbed title={`${EVENT} Donation Incentives - AusSpeedruns`} pageUrl={`/${EVENT}/incentives`} />
			</Head>
			<main className={styles.content}>
				<h2>Donation Incentives</h2>
				<div className={styles.instructions}>
					In your <span className={styles.emphasis}>donation message</span>, mention the challenge and how
					much you want to put in for it!
				</div>
				<div className={styles.donate}>
					<Button
						actionText="Donate"
						link="https://donate.tiltify.com/@ausspeedruns/asm2023"
						openInNewTab
						iconRight={faChevronRight}
					/>
				</div>
				{incentiveElements.active.length > 0 && (
					<>
						<h1>Closing Soon!</h1>
						<div className={styles.divider} />
						<div className={styles.soon}>{incentiveElements.active[0]}</div>
						<h1>All Incentives</h1>
						<div className={styles.divider} />
						{incentiveElements.active}
					</>
				)}

				{incentiveElements.inactive.length > 0 && (
					<>
						<h1>Closed Incentives</h1>
						<div className={styles.divider} />
						{/* All closed incentives */}
						{incentiveElements.inactive}
					</>
				)}
			</main>
		</div>
	);
};

function getIncentiveElement(incentive: any): JSX.Element {
	const runMetadata = {
		title: incentive.title,
		run: incentive.run,
		active: incentive.active,
		notes: incentive.notes,
	};
	switch (incentive.type) {
		case "goal":
			return <><Goal key={incentive.id} {...runMetadata} {...incentive.data} /><hr /></>;
		case "war":
			return <><War key={incentive.id} {...runMetadata} {...incentive.data} /><hr /></>;
		default:
			return <></>;
	}
}

export default Incentives;
