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
	ThemeProvider,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	TooltipProps,
	styled,
	tooltipClasses,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PaidIcon from "@mui/icons-material/Paid";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Head from "next/head";
import Image from "next/image";
import DiscordEmbed from "../../../components/DiscordEmbed";
import { format, addSeconds } from "date-fns";
import { getUrqlClient } from "@libs/urql";

import { gql } from "@urql/core";

import styles from "../../../styles/Schedule.event.module.scss";
import theme from "../../../mui-theme";
// import { useEffect, useMemo, useState } from "react";
import { useMemo } from "react";
import { GetServerSideProps } from "next";
import { initUrqlClient } from "next-urql";
import { FilterRuns } from "../../../components/run-utils";

import ConsoleIcon from "../../../styles/img/icons/console.svg";
import RunnerIcon from "../../../styles/img/icons/runner.svg";
import EstimateIcon from "../../../styles/img/icons/stopwatch.svg";
import { notFound } from "next/navigation";

export type Block = {
	name: string;
	colour: string;
	textColour: string;
	startRunId: string;
	endRunId?: string;
};

const QUERY_EVENT = gql`
	query ($event: String) {
		event(where: { shortname: $event }) {
			id
			shortname
			eventTimezone
			startDate
			endDate
			logo {
				url
				height
				width
			}
			ogImage {
				url
			}
			runs(orderBy: [{ scheduledTime: asc }]) {
				id
				runners {
					username
				}
				game
				category
				platform
				estimate
				finalTime
				donationIncentiveObject {
					id
					title
				}
				race
				racer
				coop
				twitchVOD
				youtubeVOD
				scheduledTime
			}
			scheduleBlocks
			oengus
			horaro
		}
	}
`;

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

