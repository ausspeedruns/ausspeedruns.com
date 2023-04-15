import {
	Chip,
	FormControlLabel,
	FormGroup,
	Switch,
	TextField,
	ThemeProvider,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import Head from "next/head";
import Image from "next/image";
import { gql, ssrExchange, cacheExchange, dedupExchange, fetchExchange, useQuery } from "urql";
import DiscordEmbed from "../../components/DiscordEmbed";
import { format } from "date-fns";

import styles from "../../styles/Schedule.event.module.scss";
import { theme } from "../../components/mui-theme";
import { useEffect, useMemo, useState } from "react";
import { GetServerSideProps } from "next";
import { initUrqlClient } from "next-urql";
import { FilterRuns } from "../../components/run-utils";
import { ScheduleBlock } from "apps/nextjs/components/ScheduleBlock/schedule-block";

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
			runs(orderBy: [{scheduledTime: asc}]) {
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

type EventScheduleProps = {
	event: QUERY_EVENT_RESULTS["event"];
};

// const TEST_CURRENT_TIME = new Date(2025, 6, 9, 16, 25);
export default function EventSchedule({ event }: EventScheduleProps) {
	// console.log(TEST_CURRENT_TIME);
	const [settings, setSettings] = useState(SETTINGS);
	const [currentTime, setCurrentTime] = useState(new Date());
	// const [currentTime] = useState(TEST_CURRENT_TIME);
	const [currentRunIndex, setCurrentRunIndex] = useState(-1);

	const scheduleBlocks = useMemo(() => generateSubmissionBlockMap((JSON.parse(event.scheduleBlocks) ?? []) as Block[], event.runs), [
		event.runs,
		event.scheduleBlocks,
	]);

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

		setSettings({ ...settings, filter: mutableFilter });
	}

	function handleSearchChange(event: { target: { value: any } }) {
		setSettings({
			...settings,
			filter: { ...settings.filter, search: event.target.value },
		});
	}

	function handleConsoleChange(console: string) {
		const index = settings.filter.console.findIndex((consoleEl) => consoleEl === console);

		if (index === -1) {
			setSettings({
				...settings,
				filter: {
					...settings.filter,
					console: [...settings.filter.console, console],
				},
			});
		} else {
			let mutableConsole = [...settings.filter.console];
			mutableConsole.splice(index, 1);
			setSettings({
				...settings,
				filter: { ...settings.filter, console: mutableConsole },
			});
		}
	}

	const consoleFilterElements = [...new Set(event.runs.map((item) => item.platform))].sort().map((console) => {
		if (console === "?") return <></>;
		return (
			<Chip
				key={console}
				color={settings.filter.console.includes(console.toLowerCase()) ? "primary" : "default"}
				label={console}
				aria-label={console}
				onClick={() => handleConsoleChange(console.toLowerCase())}
				clickable
			/>
		);
	});

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
				<div className={styles.columns}>
					<div className={styles.scheduleContainer}>
						<section className={styles.scheduleKey}>
							<h4>Schedule Key</h4>
							<header className={styles.scheduleHeader}>
								<span className={[styles.topRow, styles.notLast].join(" ")}>Time</span>
								<span className={[styles.topRow, styles.notLast].join(" ")}>Game</span>
								<span className={[styles.topRow, styles.notLast].join(" ")}>Category</span>
								<span className={styles.topRow}>Runners</span>
								<span className={styles.notLast}>Estimate (HH:MM)</span>
								<span className={styles.notLast}>Platform</span>
								<span className={styles.donationIncentive}>Donation Incentive</span>
							</header>
						</section>
						{currentRunIndex > -1 && (
							<section className={styles.currentRun}>
								<h3>Currently Running</h3>
								<RunItem
									run={event.runs[currentRunIndex]}
									eventTimezone={event.eventTimezone}
									showLocalTime={settings.showLocalTime}
								/>
							</section>
						)}
						<div className={styles.schedule}>
							{generateRunItems(event.runs, settings, event.eventTimezone, scheduleBlocks)}
						</div>
					</div>
					<aside className={styles.info}>
						<h3>Filters</h3>
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
						<div className={styles.runType}>
							<span>Run Type</span>
							<ToggleButtonGroup
								color="primary"
								value={Object.keys(settings.filter).filter(
									(key) => settings.filter[key as keyof typeof settings.filter],
								)}
								onChange={handleFilterChange}
								aria-label="Run type filter">
								<ToggleButton value="race" aria-label="Race">
									Race
								</ToggleButton>
								<ToggleButton value="coop" aria-label="Co-op">
									Co-op
								</ToggleButton>
								<ToggleButton value="donationIncentive" aria-label="Donation Challenge">
									Donation Challenge
								</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<TextField
							label="Search"
							value={settings.filter.search}
							onChange={handleSearchChange}
							fullWidth
						/>
						<div className={styles.consoleFilters}>
							<span>Platform</span>
							<div className={styles.consoleList}>{consoleFilterElements}</div>
						</div>
					</aside>
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

enum BorderState {
	KEEP_BORDER,
	REMOVE_BORDER,
	IN_BLOCK,
}

function generateRunItems(
	sortedRuns: QUERY_EVENT_RESULTS["event"]["runs"],
	settings: typeof SETTINGS,
	eventTimezone: string,
	blocks: Map<string, Block>,
) {
	let prevDate = 0;

	const filteredRuns = FilterRuns(sortedRuns, settings.filter);
	const runs: JSX.Element[] = [];

	let blockRuns: JSX.Element[] = [];
	let scheduleBlockData: Block | undefined;
	let removedBorder: BorderState = BorderState.KEEP_BORDER;
	let previousBlockData: Block | undefined;

	for (let index = 0; index < filteredRuns.length; index++) {
		const run = filteredRuns[index];
		const runDate = settings.showLocalTime
			? parseInt(
					new Date(run.scheduledTime).toLocaleDateString(undefined, {
						timeZone: eventTimezone,
						day: "numeric",
					}),
			  )
			: parseInt(
					new Date(run.scheduledTime).toLocaleDateString(undefined, {
						day: "numeric",
					}),
			  );

		scheduleBlockData = blocks.get(run.id);

		// Check if we are on a new block, if we are in one check if we were previously in one and post it
		if (scheduleBlockData !== previousBlockData && previousBlockData) {
			runs.push(<ScheduleBlock key={previousBlockData.startRunId + run.id} block={previousBlockData}>{blockRuns}</ScheduleBlock>);

			// Reset for next block
			blockRuns = [];
		}

		if (scheduleBlockData) removedBorder = BorderState.KEEP_BORDER;
		if (!scheduleBlockData && blocks.get(filteredRuns[index + 1]?.id)) removedBorder = BorderState.REMOVE_BORDER;

		if (prevDate !== runDate) {
			// End block if we're at a new day
			// And check that we have runs to post as well... Goodbye Reginald o7
			if (scheduleBlockData && blockRuns.length > 0) {
				runs.push(<ScheduleBlock block={scheduleBlockData}>{blockRuns}</ScheduleBlock>);
				blockRuns = [];
			}

			runs.push(
				<DateDivider
					date={new Date(run.scheduledTime)}
					showLocalTime={settings.showLocalTime}
					eventTimezone={eventTimezone}
					key={runDate}
				/>,
			);
		}

		(scheduleBlockData ? blockRuns : runs).push(
			<RunItem
				key={run.id}
				run={run}
				showLocalTime={settings.showLocalTime}
				eventTimezone={eventTimezone}
				isLive={settings.liveRunId === run.id}
				style={{
					border:	removedBorder === BorderState.REMOVE_BORDER ? "none" : "",
					borderColor: scheduleBlockData ? scheduleBlockData.colour : "",
				}}
			/>,
		);

		prevDate = runDate;
		previousBlockData = scheduleBlockData;
	}

	if (blockRuns.length > 0 && previousBlockData) {
		runs.push(<ScheduleBlock key={previousBlockData.startRunId} block={previousBlockData}>{blockRuns}</ScheduleBlock>);
	}

	return runs;
}

interface DateDividerProps {
	date: Date;
	showLocalTime: boolean;
	eventTimezone: string;
}

const dateDividerOptions: Intl.DateTimeFormatOptions = {
	month: "long",
	day: "2-digit",
};

const DateDivider: React.FC<DateDividerProps> = (props: DateDividerProps) => {
	const dateString = props.showLocalTime
		? props.date.toLocaleDateString(undefined, {
				...dateDividerOptions,
				timeZone: props.eventTimezone,
		  })
		: props.date.toLocaleDateString(undefined, dateDividerOptions);
	return <div className={styles.dateDivider}>{dateString}</div>;
};

interface RunItemProps {
	run: QUERY_EVENT_RESULTS["event"]["runs"][0];
	showLocalTime: boolean;
	eventTimezone: string;
	isLive?: boolean;
	style?: React.CSSProperties;
}

// Runner parsing
function runnerParsing(runnersArray: QUERY_EVENT_RESULTS["event"]["runs"][0]["runners"]) {
	return (
		<div>
			{runnersArray.map((runner, i) => {
				const { username } = runner;
				// If only one name or second last in the list to not include a comma
				if (runnersArray.length === 1 || i === runnersArray.length - 2) {
					return (
						<a key={username} href={`/user/${username}`} target="_blank" rel="noreferrer">
							{username}
						</a>
					);
				}

				// End of names
				if (i === runnersArray.length - 1) {
					return (
						<>
							<span key={`${username}-end`}> and </span>
							<a key={username} href={`/user/${username}`} target="_blank" rel="noreferrer">
								{username}
							</a>
						</>
					);
				}

				return (
					<>
						<a key={username} href={`/user/${username}`} target="_blank" rel="noreferrer">
							{username}
						</a>
						<span key={`${username}-mid`}>, </span>
					</>
				);
			})}
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

	const convertedTimezone = props.showLocalTime
		? new Date(run.scheduledTime).toLocaleTimeString("en-AU", {
				...runItemOptions,
				timeZone: props.eventTimezone,
		  })
		: new Date(run.scheduledTime).toLocaleTimeString("en-AU", runItemOptions);

	if (run.game === "Setup Buffer") {
		return (
			<div className={styles.setupBuffer} key={run.id}>
				{run.estimate.split(":")[1]} min Setup Buffer
			</div>
		);
	}

	let categoryExtras = <></>;
	if (run.race) categoryExtras = <span className={styles.categoryExtras}>RACE </span>;
	if (run.coop) categoryExtras = <span className={styles.categoryExtras}>CO-OP </span>;

	const runClassNames = [styles.run];
	if (props.isLive) runClassNames.push(styles.liveRun);

	return (
		<div className={runClassNames.join(" ")} key={run.id} style={props.style}>
			<span className={styles.time}>{convertedTimezone}</span>
			<span className={styles.game}>{run.game}</span>
			<span className={styles.category}>
				{categoryExtras}
				{run.category}
			</span>
			<span className={styles.runners}>{run.runners.length > 0 ? runnerParsing(run.runners) : run.racer}</span>
			<span className={styles.estimate}>
				{run.estimate.split(":")[0].padStart(2, "0")}:{run.estimate.split(":")[1]}
			</span>
			<span className={styles.platform}>{run.platform}</span>
			<span className={styles.donationIncentive}>
				{run.donationIncentiveObject?.map((incentive) => incentive.title).join(" | ")}
			</span>
		</div>
	);
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const ssrCache = ssrExchange({ isClient: false });
	const client = initUrqlClient(
		{
			url:
				process.env.NODE_ENV === "production"
					? "https://keystone.ausspeedruns.com/api/graphql"
					: "http://localhost:8000/api/graphql",
			exchanges: [dedupExchange, cacheExchange, ssrCache, fetchExchange],
		},
		false,
	);

	if (!client) return { notFound: true };

	const data = await client.query<QUERY_EVENT_RESULTS>(QUERY_EVENT, ctx.params).toPromise();

	if (!data?.data || !data.data.event || data?.error) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			event: data.data.event,
		},
	};
};
