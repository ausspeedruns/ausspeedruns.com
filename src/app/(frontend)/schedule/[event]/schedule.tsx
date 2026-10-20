"use client";

import { useEffect, useState } from "react";
import styles from "./schedule.module.css";
import { format } from "date-fns";

import type { Block, Run, Settings } from "./schedule-types";

import { RunElement } from "./run";
import { Day } from "./day";
import { Filters } from "./filters";
import type { Event, Media as MediaType } from "#payload-types.ts";
import { Media } from "#components/Media/Media.tsx";
import { Button, Checkbox } from "@mantine/core";
import { formatScheduleTime } from "./time";
import { Open } from "pixelarticons/react";

const DEFAULT_SETTINGS: Settings = {
	showLocalTime: false,
	filter: {
		race: false,
		coop: false,
		donationIncentive: false,
		search: "",
		console: [] as string[],
	},
	liveRunId: -1,
};

interface ScheduleProps {
	eventId: number;
	shortName: string;
	time: {
		start: string;
		end: string;
		timezone: string;
	};
	logo?: number | MediaType | null;
	scheduleBlocks: NonNullable<Event["scheduleMetadata"]>["scheduleBlocks"];
	oengus: string;
	horaro: string;
	runs: Run[];
}

// const TEST_CURRENT_TIME = new Date(2025, 6, 9, 16, 25);
export function Schedule(props: ScheduleProps) {
	// console.log(TEST_CURRENT_TIME);
	const [settings, setSettings] = useState(DEFAULT_SETTINGS);
	const [currentTime, setCurrentTime] = useState(new Date());
	// const [currentTime] = useState(TEST_CURRENT_TIME);
	const [currentRunIndex, setCurrentRunIndex] = useState(-1);

	const scheduleBlocks = generateSubmissionBlockMap(props.scheduleBlocks ?? [], props.runs);

	// Update the current time every 10 seconds
	// useEffect(() => {
	// 	const interval = setInterval(() => {
	// 		setCurrentTime(new Date());
	// 	}, 10000);
	// 	return () => clearInterval(interval);
	// }, []);

	// useEffect(() => {
	// 	if (isAfter(currentTime, props.time.start) && isBefore(currentTime, props.time.end)) {
	// 		let i = 0;
	// 		for (; i < props.runs.length; i++) {
	// 			const run = props.runs[i];
	// 			if (isAfter(scheduleTimeToDate(run.scheduledTime), currentTime)) break;
	// 		}

	// 		if (props.runs[i - 1]) {
	// 			setCurrentRunIndex(i - 1);
	// 			setSettings({ ...settings, liveRunId: props.runs[i - 1].id });
	// 		}
	// 	}
	// }, [currentTime, props.time.end, props.time.start, settings, props.runs]);

	const runsWithOrder = props.runs.map((run, i) => {
		return { ...run, displayIndex: i };
	});

	return (
		<>
			<header className={styles.headerContent}>
				{props.logo && (
					<div className={styles.eventLogo}>
						<Media resource={props.logo} />
					</div>
				)}

				<p className={styles.eventLabel}>{props.shortName} Schedule</p>
				<p className={styles.eventTimeFrame}>
					{format(props.time.start, "dd MMMM")} – {format(props.time.end, "dd MMMM")}
				</p>
			</header>
			<Checkbox
				checked={settings.showLocalTime}
				onChange={(e) =>
					setSettings({
						...settings,
						showLocalTime: e.target.checked,
					})
				}
				label={`Show in Event Time? (${props.time.timezone})`}
			/>
			<div className={styles.externalSchedules}>
				{props.horaro && (
					<Button
						variant="outlined"
						component="a"
						rightSection={<Open />}
						href={props.horaro}
						target="_blank"
						rel="noopener noreferrer"
					>
						Horaro
					</Button>
				)}
				{props.oengus && (
					<Button
						variant="outlined"
						component="a"
						rightSection={<Open />}
						href={props.oengus}
						target="_blank"
						rel="noopener noreferrer"
					>
						Oengus
					</Button>
				)}
			</div>
			<Filters currentSettings={settings} setSettings={setSettings} runs={props.runs} />
			<div className={styles.scheduleContainer}>
				{currentRunIndex > -1 && (
					<section className={styles.currentRun}>
						<h3>Currently Running</h3>
						<RunElement
							run={runsWithOrder[currentRunIndex]}
							eventTimezone={props.time.timezone}
							showLocalTime={settings.showLocalTime}
						/>
					</section>
				)}
				<div className={styles.schedule}>
					<div className={styles.dayButtons}>
						{getAllDays(runsWithOrder, props.time.timezone, settings.showLocalTime).map((day) => {
							const date = new Date(`${day}T00:00:00`);
							return (
								<Button
									variant="outlined"
									fullWidth
									onClick={() => {
										const dayElement = document.querySelector(`#day-${date.getTime() / 1000}`);
										if (dayElement != null) {
											dayElement.scrollIntoView({ behavior: "smooth", block: "start" });
										}
									}}
									key={day}
								>
									{format(date, "EEEE")}
									<br />
									{format(date, "MMM d")}
								</Button>
							);
						})}
					</div>
					<Day
						sortedRuns={runsWithOrder}
						settings={settings}
						eventTimezone={props.time.timezone}
						blocks={scheduleBlocks}
					/>
				</div>
			</div>
		</>
	);
}

function generateSubmissionBlockMap(blocks: Block[], allRuns: Run[]) {
	// Runs can only be paired to one or no blocks so we can 1-to-1 pair them on a map
	const blockRunMap = new Map<number, Block>();

	blocks.forEach((block) => {
		const firstRunIndex = allRuns.findIndex((run) => run.id === block.startRunId);

		if (firstRunIndex === -1) {
			console.log(`${block.name} doesn't have a start run!`);
			return;
		}

		if (block.endRunId) {
			// Find each run in the block
			const endRunIndex = allRuns.findIndex((run) => run.id === block.endRunId);

			if (endRunIndex === -1) {
				console.log(`${block.name} has a run end but we couldn't find it in the runs??? What the fuck?`);
				return;
			}

			for (let runIndex = firstRunIndex; runIndex <= endRunIndex; runIndex++) {
				const run = allRuns[runIndex];
				blockRunMap.set(run.id, block);
			}
		} else {
			// One run for the block
			blockRunMap.set(allRuns[firstRunIndex].id, block);
		}
	});

	return blockRunMap;
}

function getAllDays(runs: Run[], eventTimezone: string, showLocalTime: boolean) {
	let days: string[] = [];

	for (let i = 0; i < runs.length; i++) {
		const runDate = formatScheduleTime(runs[i].scheduledTime, eventTimezone, showLocalTime, "yyyy-MM-dd");

		if (!days.includes(runDate)) {
			days.push(runDate);
		}
	}

	days.sort((a, b) => a.localeCompare(b));

	return days;
}