const SETTINGS = {
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

// const WrappableChip = styled(Chip)(({ theme }) => ({
// 	padding: theme.spacing(1),
// 	height: "100%",
// 	display: "flex",
// 	flexDirection: "row",
// 	"& .MuiChip-label": { overflowWrap: "break-word", whiteSpace: "normal", textOverflow: "clip" },
// }));

type Run = QUERY_EVENT_RESULTS["event"]["runs"][number] & { order: number };

type EventScheduleProps = {
	event: QUERY_EVENT_RESULTS["event"];
};

// const TEST_CURRENT_TIME = new Date(2025, 6, 9, 16, 25);
export default async function EventSchedule({ params }: { params: { event: string } }) {
	const { data } = await getUrqlClient().query<QUERY_EVENT_RESULTS>(QUERY_EVENT, { event: params.event }).toPromise();
	const event = data?.event;

	if (!event) {
		return notFound();
	}

	// console.log(TEST_CURRENT_TIME);
	// const [settings, setSettings] = useState(SETTINGS);
	// const [currentTime, setCurrentTime] = useState(new Date());
	// const [currentTime] = useState(TEST_CURRENT_TIME);
	// const [currentRunIndex, setCurrentRunIndex] = useState(-1);
	const currentTime = new Date();
	const currentRunIndex = -1;
	const settings = SETTINGS;

	const scheduleBlocks = generateSubmissionBlockMap((JSON.parse(event.scheduleBlocks) ?? []) as Block[], event.runs);

	function handleFilterChange(_event: React.MouseEvent<HTMLElement>, newFilter: string[]) {
		const mutableFilter: (typeof SETTINGS)["filter"] = {
			race: false,
			coop: false,
			donationIncentive: false,
			search: settings.filter.search,
			console: settings.filter.console,
		};
		newFilter.forEach((filter) => {
			switch (filter) {
				case "race":
					mutableFilter.race = true;
					break;
				case "coop":
					mutableFilter.coop = true;
					break;
				case "donationIncentive":
					mutableFilter.donationIncentive = true;
					break;
				default:
					break;
			}
		});

		// setSettings({ ...settings, filter: mutableFilter });
	}

	function handleSearchChange(event: { target: { value: any } }) {
		// setSettings({
		// 	...settings,
		// 	filter: { ...settings.filter, search: event.target.value },
		// });
	}

	function handleConsoleChange(console: string) {
		// const index = settings.filter.console.findIndex((consoleEl) => consoleEl === console);
		// if (index === -1) {
		// 	setSettings({
		// 		...settings,
		// 		filter: {
		// 			...settings.filter,
		// 			console: [...settings.filter.console, console],
		// 		},
		// 	});
		// } else {
		// 	let mutableConsole = [...settings.filter.console];
		// 	mutableConsole.splice(index, 1);
		// 	setSettings({
		// 		...settings,
		// 		filter: { ...settings.filter, console: mutableConsole },
		// 	});
		// }
	}

	const consoleFilterElements = [...new Set(event.runs.map((item) => item.platform))].sort().map((console) => {
		if (console === "?") return <></>;
		return (
			<Chip
				key={console}
				color={settings.filter.console.includes(console.toLowerCase()) ? "primary" : "default"}
				label={console}
				aria-label={console}
				// onClick={() => handleConsoleChange(console.toLowerCase())}
				clickable
			/>
		);
	});

	// useEffect(() => {
	// 	const interval = setInterval(() => {
	// 		setCurrentTime(new Date());
	// 	}, 10000);
	// 	return () => clearInterval(interval);
	// }, []);

	// useEffect(() => {
	// 	if (currentTime > new Date(event.startDate) && currentTime < new Date(event.endDate)) {
	// 		let i = 0;
	// 		for (; i < event.runs.length; i++) {
	// 			const run = event.runs[i];
	// 			if (new Date(run.scheduledTime) >= currentTime) break;
	// 		}

	// 		if (event.runs[i - 1]) {
	// 			setCurrentRunIndex(i - 1);
	// 			setSettings({ ...settings, liveRunId: event.runs[i - 1].id });
	// 		}
	// 	}
	// }, [currentTime, event.endDate, event.startDate, settings, event.runs]);

	const runsWithOrder = event.runs.map((run, i) => {
		return { ...run, order: i };
	});

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>{(typeof location !== "undefined" ? event.shortname : "") + " Schedule - AusSpeedruns"}</title>
				<DiscordEmbed title={`${event.shortname} Schedule`} imageSrc={event.ogImage?.url} />
			</Head>
			<main className={styles.content}>
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
							// onChange={(e) =>
							// 	setSettings({
							// 		...settings,
							// 		showLocalTime: e.target.checked,
							// 	})
							// }
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
				<Accordion className={styles.info}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>Filters</AccordionSummary>
					<TextField
						label="Search Game, Runner, Category"
						value={settings.filter.search}
						// onChange={handleSearchChange}
						fullWidth
					/>
					<AccordionDetails>
						<div className={styles.runType}>
							<span>Run Type</span>
							<ToggleButtonGroup
								color="primary"
								value={Object.keys(settings.filter).filter(
									(key) => settings.filter[key as keyof typeof settings.filter],
								)}
								// onChange={handleFilterChange}
								aria-label="Run type filter">
								<ToggleButton value="race" aria-label="Race">
									Race
								</ToggleButton>
								<ToggleButton value="coop" aria-label="Co-op">
									Co-op
								</ToggleButton>
								<ToggleButton value="donationIncentive" aria-label="Donation Incentive">
									Has Donation Incentives
								</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<div className={styles.consoleFilters}>
							<span>Console</span>
							<div className={styles.consoleList}>{consoleFilterElements}</div>
						</div>
					</AccordionDetails>
				</Accordion>
				<div className={styles.scheduleContainer}>
					{currentRunIndex > -1 && (
						<section className={styles.currentRun}>
							<h3>Currently Running</h3>
							<RunItem
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
										// onClick={() => {
										// 	const dayElement = document.querySelector(`#day-${date.getTime() / 1000}`);
										// 	if (dayElement != null) {
										// 		dayElement.scrollIntoView({ behavior: "smooth", block: "start" });
										// 	}
										// }}
										key={day}>
										{format(date, "EEEE")}
										<br />
										{format(date, "LLL d")}
									</Button>
								);
							})}
						</div>
						{generateRunItems(runsWithOrder, settings, event.eventTimezone, scheduleBlocks)}
					</div>
				</div>
			</main>
		</ThemeProvider>
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

function runEstimateToSeconds(estimate: string) {
	return estimate.split(":").reduce((acc, time) => 60 * acc + parseInt(time), 0);
}

