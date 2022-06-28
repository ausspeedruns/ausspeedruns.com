import { CircularProgress, FormControlLabel, FormGroup, Switch, ThemeProvider } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { gql, useQuery } from 'urql';
import DiscordEmbed from '../../components/DiscordEmbed';
import Navbar from '../../components/Navbar/Navbar';

import styles from '../../styles/Schedule.event.module.scss';
import { theme } from '../../components/mui-theme';
import { useState } from 'react';
import Footer from '../../components/Footer/Footer';

interface EventData {
	event: {
		id: string;
		shortname: string;
		eventTimezone: string;
		startDate: string;
		logo: {
			url: string;
			height: number;
			width: number;
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
			donationIncentive: string;
			race: boolean;
			coop: boolean;
			twitchVOD: string;
			youtubeVOD: string;
			scheduledTime: string;
		}[];
	};
}

function generateRunItems(sortedRuns: EventData['event']['runs'], showLocalTime: boolean, eventTimezone: string) {
	let prevDate: number;

	return sortedRuns?.map((run) => {
		const runDate = showLocalTime
			? parseInt(new Date(run.scheduledTime).toLocaleDateString(undefined, { timeZone: eventTimezone, day: 'numeric' }))
			: parseInt(new Date(run.scheduledTime).toLocaleDateString(undefined, { day: 'numeric' }));
		if (prevDate !== runDate) {
			prevDate = runDate;
			return (
				<>
					<DateDivider
						date={new Date(run.scheduledTime)}
						showLocalTime={showLocalTime}
						eventTimezone={eventTimezone}
						key={runDate}
					/>
					<RunItem key={run.id} run={run} showLocalTime={showLocalTime} eventTimezone={eventTimezone} />
				</>
			);
		} else {
			prevDate = runDate;
			return <RunItem key={run.id} run={run} showLocalTime={showLocalTime} eventTimezone={eventTimezone} />;
		}
	});
}

const LOGO_HEIGHT = 100;

export default function EventSchedule() {
	const router = useRouter();
	const [showLocalTime, setShowLocalTime] = useState(false);
	const [eventsResult, eventsQuery] = useQuery<EventData>({
		query: gql`
			query ($event: String) {
				event(where: { shortname: $event }) {
					id
					shortname
					eventTimezone
					startDate
					logo {
						url
						height
						width
					}
					runs {
						id
						runners {
							username
						}
						game
						category
						platform
						estimate
						finalTime
						donationIncentive
						race
						coop
						twitchVOD
						youtubeVOD
						scheduledTime
					}
				}
			}
		`,
		variables: {
			event: router.query.event,
		},
		pause: !router.query.event,
	});

	const sortedRuns = eventsResult.data?.event.runs.sort(
		(a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
	);

	const event = eventsResult.data?.event;

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>{router.query.event} Schedule - AusSpeedruns</title>
				<DiscordEmbed title="AusSpeedruns Schedule" />
			</Head>
			<Navbar />
			<main className={styles.content}>
				{eventsResult.fetching && <CircularProgress />}
				{!eventsResult.error && !eventsResult.fetching && event && (
					<>
						{event.logo && (
							<div className={styles.eventLogo}>
								<Image
									src={event.logo.url}
									alt={`${event.shortname} Logo`}
									title={`${event.shortname} Logo`}
									height={event.logo.height}
									width={event.logo.width}
									layout="responsive"
								/>
							</div>
						)}

						<p className={styles.eventLabel}>{event.shortname} Schedule</p>
						<p className={styles.eventTimeFrame}>13 July - 17 July</p>
						<section className={styles.scheduleKey}>
							<h4>Schedule Key</h4>
							<header className={styles.scheduleHeader}>
								<span className={[styles.topRow, styles.notLast].join(' ')}>Time</span>
								<span className={[styles.topRow, styles.notLast].join(' ')}>Game</span>
								<span className={[styles.topRow, styles.notLast].join(' ')}>Category</span>
								<span className={styles.topRow}>Runners</span>
								<span className={styles.notLast}>Estimate (HH:MM)</span>
								<span className={styles.notLast}>Platform</span>
								<span className={styles.donationIncentive}>Donation Incentive</span>
							</header>
						</section>
						<div className={styles.schedule}>
							<FormGroup>
								<FormControlLabel
									className={styles.localTimeToggle}
									control={<Switch onChange={(e) => setShowLocalTime(e.target.checked)} />}
									label={`Show in Event Time? (${event.eventTimezone})`}
								/>
							</FormGroup>
							{generateRunItems(sortedRuns, showLocalTime, event.eventTimezone)}
						</div>
					</>
				)}
			</main>
			<Footer />
		</ThemeProvider>
	);
}

interface DateDividerProps {
	date: Date;
	showLocalTime: boolean;
	eventTimezone: string;
}

const dateDividerOptions: Intl.DateTimeFormatOptions = {
	month: 'long',
	day: '2-digit',
};

const DateDivider: React.FC<DateDividerProps> = (props: DateDividerProps) => {
	const dateString = props.showLocalTime
		? props.date.toLocaleDateString(undefined, { ...dateDividerOptions, timeZone: props.eventTimezone })
		: props.date.toLocaleDateString(undefined, dateDividerOptions);
	return <div className={styles.dateDivider}>{dateString}</div>;
};

interface RunItemProps {
	run: EventData['event']['runs'][0];
	showLocalTime: boolean;
	eventTimezone: string;
}

// Runner parsing
function runnerParsing(runnersArray: EventData['event']['runs'][0]['runners']) {
	return runnersArray.map((runner, i) => {
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
					<span> and </span>
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
				<span>, </span>
			</>
		);
	});
}

const runItemOptions: Intl.DateTimeFormatOptions = {
	hour12: true,
	minute: '2-digit',
	hour: '2-digit',
};

const RunItem: React.FC<RunItemProps> = (props: RunItemProps) => {
	const { run } = props;

	// As much as I want the local timezone to be IN the "en-AU" date format. It would probably fuck people up still or something >:(
	const convertedTimezone = props.showLocalTime
		? new Date(run.scheduledTime).toLocaleTimeString(undefined, { ...runItemOptions, timeZone: props.eventTimezone })
		: new Date(run.scheduledTime).toLocaleTimeString(undefined, runItemOptions);

	if (run.game === 'Setup Buffer') {
		const setupBufferTime = run.estimate;
		return <div className={styles.setupBuffer}>{run.estimate.substring(3, 5)} min Setup Buffer</div>;
	}

	let categoryExtras = <></>;
	if (run.race) categoryExtras = <span className={styles.categoryExtras}>RACE </span>;
	if (run.coop) categoryExtras = <span className={styles.categoryExtras}>COOP </span>;

	return (
		<div className={styles.run}>
			<span className={styles.time}>{convertedTimezone}</span>
			<span className={styles.game}>{run.game}</span>
			<span className={styles.category}>
				{categoryExtras}
				{run.category}
			</span>
			<span className={styles.runners}>{runnerParsing(run.runners)}</span>
			<span className={styles.estimate}>{run.estimate.substring(0, 5)}</span>
			<span className={styles.platform}>{run.platform}</span>
			<span className={styles.donationIncentive}>{run.donationIncentive}</span>
		</div>
	);
};
