import styles from "../Schedule.event.module.scss";

import { Run, Block } from "../schedule-types";
import { addSeconds } from "date-fns";
import { RunVisualBlock } from "./run";

function runEstimateToSeconds(estimate: string) {
	return estimate.split(":").reduce((acc, time) => 60 * acc + parseInt(time), 0);
}

type DayVisualiserProps = {
	runs: Run[];
	blocks: Map<string, Block>;
	eventTimezone: string;
	showLocalTime: boolean;
	runDays: {
		day: string;
		runs: Run[];
	}[];
	currentDayIndex: number;
};

export const DayVisualiser = (props: DayVisualiserProps) => {
	let yesterdayRunTime = 0;
	let yesterdaysFinalRun;

	if (props.currentDayIndex != 0) {
		yesterdaysFinalRun = props.runDays[props.currentDayIndex - 1].runs.at(-1);

		if (yesterdaysFinalRun) {
			const endOfYesterdayRun = addSeconds(
				new Date(yesterdaysFinalRun.scheduledTime),
				runEstimateToSeconds(yesterdaysFinalRun.estimate),
			);

			const startOfFirstRun = new Date(props.runs[0].scheduledTime);

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

				if (i == props.runs.length - 1) {
					// If the run goes to the next day, subtract the overlap
					const runScheduledTime = new Date(
						new Date(run.scheduledTime).toLocaleString("en", {
							timeZone: props.showLocalTime ? props.eventTimezone : undefined,
						}),
					);

					const finalRunEndTime = addSeconds(runScheduledTime, runEstimateToSeconds(run.estimate));

					const nextDay = new Date(
						runScheduledTime.getFullYear(),
						runScheduledTime.getMonth(),
						runScheduledTime.getDate(),
					);
					nextDay.setDate(nextDay.getDate() + 1);

					if (nextDay.getDate() === finalRunEndTime.getDate()) {
						const overlapTime = finalRunEndTime.getTime() - nextDay.getTime();
						const overlapSeconds = overlapTime / 1000;
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
};
