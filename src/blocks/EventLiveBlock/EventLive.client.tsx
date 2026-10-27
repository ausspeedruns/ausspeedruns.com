"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Anchor, Badge, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IncentiveCard } from "#/components/Incentives/IncentiveCard";
import { getLiveState, selectUpcomingIncentives, type LiveData } from "#/utilities/events/liveSchedule";
import { useNow } from "#/utilities/react/useNow";
import { HeroActions } from "./HeroActions";
import { MiniSchedule } from "./MiniSchedule";
import { NowPlaying } from "./NowPlaying";
import { TwitchEmbed } from "./TwitchEmbed";
import { formatRelative } from "./time";
import styles from "./EventLiveBlock.module.css";

const POLL_INTERVAL_MS = 60_000;
const UPCOMING_INCENTIVES = 3;

/** Polls for fresh schedule/incentive data while the tab is visible. Pages are statically rendered, so this is the only way totals stay current. */
function useLiveData(eventId: number, initialData: LiveData): LiveData {
	const [data, setData] = useState(initialData);

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | undefined;
		let controller: AbortController | undefined;

		const load = async () => {
			controller?.abort();
			controller = new AbortController();
			try {
				const response = await fetch(`/next/events/live?event=${eventId}`, { signal: controller.signal });
				if (response.ok) setData((await response.json()) as LiveData);
			} catch {
				// Keep showing the last good data; the next poll will retry.
			}
		};

		const schedule = () => {
			clearTimeout(timer);
			timer = setTimeout(async () => {
				await load();
				schedule();
			}, POLL_INTERVAL_MS);
		};

		const onVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				void load();
				schedule();
			} else {
				clearTimeout(timer);
			}
		};

		void load();
		schedule();
		document.addEventListener("visibilitychange", onVisibilityChange);

		return () => {
			clearTimeout(timer);
			controller?.abort();
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, [eventId]);

	return data;
}

interface EventLiveClientProps {
	eventId: number;
	shortName: string;
	initialData: LiveData;
	renderedAt: number;
	raised?: number | null;
	donateUrl?: string | null;
	/** Server-rendered slots, so media rendering stays on the server. */
	backdrop?: ReactNode;
	eventInfo: ReactNode;
	majorSponsors?: ReactNode;
	minorSponsors?: ReactNode;
}

export function EventLiveClient({
	eventId,
	shortName,
	initialData,
	renderedAt,
	raised,
	donateUrl,
	backdrop,
	eventInfo,
	majorSponsors,
	minorSponsors,
}: EventLiveClientProps) {
	const data = useLiveData(eventId, initialData);
	const now = useNow(15_000, renderedAt);

	const state = useMemo(() => getLiveState(data.runs, now), [data.runs, now]);
	const incentives = useMemo(
		() => selectUpcomingIncentives(data.incentives, now, UPCOMING_INCENTIVES),
		[data.incentives, now],
	);

	const scheduleHref = `/schedule/${shortName}`;
	const incentivesHref = `/incentives/${shortName}`;
	const focusIndex = state.currentIndex ?? state.nextIndex;
	const isLive = state.status === "live" || state.status === "between";

	return (
		<section className={styles.root} data-full-bleed data-backdrop={backdrop ? "image" : "pattern"}>
			{backdrop}
			<div className={styles.hero}>
				<Container size="xl" className={styles.heroInner}>
					<div className={styles.heroInfo}>
						{isLive ? (
							<Badge color="red" variant="filled" size="lg" className={styles.liveBadge}>
								Live now
							</Badge>
						) : null}
						{eventInfo}
					</div>
					<HeroActions donateUrl={donateUrl} scheduleHref={scheduleHref} />
					{majorSponsors ? <div className={styles.heroSponsors}>{majorSponsors}</div> : null}
				</Container>
			</div>

			<div className={styles.body}>
				<Container size="xl">
					<Stack gap="xl">
						<MiniSchedule
							runs={data.runs}
							focusRunId={focusIndex !== null ? data.runs[focusIndex].id : null}
							allPast={state.status === "post"}
							now={now}
							scheduleHref={scheduleHref}
						/>

						<TwitchEmbed />

						<NowPlaying
							runs={data.runs}
							state={state}
							now={now}
							raised={raised}
							scheduleHref={scheduleHref}
						/>

						{incentives.length > 0 ? (
							<section aria-labelledby="event-live-incentives">
								<Group justify="space-between" align="baseline" mb="xs">
									<Title order={3} size="h4" id="event-live-incentives">
										Donation incentives
									</Title>
									<Anchor component={Link} href={incentivesHref} size="sm">
										All incentives
									</Anchor>
								</Group>
								<Text size="sm" c="dimmed" mb="sm">
									Donate and <strong>mention the incentive in your donation message</strong> to put
									your money towards it.
								</Text>
								<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" className={styles.incentives}>
									{incentives.map((incentive) => (
										<IncentiveCard
											key={incentive.id}
											size="sm"
											title={incentive.title}
											runLabel={incentive.runLabel}
											description={incentive.description}
											time={
												incentive.scheduledTime ? (
													<span suppressHydrationWarning>
														{formatRelative(incentive.scheduledTime, now)}
													</span>
												) : undefined
											}
											result={incentive.result}
										/>
									))}
								</SimpleGrid>
							</section>
						) : null}

						{minorSponsors}
					</Stack>
				</Container>
			</div>
		</section>
	);
}
