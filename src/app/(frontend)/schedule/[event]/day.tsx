import styles from "./day.module.css";

import { DateDivider } from "./date-divider";
import { DayVisualiser } from "./day-visualiser/day-summary-bar";
import { RunElement } from "./run";
import { formatScheduleTime } from "./time";

import type { Block, Run, Settings } from "./schedule-types";

type Searchable = Pick<Run, "category" | "game" | "runners" | "otherRunners" | "donationIncentives">;

function isStringInRunData(run: Searchable & { children?: Searchable[] }, searchString: string): boolean {
	const lowerCaseSearchString = searchString.toLowerCase();
	return (
		run.category.toLowerCase().includes(lowerCaseSearchString) ||
		run.game.toLowerCase().includes(lowerCaseSearchString) ||
		[...run.runners, ...(run.otherRunners ?? [])].find((runner) =>
			runner.toLowerCase().includes(lowerCaseSearchString),
		) !== undefined ||
		run.donationIncentives?.find((incentive) => incentive.title.toLowerCase().includes(lowerCaseSearchString)) !==
			undefined ||
		(run.children ?? []).some((child) => isStringInRunData(child, searchString))
	);
}

const platformsOf = (run: Run) =>
	[run.platform, ...(run.children ?? []).map((child) => child.platform)].map((platform) => platform.toLowerCase());

interface Filters {
	race: boolean;
	coop: boolean;
	donationIncentive: boolean;
	search: string;
	console: string[];
}

function FilterRuns(runs: Run[], filters: Filters) {
	// Jesus ChatGPT this is based
	return runs.filter((run) => {
		const children = run.children ?? [];
		if (filters.race && !run.race && !children.some((child) => child.race)) return false;
		if (filters.coop && !run.coop && !children.some((child) => child.coop)) return false;
		if (
			filters.donationIncentive &&
			run.donationIncentives.length === 0 &&
			!children.some((child) => child.donationIncentives.length > 0)
		)
			return false;
		if (filters.search && !isStringInRunData(run, filters.search)) return false;
		if (filters.console.length > 0 && !platformsOf(run).some((platform) => filters.console.includes(platform)))
			return false;
		return true;
	});
}

function runsToDays(runs: Run[], eventTimezone: string, showLocalTime: boolean) {
	let days: Record<string, Run[]> = {};

	for (let i = 0; i < runs.length; i++) {
		const run = runs[i];
		if (run.game === "Intro Speech") {
			console.log(
				run.scheduledTime,
				eventTimezone,
				showLocalTime,
				formatScheduleTime(run.scheduledTime, eventTimezone, showLocalTime, "yyyy-MM-dd'T'HH:mm:ssxxx"),
			);
		}
		const runDate = formatScheduleTime(run.scheduledTime, eventTimezone, showLocalTime, "yyyy-MM-dd");

		if (runDate in days) {
			days[runDate].push(run);
		} else {
			days[runDate] = [run];
		}
	}

	const sortedDays = Object.entries(days).sort((a, b) => {
		return a[0].localeCompare(b[0]);
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
	blocks: Map<number, Block>;
};

export function Day(props: DayProps) {
	const filteredRuns = FilterRuns(props.sortedRuns, props.settings.filter);
	const runDays = runsToDays(filteredRuns, props.eventTimezone, props.settings.showLocalTime);

	return (
		<div className={styles.day}>
			{runDays.map(({ day, runs }, i) => {
				const runDay = new Date(`${day}T00:00:00`);

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
}
