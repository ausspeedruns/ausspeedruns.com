"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MiniScheduleRun } from "./mini-schedule-run";
import styles from "./mini-schedule.module.css";

import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface MiniScheduleProps {
	runs: {
		game: string;
		runners: string[];
		category: string;
		scheduledTime: string;
	}[];
}

export function MiniSchedule(props: MiniScheduleProps) {
	const [currentTime, setCurrentTime] = useState(() => Date.now());
	const containerRef = useRef<HTMLDivElement>(null);
	const runRefs = useRef<(HTMLDivElement | null)[]>([]);
	const scheduleTimes = props.runs.map((run) => run.scheduledTime).join("|");
	const nextRunIndex = props.runs.findIndex((run) => new Date(run.scheduledTime).getTime() > currentTime);
	const currentRunIndex = Math.max(0, nextRunIndex === -1 ? props.runs.length - 1 : nextRunIndex - 1);

	useEffect(() => {
		const interval = window.setInterval(() => {
			setCurrentTime(Date.now());
		}, 10_000);

		return () => window.clearInterval(interval);
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		const currentRun = runRefs.current[currentRunIndex];

		if (!container || !currentRun) return;

		container.scrollTo({
			left: currentRun.offsetLeft,
			behavior: "smooth",
		});
	}, [currentRunIndex, scheduleTimes]);

	return (
		<div ref={containerRef} className={styles.container}>
			{props.runs.map((run, index) => (
				<div
					key={`${run.scheduledTime}-${index}`}
					ref={(element) => {
						runRefs.current[index] = element;
					}}
				>
					<MiniScheduleRun {...run} />
				</div>
			))}
			<div className={styles.scheduleButton}>
				<Link href="/schedule" passHref>
					<FontAwesomeIcon icon={faCalendar} />
					Schedule
				</Link>
			</div>
		</div>
	);
}
