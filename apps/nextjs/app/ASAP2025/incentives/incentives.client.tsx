import styles from "./incentives.module.scss";

import { Goal } from "../../../components/Incentives/IncentiveGoal";
import { War } from "../../../components/Incentives/IncentiveWar";
import Button from 'apps/nextjs/components/Button/Button';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { ReactNode } from "react";
import { QUERY_INCENTIVES_RESULTS } from "./page";

interface IncentivesProps {
	incentivesData: QUERY_INCENTIVES_RESULTS;
}

export function IncentivesClient(props: IncentivesProps) {
	const sortedIncentives = props.incentivesData?.event.donationIncentives.map((a) => ({ ...a })) ?? [];
	sortedIncentives.sort(
		(a, b) => new Date(a.run?.scheduledTime ?? 0).getTime() - new Date(b.run?.scheduledTime ?? 0).getTime(),
	);

	let incentiveElements = {
		active: [] as ReactNode[],
		inactive: [] as ReactNode[],
	};

	sortedIncentives.forEach((incentive) => {
		if (incentive.active) {
			incentiveElements.active.push(getIncentiveElement(incentive));
		} else {
			incentiveElements.inactive.push(getIncentiveElement(incentive));
		}
	});

	return (
		<div className={styles.appIncentives}>
			<main className={styles.content}>
				<h2>Donation Incentives</h2>
				<div className={styles.instructions}>
					In your <span className={styles.emphasis}>donation message</span>, mention the challenge and how
					much you want to put in for it!
				</div>
				<div className={styles.donate}>
					<Button
						actionText="Donate"
						link="/donate"
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

function getIncentiveElement(incentive: any): ReactNode {
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
			return null;
	}
}
