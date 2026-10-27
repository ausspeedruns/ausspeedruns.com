"use client";

import { Fragment } from "react";
import Link from "next/link";
import { Anchor, Badge, Group, Paper, Progress, Stack, Text, Title } from "@mantine/core";
import type { LiveRun, LiveState } from "#/utilities/events/liveSchedule";
import { formatCurrency } from "#/utilities/formatCurrency";
import { useNow } from "#/utilities/react/useNow";
import { formatDuration, formatRelative, formatStartTime } from "./time";
import styles from "./EventLiveBlock.module.css";

export function Runners({ run }: { run: LiveRun }) {
	if (run.runners.length === 0) return null;
	const separator = run.isRace ? " vs " : ", ";

	return (
		<>
			{run.runners.map((runner, index) => (
				<Fragment key={`${runner.name}-${index}`}>
					{index > 0 ? separator : null}
					{runner.username ? (
						<Anchor component={Link} href={`/user/${runner.username}`} inherit>
							{runner.name}
						</Anchor>
					) : (
						runner.name
					)}
				</Fragment>
			))}
		</>
	);
}

function RunDetails({ run }: { run: LiveRun }) {
	const details = [run.category, run.platform].filter(Boolean).join(" · ");
	return (
		<>
			{details ? <Text c="dimmed">{details}</Text> : null}
			{run.runners.length > 0 ? (
				<Text>
					<Text span c="dimmed">
						{run.runners.length === 1 ? "Runner: " : "Runners: "}
					</Text>
					<Runners run={run} />
				</Text>
			) : null}
		</>
	);
}

/** Ticks every second, isolated so the rest of the block doesn't re-render. */
function Countdown({ target, initialNow }: { target: string; initialNow: number }) {
	const now = useNow(1000, initialNow);
	const remaining = new Date(target).getTime() - now;
	return (
		<span className={styles.numeric} suppressHydrationWarning>
			{remaining <= 0
				? "any moment now"
				: remaining > 6 * 60 * 60 * 1000
					? formatRelative(target, now)
					: `in ${formatDuration(remaining)}`}
		</span>
	);
}

interface NowPlayingProps {
	runs: LiveRun[];
	state: LiveState;
	now: number;
	raised?: number | null;
	scheduleHref: string;
}

export function NowPlaying({ runs, state, now, raised, scheduleHref }: NowPlayingProps) {
	const current = state.currentIndex !== null ? runs[state.currentIndex] : null;
	const next = state.nextIndex !== null ? runs[state.nextIndex] : null;

	if (state.status === "empty") {
		return (
			<Paper withBorder p="lg" className={styles.nowPlaying}>
				<Text c="dimmed">The schedule hasn&apos;t been published yet. Check back soon!</Text>
			</Paper>
		);
	}

	if (state.status === "post") {
		return (
			<Paper withBorder p="lg" className={styles.nowPlaying}>
				<Stack gap="xs" align="center" ta="center">
					<Title order={3}>Thanks for watching!</Title>
					{raised ? (
						<Text size="lg">
							Together we raised{" "}
							<Text span fw={800} className={styles.numeric}>
								{formatCurrency(raised)}
							</Text>
							.
						</Text>
					) : (
						<Text c="dimmed">The event has wrapped up. VODs will be linked on the schedule.</Text>
					)}
					<Anchor component={Link} href={scheduleHref}>
						View the full schedule
					</Anchor>
				</Stack>
			</Paper>
		);
	}

	const isIntermission = current !== null && current.type !== "run";
	const elapsed = current ? now - new Date(current.scheduledTime).getTime() : 0;

	return (
		<Paper withBorder p="lg" className={styles.nowPlaying}>
			<div className={styles.nowPlayingGrid}>
				<Stack gap={6} aria-live="polite">
					<Text className={styles.kicker}>
						{state.status === "pre"
							? "Starting soon"
							: isIntermission
								? "Intermission"
								: current
									? "Now playing"
									: "Setting up"}
					</Text>
					{state.status === "pre" && next ? (
						<>
							<Title order={3} className={styles.runTitle}>
								{next.title}
							</Title>
							<Text>
								First run <Countdown target={next.scheduledTime} initialNow={now} />
							</Text>
						</>
					) : current ? (
						<>
							<Group gap="xs" align="center">
								<Title order={3} className={styles.runTitle}>
									{current.title}
								</Title>
								{current.isRace ? <Badge variant="light">Race</Badge> : null}
								{current.isCoop ? <Badge variant="light">Co-op</Badge> : null}
							</Group>
							{!isIntermission ? <RunDetails run={current} /> : null}
							{current.estimateMs && state.progress !== null ? (
								<Stack gap={4} mt="xs">
									<Progress value={state.progress * 100} size="sm" aria-label="Run progress" />
									<Text size="xs" c="dimmed" className={styles.numeric} suppressHydrationWarning>
										{formatDuration(elapsed)} / {formatDuration(current.estimateMs)} estimate
									</Text>
								</Stack>
							) : null}
						</>
					) : (
						<Text c="dimmed">The next run is being set up.</Text>
					)}
				</Stack>

				{next && state.status !== "pre" ? (
					<Stack gap={4} className={styles.upNext}>
						<Text className={styles.kicker}>Up next</Text>
						<Text fw={700} lh={1.3}>
							{next.title}
						</Text>
						<RunDetails run={next} />
						<Text size="sm" c="dimmed" suppressHydrationWarning>
							{formatStartTime(next.scheduledTime)} ·{" "}
							<Countdown target={next.scheduledTime} initialNow={now} />
						</Text>
					</Stack>
				) : state.status === "pre" && next ? (
					<Stack gap={4} className={styles.upNext}>
						<Text className={styles.kicker}>First up</Text>
						<RunDetails run={next} />
						<Text size="sm" c="dimmed" suppressHydrationWarning>
							{formatStartTime(next.scheduledTime)}
						</Text>
					</Stack>
				) : null}
			</div>
		</Paper>
	);
}
