import styles from "./incentives.module.scss";

import { Goal } from "../../../components/Incentives/IncentiveGoal";
import { War } from "../../../components/Incentives/IncentiveWar";
import Button from "apps/nextjs/components/Button/Button";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { ReactNode } from "react";
import { QUERY_INCENTIVES_RESULTS } from "./page";

interface IncentivesProps {
	incentivesData: QUERY_INCENTIVES_RESULTS;
}

export function IncentivesClient(props: IncentivesProps) {
	const sortedIncentives = props.incentivesData.event.donationIncentives.map((incentive) => ({ ...incentive }));
	sortedIncentives.sort(
		(a, b) => new Date(a.run?.scheduledTime ?? 0).getTime() - new Date(b.run?.scheduledTime ?? 0).getTime(),
	);

	const incentiveElements = {
		active: [] as ReactNode[],
		inactive: [] as ReactNode[],
	};

	sortedIncentives.forEach((incentive) => {
		const elements = incentive.active ? incentiveElements.active : incentiveElements.inactive;
		elements.push(getIncentiveElement(incentive));
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
					<Button actionText="Donate" link="/donate" openInNewTab iconRight={faChevronRight} />
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
						{incentiveElements.inactive}
					</>
				)}
			</main>
		</div>
	);
}

function getIncentiveElement(incentive: any): ReactNode {
	const runMetadata = {
		title: incentive.title,
		run: incentive.run,
		active: incentive.active,
		notes: incentive.notes,
	};
	const data = incentive.data;

	switch (incentive.type) {
		case "goal":
			return (
				<>
					<Goal key={incentive.id} {...runMetadata} {...data} />
					<hr />
				</>
			);
		case "war":
			return (
				<>
					<War key={incentive.id} {...runMetadata} {...data} />
					<hr />
				</>
			);
		default:
			return null;
	}
}
