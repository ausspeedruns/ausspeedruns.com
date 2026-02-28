import React from "react";
import type { DonationTrackerBlock as DonationTrackerBlockProps, Incentive } from "#/payload-types";
import { getPayload } from "payload";
import configPromise from "#payload-config";
import styles from "./DonationTrackerBlock.module.css";

export async function DonationTrackerBlock(props: DonationTrackerBlockProps) {
	const { event, title } = props;
	if (!event) return null;

	const eventId = typeof event === "object" ? event.id : event;
	const eventData = typeof event === "object" ? event : null;

	const payload = await getPayload({ config: configPromise });

	const incentivesRes = await payload.find({
		collection: "incentives",
		where: {
			event: { equals: eventId },
		},
		limit: 100,
	});

	const incentives = incentivesRes.docs as Incentive[];

	return (
		<div className={styles.container}>
			{title && <h2 className={styles.title}>{title}</h2>}
			{eventData?.postEvent?.raised && (
				<div className={styles.totalRaised}>Total Raised: ${eventData.postEvent.raised.toLocaleString()}</div>
			)}
			{incentives.length > 0 ? (
				<div className={styles.grid}>
					{incentives.map((inc) => (
						<div key={inc.id} className={styles.card}>
							<h3>{inc.title}</h3>
							<p>{inc.notes}</p>
						</div>
					))}
				</div>
			) : (
				<p className={styles.noIncentives}>No active incentives found.</p>
			)}
		</div>
	);
}
