"use client";

import { useEffect, useState } from "react";
import styles from "../../../styles/Schedule.event.module.scss";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Button,
	Chip,
	FormControlLabel,
	FormGroup,
	Switch,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	styled,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Image from "next/image";
import { format } from "date-fns";

import type { Block, Settings } from "./schedule-types";

import { RunElement } from "./run";
import { Day } from "./day";
import { Filters } from "./filters";

interface QUERY_EVENT_RESULTS {
	event: {
		id: string;
		shortname: string;
		eventTimezone: string;
		startDate: string;
		endDate: string;
		logo: {
			url: string;
			height: number;
			width: number;
		};
		ogImage?: {
			url: string;
		};
		runs: {
			id: string;
			runners: {
				username: string;
			}[];
			game: string;
			category: string;
			platform: string;
			estimate: string;
			finalTime: string;
			donationIncentiveObject: {
				id: string;
				title: string;
			}[];
			race: boolean;
			racer: string;
			coop: boolean;
			twitchVOD: string;
			youtubeVOD: string;
			scheduledTime: string;
		}[];
		scheduleBlocks: string;
		oengus: string;
		horaro: string;
	};
}

const DEFAULT_SETTINGS: Settings = {
	showLocalTime: false,
	filter: {
		race: false,
		coop: false,
		donationIncentive: false,
		search: "",
		console: [] as string[],
	},
	liveRunId: "",
};

type Run = QUERY_EVENT_RESULTS["event"]["runs"][number] & { order: number };

type ScheduleProps = {
	event: {
		id: string;
		shortname: string;
		eventTimezone: string;
		startDate: string;
		endDate: string;
		logo: {
			url: string;
			height: number;
			width: number;
		};
		ogImage?: {
			url: string;
		};
		runs: {
			id: string;
			runners: {
				username: string;
			}[];
			game: string;
			category: string;
			platform: string;
			estimate: string;
			finalTime: string;
			donationIncentiveObject: {
				id: string;
				title: string;
			}[];
			race: boolean;
			racer: string;
			coop: boolean;
			twitchVOD: string;
			youtubeVOD: string;
			scheduledTime: string;
		}[];
		scheduleBlocks: string;
		oengus: string;
		horaro: string;
	};
};

// const TEST_CURRENT_TIME = new Date(2025, 6, 9, 16, 25);
export function Schedule(props: ScheduleProps) {
	// console.log(TEST_CURRENT_TIME);
	const [settings, setSettings] = useState(DEFAULT_SETTINGS);
	const [currentTime, setCurrentTime] = useState(new Date());
	// const [currentTime] = useState(TEST_CURRENT_TIME);
	const [currentRunIndex, setCurrentRunIndex] = useState(-1);

	const event = props.event;

	const scheduleBlocks = generateSubmissionBlockMap(JSON.parse(props.event.scheduleBlocks) ?? [], props.event.runs);

	// Update the current time every 10 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 10000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (currentTime > new Date(event.startDate) && currentTime < new Date(event.endDate)) {
			let i = 0;
			for (; i < event.runs.length; i++) {
				const run = event.runs[i];
				if (new Date(run.scheduledTime) >= currentTime) break;
			}

			if (event.runs[i - 1]) {
				setCurrentRunIndex(i - 1);
				setSettings({ ...settings, liveRunId: event.runs[i - 1].id });
			}
		}
	}, [currentTime, event.endDate, event.startDate, settings, event.runs]);

	const runsWithOrder = event.runs.map((run, i) => {
		return { ...run, order: i };
	});

	return (
		<>
			<header className={styles.headerContent}>
				{event.logo && (
					<div className={styles.eventLogo}>
						<Image
							src={event.logo.url}
							alt={`${event.shortname} Logo`}
							title={`${event.shortname} Logo`}
							height={event.logo.height}
							width={event.logo.width}
							sizes="100vw"
							style={{
								width: "100%",
								height: "auto",
							}}
						/>
					</div>
				)}

				<p className={styles.eventLabel}>{event.shortname} Schedule</p>
				<p className={styles.eventTimeFrame}>
					{format(new Date(event.startDate), "dd MMMM")} – {format(new Date(event.endDate), "dd MMMM")}
				</p>
			</header>
			<FormGroup>
				<FormControlLabel
					className={styles.localTimeToggle}
					control={
						<Switch
							onChange={(e) =>
								setSettings({
									...settings,
									showLocalTime: e.target.checked,
								})
							}
						/>
					}
					label={`Show in Event Time? (${event.eventTimezone})`}
				/>
			</FormGroup>
			<div className={styles.externalSchedules}>
				{event.horaro && (
					<Button
						variant="outlined"
						endIcon={<OpenInNewIcon />}
						href={event.horaro}
						target="_blank"
						rel="noopener noreferrer">
						Horaro
					</Button>
				)}
				{event.oengus && (
					<Button
						variant="outlined"
						endIcon={<OpenInNewIcon />}
						href={event.oengus}
						target="_blank"
						rel="noopener noreferrer">
						Oengus
					</Button>
				)}
			</div>
			<Filters currentSettings={settings} setSettings={setSettings} runs={event.runs} />
			<div className={styles.scheduleContainer}>
				{currentRunIndex > -1 && (
					<section className={styles.currentRun}>
						<h3>Currently Running</h3>
						<RunElement
							run={runsWithOrder[currentRunIndex]}
							eventTimezone={event.eventTimezone}
							showLocalTime={settings.showLocalTime}
						/>
					</section>
				)}
				<div className={styles.schedule}>
					<div className={styles.dayButtons}>
						{getAllDays(runsWithOrder, event.eventTimezone, settings.showLocalTime).map((day) => {
							const date = new Date(day);
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
									key={day}>
									{format(date, "EEEE")}
									<br />
									{format(date, "LLL d")}
								</Button>
							);
						})}
					</div>
					<Day
						sortedRuns={runsWithOrder}
						settings={settings}
						eventTimezone={event.eventTimezone}
						blocks={scheduleBlocks}
					/>
				</div>
			</div>
		</>
	);
}

function generateSubmissionBlockMap(blocks: Block[], allRuns: QUERY_EVENT_RESULTS["event"]["runs"]) {
	// Runs can only be paired to one or no blocks so we can 1-to-1 pair them on a map
	const blockRunMap = new Map<string, Block>();

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
		const runDate = new Date(runs[i].scheduledTime).toLocaleString("en-US", {
			timeZone: showLocalTime ? eventTimezone : undefined,
			day: "numeric",
			month: "numeric",
			year: "numeric",
		});

		if (!days.includes(runDate)) {
			days.push(runDate);
		}
	}

	days.sort((a, b) => {
		const dateA = new Date(a);
		const dateB = new Date(b);
		return dateA.getTime() - dateB.getTime();
	});

	return days;
}
