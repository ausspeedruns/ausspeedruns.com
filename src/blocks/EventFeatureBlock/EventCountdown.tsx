"use client";

import { Text } from "@mantine/core";
import { useCountdown } from "#/utilities/react/useCountdown";
import styles from "./EventFeatureBlock.module.css";

const pad = (value: number) => value.toString().padStart(2, "0");

export function EventCountdown({ startTime }: { startTime: string }) {
	const { parts, finished } = useCountdown(startTime);

	if (finished) return null;

	return (
		<Text component="p" fw={700} className={styles.countdown} aria-label="Time until the event starts">
			{parts ? (
				<>
					<span title="Days">{pad(parts.days)}</span> : <span title="Hours">{pad(parts.hours)}</span> :{" "}
					<span title="Minutes">{pad(parts.minutes)}</span> : <span title="Seconds">{pad(parts.seconds)}</span>
				</>
			) : (
				"\u00a0"
			)}
		</Text>
	);
}
