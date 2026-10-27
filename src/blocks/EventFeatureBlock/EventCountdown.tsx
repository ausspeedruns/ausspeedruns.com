"use client";

import { Text, VisuallyHidden } from "@mantine/core";
import { useCountdown } from "#/utilities/react/useCountdown";
import styles from "./EventFeatureBlock.module.css";

const pad = (value: number) => value.toString().padStart(2, "0");
const plural = (value: number, unit: string) => `${value} ${unit}${value === 1 ? "" : "s"}`;

export function EventCountdown({ startTime }: { startTime: string }) {
	const { parts, finished } = useCountdown(startTime);

	if (finished) return null;

	return (
		<Text component="p" fw={700} className={styles.countdown}>
			{parts ? (
				<>
					{/* Screen readers get a readable sentence (without seconds) instead of "87 : 10 : 35 : 00" */}
					<span aria-hidden>
						<span title="Days">{pad(parts.days)}</span> : <span title="Hours">{pad(parts.hours)}</span> :{" "}
						<span title="Minutes">{pad(parts.minutes)}</span> :{" "}
						<span title="Seconds">{pad(parts.seconds)}</span>
					</span>
					<VisuallyHidden>
						Starts in {plural(parts.days, "day")}, {plural(parts.hours, "hour")} and{" "}
						{plural(parts.minutes, "minute")}
					</VisuallyHidden>
				</>
			) : (
				"\u00a0"
			)}
		</Text>
	);
}
