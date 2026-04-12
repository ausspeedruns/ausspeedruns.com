import React from "react";

import styles from "./PostEventStatsBlock.module.css";

interface PostEventStatsBlockProps {
	title?: string | null;
	totalRuns: number;
	uniqueRunners: number;
	totalRunDuration: string;
	scheduleUrl?: string | null;
	scheduleLabel?: string | null;
}

export function PostEventStatsBlock(props: PostEventStatsBlockProps) {
	const { title, totalRuns, uniqueRunners, totalRunDuration, scheduleUrl, scheduleLabel } = props;

	return (
		<section className={styles.wrapper}>
			{title ? <h2 className={styles.heading}>{title}</h2> : null}
			<div className={styles.grid}>
				<div className={styles.card}>
					<div className={styles.label}>Runs</div>
					<div className={styles.value}>{totalRuns.toLocaleString()}</div>
				</div>
				<div className={styles.card}>
					<div className={styles.label}>Runners</div>
					<div className={styles.value}>{uniqueRunners.toLocaleString()}</div>
				</div>
				<div className={styles.card}>
					<div className={styles.label}>Total run time</div>
					<div className={styles.value}>{totalRunDuration}</div>
				</div>
			</div>
			{scheduleUrl ? (
				<a className={styles.scheduleLink} href={scheduleUrl} target="_blank" rel="noreferrer">
					{scheduleLabel || "View schedule"}
				</a>
			) : null}
		</section>
	);
}
