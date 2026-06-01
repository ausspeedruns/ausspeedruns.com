import styles from "./day-summary-bar.module.css";

import type { Run, Block } from "../schedule-types";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { RunVisualBlock } from "./run";
import { scheduleTimeToDisplayZone, scheduleTimeToLocalDate } from "../time";

dayjs.extend(utc);
dayjs.extend(timezone);

function runEstimateToSeconds(estimate: string) {
	return estimate.split(":").reduce((acc, time) => 60 * acc + parseInt(time), 0);
}

type DayVisualiserProps = {
	runs: Run[];
	blocks: Map<number, Block>;
	eventTimezone: string;
	showLocalTime: boolean;
	runDays: {
		day: string;
		runs: Run[];
	}[];
	currentDayIndex: number;
};

export function DayVisualiser(props: DayVisualiserProps) {
	let yesterdayRunTime = 0;
	let yesterdaysFinalRun;

	if (props.currentDayIndex !== 0) {
		yesterdaysFinalRun = props.runDays[props.currentDayIndex - 1].runs.at(-1);

		if (yesterdaysFinalRun) {
			const endOfYesterdayRun = scheduleTimeToLocalDate(yesterdaysFinalRun.scheduledTime)
				.add(runEstimateToSeconds(yesterdaysFinalRun.estimate), "second")
				.toDate();

			const startOfFirstRun = scheduleTimeToLocalDate(props.runs[0].scheduledTime).toDate();

			const timeBetweenRuns = new Date(startOfFirstRun.getTime() - endOfYesterdayRun.getTime());
			const timeBetweenRunsSeconds = timeBetweenRuns.getTime() / (1000 * 60);

			if (timeBetweenRunsSeconds <= 30) {
				// Within 30 minutes, calculate the time difference to add to the start of the day
				const startOfToday = new Date(
					startOfFirstRun.getFullYear(),
					startOfFirstRun.getMonth(),
					startOfFirstRun.getDate(),
				);
				const yesterdayRunExtraTime = endOfYesterdayRun.getTime() - startOfToday.getTime();
				yesterdayRunTime = yesterdayRunExtraTime / 1000;
			}
		}
	}

	const totalSeconds =
		props.runs.reduce((acc, run) => acc + Math.max(runEstimateToSeconds(run.estimate), 300), 0) + yesterdayRunTime;

	return (
		<div className={styles.visualiser}>
			{yesterdayRunTime > 0 && yesterdaysFinalRun && (
				<RunVisualBlock
					run={yesterdaysFinalRun}
					proportion={(yesterdayRunTime / totalSeconds) * 100}
					block={props.blocks.get(yesterdaysFinalRun.id)}
					key={`spillover-${yesterdaysFinalRun.id}`}
				/>
			)}
			{props.runs.map((run, i) => {
				let width = (Math.max(runEstimateToSeconds(run.estimate), 300) / totalSeconds) * 100;

				if (i === props.runs.length - 1) {
					// If the run goes to the next day in the selected display timezone, subtract the overlap.
					const runScheduledMoment = scheduleTimeToDisplayZone(
						run.scheduledTime,
						props.eventTimezone,
						props.showLocalTime,
					);
					const finalRunEndMoment = runScheduledMoment.add(runEstimateToSeconds(run.estimate), "second");
					const nextDayMoment = runScheduledMoment.startOf("day").add(1, "day");

					if (finalRunEndMoment.isAfter(nextDayMoment)) {
						const overlapSeconds = finalRunEndMoment.diff(nextDayMoment, "second", true);
						width = ((runEstimateToSeconds(run.estimate) - overlapSeconds) / totalSeconds) * 100;
					}
				}

				return (
					<RunVisualBlock
						run={run}
						proportion={width}
						block={props.blocks.get(run.id)}
						key={`vis-${run.id}`}
					/>
				);
			})}
		</div>
	);
}