enum BorderState {
	KEEP_BORDER,
	REMOVE_BORDER,
	IN_BLOCK,
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

// const RunHover = styled(({ className, odd, block, ...props }: TooltipProps & { odd: boolean; block?: Block }) => (
// 	<Tooltip {...props} classes={{ popper: className }} />
// ))(({ odd, block }) => ({
// 	[`& .${tooltipClasses.tooltip}`]: {
// 		backgroundColor: block?.colour ? `${block.colour}a6` : odd ? "#cc7722a6" : "#437c90a6",
// 		color: block?.textColour ? block.textColour : "#fff",
// 		border: `1px solid ${block?.colour ? block.colour : odd ? "#cc7722" : "#437c90"}`,
// 		backdropFilter: "blur(10px)",
// 		display: "flex",
// 		flexDirection: "column",
// 		alignItems: "center",
// 		maxWidth: 500,
// 	},
// }));

function generateRunItems(
	sortedRuns: Run[],
	settings: typeof SETTINGS,
	eventTimezone: string,
	blocks: Map<string, Block>,
) {
	const filteredRuns = FilterRuns(sortedRuns, settings.filter);
	const runDays = runsToDays(filteredRuns, eventTimezone, settings.showLocalTime);

	return (
		<div className={styles.day}>
			{runDays.map(({ day, runs }, i) => {
				let yesterdayRunTime = 0;
				let yesterdaysFinalRun;

				if (i != 0) {
					yesterdaysFinalRun = runDays[i - 1].runs.at(-1);

					if (yesterdaysFinalRun) {
						const endOfYesterdayRun = addSeconds(
							new Date(yesterdaysFinalRun.scheduledTime),
							runEstimateToSeconds(yesterdaysFinalRun.estimate),
						);

						const startOfFirstRun = new Date(runs[0].scheduledTime);

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
					runs.reduce((acc, run) => acc + Math.max(runEstimateToSeconds(run.estimate), 300), 0) +
					yesterdayRunTime;
				const runDay = new Date(day);

				return (
					<div key={runDay.getTime()} id={`day-${runDay.getTime() / 1000}`} style={{ height: "fit-content" }}>
						<DateDivider date={runDay} />
						<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
							<div className={styles.visualiser}>
								{yesterdayRunTime > 0 && yesterdaysFinalRun && (
									<RunVisualiser
										run={runDays[i - 1].runs.at(-1)!}
										proportion={(yesterdayRunTime / totalSeconds) * 100}
										block={blocks.get(yesterdaysFinalRun.id)}
										key={`spillover-${yesterdaysFinalRun.id}`}
									/>
								)}
								{runs.map((run, i) => {
									let width =
										(Math.max(runEstimateToSeconds(run.estimate), 300) / totalSeconds) * 100;

									if (i == runs.length - 1) {
										// If the run goes to the next day, subtract the overlap
										const runScheduledTime = new Date(
											new Date(run.scheduledTime).toLocaleString("en", {
												timeZone: settings.showLocalTime ? eventTimezone : undefined,
											}),
										);

										const finalRunEndTime = addSeconds(
											runScheduledTime,
											runEstimateToSeconds(run.estimate),
										);

										const nextDay = new Date(
											runScheduledTime.getFullYear(),
											runScheduledTime.getMonth(),
											runScheduledTime.getDate(),
										);
										nextDay.setDate(nextDay.getDate() + 1);

										if (nextDay.getDate() === finalRunEndTime.getDate()) {
											const overlapTime = finalRunEndTime.getTime() - nextDay.getTime();
											const overlapSeconds = overlapTime / 1000;
											width =
												((runEstimateToSeconds(run.estimate) - overlapSeconds) / totalSeconds) *
												100;
										}
									}

									return (
										<RunVisualiser
											run={run}
											proportion={width}
											block={blocks.get(run.id)}
											key={`vis-${run.id}`}
										/>
									);
								})}
							</div>
							<div className={styles.runs}>
								{runs.map((run) => (
									<RunItem
										key={run.id}
										run={run}
										showLocalTime={settings.showLocalTime}
										eventTimezone={eventTimezone}
										isLive={settings.liveRunId === run.id}
										block={blocks.get(run.id)}
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

interface DateDividerProps {
	date: Date;
}

const DateDivider: React.FC<DateDividerProps> = (props: DateDividerProps) => {
	const dateString = format(props.date, "EEEE do, MMMM");
	return (
		// <div className={styles.dateDivider} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
		<div className={styles.dateDivider}>{dateString}</div>
	);
};

interface RunItemProps {
	run: Run;
	showLocalTime: boolean;
	eventTimezone: string;
	isLive?: boolean;
	block?: Block;
	style?: React.CSSProperties;
}

// Runner parsing
function runnerParsing(runnersArray: Run["runners"], key?: string) {
	if (runnersArray.length === 0) {
		return <span key={key}>???</span>;
	}

	const runners = runnersArray.map((runner, i) => {
		const { username } = runner;
		return (
			<a key={`${username}-${key}-${i}`} href={`/user/${username}`} target="_blank" rel="noreferrer">
				{username}
			</a>
		);
	});

	const lastRunner = runners.pop();

	return (
		<div key={key}>
			{runners.length > 0 &&
				runners.reduce((prev, curr) => (
					<>
						{prev}, {curr}
					</>
				))}{" "}
			{runners.length > 0 && "and"} {lastRunner}
		</div>
	);
}

const runItemOptions: Intl.DateTimeFormatOptions = {
	hour12: true,
	minute: "2-digit",
	hour: "2-digit",
};

const RunItem: React.FC<RunItemProps> = (props: RunItemProps) => {
	const { run } = props;

	let convertedTimezone = props.showLocalTime
		? new Date(run.scheduledTime).toLocaleTimeString("en-AU", {
				...runItemOptions,
				timeZone: props.eventTimezone,
			})
		: new Date(run.scheduledTime).toLocaleTimeString("en-AU", runItemOptions);

	if (convertedTimezone[0] === "0") convertedTimezone = convertedTimezone.substring(1);

	if (run.game === "Setup Buffer") {
		return (
			<div className={styles.setupBuffer} key={run.id}>
				{run.estimate.split(":")[1]} min Setup Buffer
			</div>
		);
	}

	let categoryExtras = <></>;
	if (run.race)
		categoryExtras = (
			<span
				className={styles.categoryExtras}
				style={{
					background: props.block && props.block.colour,
					border: props.block && "3px solid #fff",
				}}>
				RACE
			</span>
		);
	if (run.coop)
		categoryExtras = (
			<span
				className={styles.categoryExtras}
				style={{
					background: props.block && props.block.colour,
					border: props.block && "3px solid #fff",
				}}>
				CO-OP
			</span>
		);

	const runClassNames = [styles.run];
	if (props.isLive) runClassNames.push(styles.liveRun);

	const estimateSplit = run.estimate.split(":");
	const hours = parseInt(estimateSplit[0]);
	const minutes = parseInt(estimateSplit[1]);
	const formattedHours = hours.toString();
	const formattedMinutes = minutes.toString().padStart(2, "0");
	const estimateText = `${formattedHours}:${formattedMinutes}:00`;

	// Bad hardcoding bad!
	let overwriteFilter;
	if (props.block) {
		if (props.block.textColour === "#ffffff") {
			overwriteFilter = "invert(100%)";
		} else {
			overwriteFilter = "unset";
		}
	}

	return (
		<div
			className={runClassNames.join(" ")}
			key={run.id}
			style={{ background: props.block?.colour, color: props.block?.textColour, ...props.style }}
			id={run.id}
			run-odd={`${run.order % 2 != 0}`}>
			<span className={styles.time} style={props.block && { background: "white", color: "black" }}>
				{convertedTimezone}
			</span>
			{props.block?.name && <span className={styles.blockName}>{props.block?.name}</span>}
			<span className={styles.game}>{run.game}</span>
			<span className={styles.category} style={{ color: props.block?.textColour }}>
				{categoryExtras}
				{run.category}
			</span>
			<div className={styles.metaData} style={{ color: props.block?.textColour }}>
				<span className={styles.runners}>
					<img src={RunnerIcon.src} style={{ filter: overwriteFilter }} />
					{run.runners.length > 0 ? runnerParsing(run.runners, run.id) : run.racer}
				</span>
				<span className={styles.estimate}>
					<img src={EstimateIcon.src} style={{ filter: overwriteFilter }} />
					{estimateText}
				</span>
				<span className={styles.platform}>
					<img src={ConsoleIcon.src} style={{ filter: overwriteFilter }} />
					{run.platform}
				</span>
			</div>
			{run.donationIncentiveObject && run.donationIncentiveObject.length > 0 && (
				<div
					className={styles.donationIncentives}
					style={{ color: props.block?.textColour, borderColor: props.block && "white" }}>
					<span className={styles.title}>
						<PaidIcon /> Incentives
					</span>
					{run.donationIncentiveObject?.map((incentive) => (
						<span
							className={styles.donationIncentive}
							style={{ color: props.block?.textColour }}
							key={incentive.id}>
							{incentive.title}
						</span>
					))}
				</div>
			)}
		</div>
	);
};

const RunVisualiser = ({ run, proportion, block }: { run: Run; proportion: number; block?: Block }) => {
	const oddRun = run.order % 2 != 0;

	return (
		<Tooltip
			title={
				<div className={styles.visualiserTooltip}>
					{block && <h3>{block.name}</h3>}
					<h1>{run.game}</h1>
					<h2>{run.category}</h2>
					<h3>
						<img src={RunnerIcon.src} />
						{run.runners.length > 0 ? runnerParsing(run.runners, `vis-run-${run.id}`) : run.racer}
					</h3>
				</div>
			}
			run-odd={oddRun.toString()}
			// odd={oddRun}
			// block={block}
		>
			<div
				className={styles.visualiserRun}
				style={{
					width: `calc(${proportion}% - 1px)`,
					background: block && block.colour,
				}}
				// onClick={() => {
				// 	const runElement = document.querySelector(`#${run.id}`);
				// 	if (runElement != null) {
				// 		runElement.scrollIntoView({ behavior: "smooth", block: "center" });
				// 	}
				// }}
			/>
		</Tooltip>
	);
};
