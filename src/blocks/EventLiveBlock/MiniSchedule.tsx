"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ActionIcon, Anchor, Group, Text, Title } from "@mantine/core";
import { Calendar2, ChevronLeft, ChevronRight } from "pixelarticons/react";
import type { LiveRun } from "#/utilities/events/liveSchedule";
import { formatRelative, formatStartTime } from "./time";
import styles from "./EventLiveBlock.module.css";

interface MiniScheduleProps {
	runs: LiveRun[];
	/** Id of the run on stream now, or the next one if nothing is on. */
	focusRunId: number | null;
	/** After the event every run is shown as finished. */
	allPast?: boolean;
	now: number;
	scheduleHref: string;
}

export function MiniSchedule({ runs, focusRunId, allPast, now, scheduleHref }: MiniScheduleProps) {
	const trackRef = useRef<HTMLOListElement>(null);
	const hasScrolled = useRef(false);

	// Setup buffers are noise in a compact strip.
	const entries = runs.filter((run) => run.type !== "setupBuffer");
	const focusIndex = allPast ? entries.length : entries.findIndex((run) => run.id === focusRunId);

	useEffect(() => {
		const track = trackRef.current;
		if (!track || focusIndex < 0) return;
		const item = track.children[focusIndex] as HTMLElement | undefined;
		if (!item) return;

		// Leave a sliver of the previous run visible. scrollTo (not scrollIntoView) so the page itself never jumps.
		track.scrollTo({
			left: Math.max(0, item.offsetLeft - 48),
			behavior: hasScrolled.current ? "smooth" : "auto",
		});
		hasScrolled.current = true;
	}, [focusIndex]);

	const scrollBy = (direction: 1 | -1) => {
		const track = trackRef.current;
		if (track) track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
	};

	if (entries.length === 0) return null;

	return (
		<section className={styles.schedule} aria-labelledby="event-live-schedule">
			<Group justify="space-between" align="center" mb="xs">
				<Title order={3} size="h4" id="event-live-schedule">
					Schedule
				</Title>
				<Group gap="xs">
					<ActionIcon variant="default" onClick={() => scrollBy(-1)} aria-label="Scroll schedule back">
						<ChevronLeft />
					</ActionIcon>
					<ActionIcon variant="default" onClick={() => scrollBy(1)} aria-label="Scroll schedule forward">
						<ChevronRight />
					</ActionIcon>
					<Anchor component={Link} href={scheduleHref} size="sm" className={styles.iconLink}>
						<Calendar2 /> Full schedule
					</Anchor>
				</Group>
			</Group>

			<ol ref={trackRef} className={styles.track}>
				{entries.map((run, index) => {
					const state = index < focusIndex ? "past" : index === focusIndex ? "focus" : "upcoming";
					return (
						<li key={run.id} className={styles.scheduleItem} data-state={state}>
							<Text size="xs" c="dimmed" className={styles.numeric} suppressHydrationWarning>
								{formatStartTime(run.scheduledTime)} · {formatRelative(run.scheduledTime, now)}
							</Text>
							<Text fw={700} lh={1.25} lineClamp={2}>
								{run.title}
							</Text>
							{run.category ? (
								<Text size="sm" c="dimmed" lineClamp={1}>
									{run.category}
								</Text>
							) : null}
							{run.runners.length > 0 ? (
								<Text size="sm" lineClamp={1}>
									{run.runners.map((runner) => runner.name).join(run.isRace ? " vs " : ", ")}
								</Text>
							) : null}
						</li>
					);
				})}
			</ol>
		</section>
	);
}
