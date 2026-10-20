import styles from "./day-summary-bar.module.css";

import type { Run, Block } from "../schedule-types";
import { addDays, addSeconds, isAfter, startOfDay } from "date-fns";
import { RunVisualBlock } from "./run";
import { displayZoneOptions, scheduleTimeToDate } from "../time";

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
			const endOfYesterdayRun = addSeconds(
				scheduleTimeToDate(yesterdaysFinalRun.scheduledTime),
				runEstimateToSeconds(yesterdaysFinalRun.estimate),
			);

			const startOfFirstRun = scheduleTimeToDate(props.runs[0].scheduledTime);

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
					const zone = displayZoneOptions(props.eventTimezone, props.showLocalTime);
					const runStart = scheduleTimeToDate(run.scheduledTime);
					const finalRunEnd = addSeconds(runStart, runEstimateToSeconds(run.estimate));
					const nextDayStart = addDays(startOfDay(runStart, zone), 1, zone);

					if (isAfter(finalRunEnd, nextDayStart)) {
						const overlapSeconds = (finalRunEnd.getTime() - nextDayStart.getTime()) / 1000;
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
