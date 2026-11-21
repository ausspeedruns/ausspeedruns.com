"use client";

import { useMemo, useState } from "react";
import styles from "./Schedule.module.css";
import { format } from "date-fns";

import type { Block, Run, Settings } from "./scheduleTypes";

import { Day } from "./Day";
import { Filters } from "./Filters";
import type { Media as MediaType } from "#payload-types.ts";
import { resolveBlockRuns } from "#utilities/schedule/blocks.ts";
import { BlockLegend } from "./BlockLegend";
import { Media } from "#components/Media/Media.tsx";
import { Box, Button, Checkbox } from "@mantine/core";
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
		blocks: [] as string[],
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
	logoDarkMode?: number | MediaType | null;
	scheduleBlocks: Block[];
	oengus: string;
	horaro: string;
	runs: Run[];
}

export function Schedule(props: ScheduleProps) {
	const [settings, setSettings] = useState(DEFAULT_SETTINGS);

	const scheduleBlocks = useMemo(
		() => generateBlockRunMap(props.scheduleBlocks, props.runs),
		[props.scheduleBlocks, props.runs],
	);

	const runsWithOrder = props.runs.map((run, i) => {
		return { ...run, displayIndex: i };
	});

	return (
		<>
			<header className={styles.headerContent}>
				{props.logo && props.logoDarkMode ? (
					<>
						<Box className={styles.eventLogo} darkHidden>
							<Media resource={props.logo} />
						</Box>
						<Box className={styles.eventLogo} lightHidden>
							<Media resource={props.logoDarkMode} />
						</Box>
					</>
				) : (
					(props.logo || props.logoDarkMode) && (
						<div className={styles.eventLogo}>
							<Media resource={props.logo || props.logoDarkMode} />
						</div>
					)
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
			<BlockLegend
				blocks={props.scheduleBlocks}
				runs={runsWithOrder}
				blockMap={scheduleBlocks}
				eventTimezone={props.time.timezone}
				showLocalTime={settings.showLocalTime}
				selected={settings.filter.blocks}
				onChange={(blocks) => setSettings({ ...settings, filter: { ...settings.filter, blocks } })}
			/>
			<Filters currentSettings={settings} setSettings={setSettings} runs={props.runs} />
			<div className={styles.scheduleContainer}>
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

/** Runs can be in at most one block, so they pair 1-to-1 on a map */
function generateBlockRunMap(blocks: Block[], allRuns: Run[]) {
	const withRanges = blocks.map((block) => ({ ...block, start: block.startRunId, end: block.endRunId }));
	return resolveBlockRuns(
		withRanges,
		allRuns.map((run) => run.id),
	) as Map<number, Block>;
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
