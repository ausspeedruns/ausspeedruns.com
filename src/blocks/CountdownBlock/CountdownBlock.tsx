"use client";

import React from "react";
import type { CountdownBlock as CountdownBlockProps } from "#/payload-types";
import { useCountdown } from "#/utilities/react/useCountdown";
import styles from "./CountdownBlock.module.css";

export function CountdownBlock(props: CountdownBlockProps) {
	const { title, targetDate, finishedMessage } = props;
	const { parts, finished } = useCountdown(targetDate);

	return (
		<div className={styles.container}>
			{title && <h3>{title}</h3>}
			{finished ? (
				<h2 className={styles.finishedMessage}>{finishedMessage || "Time's up!"}</h2>
			) : (
				<div className={styles.timeLeft}>
					{parts ? `${parts.days}d ${parts.hours}h ${parts.minutes}m ${parts.seconds}s` : "Loading..."}
				</div>
			)}
		</div>
	);
}
