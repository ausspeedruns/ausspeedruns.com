import Head from "next/head";
import { gql, useQuery } from "urql";
import styles from "../../styles/Event.incentives.module.scss";

import DiscordEmbed from "../../components/DiscordEmbed";
import { Goal } from "../../components/Incentives/IncentiveGoal";
import { War } from "../../components/Incentives/IncentiveWar";

const EVENT = "ASGX2023";

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

const Challenges = () => {
	const [incentivesQuery] = useQuery<QUERY_INCENTIVES_RESULTS>({
		query: INCENTIVES_QUERY,
	});

	const sortedIncentives =
		incentivesQuery.data?.event.donationIncentives.map((a) => ({ ...a })) ??
		[];
	sortedIncentives.sort(
		(a, b) =>
			new Date(a.run?.scheduledTime ?? 0).getTime() -
			new Date(b.run?.scheduledTime ?? 0).getTime(),
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
				<title>{`${EVENT} Donation Challenges - AusSpeedruns`}</title>
				<DiscordEmbed
					title={`${EVENT} Donation Challenges - AusSpeedruns`}
					pageUrl={`/${EVENT}/challenges`}
				/>
			</Head>
			<main className={styles.content}>
				<h2>Donation Challenges</h2>
				<div className={styles.instructions}>
					In your{" "}
					<span className={styles.emphasis}>donation message</span>,
					mention the challenge and how much you want to put in for
					it!
				</div>
				{incentiveElements.active.length > 0 && (
					<>
						<h3>Closing Soon!</h3>
						<div className={styles.divider} />
						<div className={styles.soon}>
							{incentiveElements.active[0]}
						</div>
						<h3>All Challenges</h3>
						<div className={styles.divider} />
						{incentiveElements.active}
					</>
				)}

				{incentiveElements.inactive.length > 0 && (
					<>
						<h3>Closed Challenges</h3>
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
			return (
				<Goal key={incentive.id} {...runMetadata} {...incentive.data} />
			);
		case "war":
			return (
				<War key={incentive.id} {...runMetadata} {...incentive.data} />
			);
		default:
			return <></>;
	}
}

export default Challenges;
