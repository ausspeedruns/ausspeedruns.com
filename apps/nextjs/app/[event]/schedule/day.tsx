import styles from "./Schedule.event.module.scss";

import { FilterRuns } from "../../../components/run-utils";
import { DateDivider } from "./date-divider";
import { DayVisualiser } from "./day-visualiser/day-summary-bar";
import { RunElement } from "./run";

import type { Block, Run, Settings } from "./schedule-types";

function runsToDays(runs: Run[], eventTimezone: string, showLocalTime: boolean) {
	let days: Record<string, Run[]> = {};

	for (let i = 0; i < runs.length; i++) {
		const run = runs[i];
		const runDate = new Date(run.scheduledTime).toLocaleString("en-US", {
			timeZone: showLocalTime ? eventTimezone : undefined,
			day: "numeric",
			month: "numeric",
			year: "numeric",
		});

		if (runDate in days) {
			days[runDate].push(run);
		} else {
			days[runDate] = [run];
		}
	}

	const sortedDays = Object.entries(days).sort((a, b) => {
		const dateA = new Date(a[0]);
		const dateB = new Date(b[0]);
		return dateA.getTime() - dateB.getTime();
	});

	return sortedDays.map(([day, runs]) => ({
		day,
		runs,
	}));
}

type DayProps = {
	sortedRuns: Run[];
	settings: Settings;
	eventTimezone: string;
	blocks: Map<string, Block>;
};

export const Day = (props: DayProps) => {
	const filteredRuns = FilterRuns(props.sortedRuns, props.settings.filter);
	const runDays = runsToDays(filteredRuns, props.eventTimezone, props.settings.showLocalTime);

	return (
		<div className={styles.day}>
			{runDays.map(({ day, runs }, i) => {
				const runDay = new Date(day);

				return (
					<div key={runDay.getTime()} id={`day-${runDay.getTime() / 1000}`} style={{ height: "fit-content" }}>
						<DateDivider date={runDay} />
						<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
							<DayVisualiser
								runs={runs}
								blocks={props.blocks}
								eventTimezone={props.eventTimezone}
								showLocalTime={props.settings.showLocalTime}
								runDays={runDays}
								currentDayIndex={i}
							/>
							<div className={styles.runs}>
								{runs.map((run) => (
									<RunElement
										key={run.id}
										run={run}
										showLocalTime={props.settings.showLocalTime}
										eventTimezone={props.eventTimezone}
										isLive={props.settings.liveRunId === run.id}
										block={props.blocks.get(run.id)}
									/>
								))}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};
