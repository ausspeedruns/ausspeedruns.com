import React from "react";
import type { EventHeroBlock as EventHeroBlockProps } from "#/payload-types";
import { Container, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Media } from "#/components/Media/Media";
import { buildPostEventSummary, formatSecondsAsHours } from "#/utilities/events/postEventSummary";
import { formatCurrency, formatEventDateRange, getEventRuns, resolveEvent } from "#/utilities/events/postEventData";
import { HeroButton } from "./HeroButton";
import styles from "./EventHeroBlock.module.css";

export async function EventHeroBlock(props: EventHeroBlockProps) {
	const { heading, subheading, showDates = true, showRecapStats, links } = props;
	const event = await resolveEvent(props.event);
	if (!event) return null;

	const logo = event.media?.logoDarkMode ?? event.media?.logo;
	const hero = event.media?.hero;
	const dateRange = showDates ? formatEventDateRange(event) : null;

	let stats: { label: string; value: string }[] = [];
	if (showRecapStats) {
		const summary = buildPostEventSummary(await getEventRuns(event.id));
		stats = [
			...(event.postEvent?.raised ? [{ label: "Raised", value: formatCurrency(event.postEvent.raised) }] : []),
			{ label: "Runs", value: summary.totalRuns.toLocaleString() },
			{ label: "Runners", value: summary.uniqueRunnerCount.toLocaleString() },
			{ label: "Run time", value: formatSecondsAsHours(summary.totalRunSeconds) },
		];
	}

	const buttons = (links ?? []).filter((link) => link.label && link.url);
	if (!showRecapStats) {
		if (event.settings?.isAcceptingSubmissions) buttons.push({ label: "Submit a run", url: "/submit-game" });
		if (event.settings?.isAcceptingVolunteers) buttons.push({ label: "Volunteer", url: "/volunteer" });
	}

	return (
		<section className={styles.container} data-full-bleed>
			{hero ? (
				<Media
					alt=""
					className={styles.backdrop}
					pictureClassName={styles.fillPicture}
					imgClassName={styles.backdropImage}
					resource={hero}
					fill
					priority
					size="100vw"
				/>
			) : null}
			<Container size="lg">
				<Stack align="center" gap="sm">
					{logo ? (
						<Media
							// Only name the logo when the heading doesn't already contain the event name
							alt={heading && !heading.includes(event.name) ? event.name : ""}
							className={styles.logoWrap}
							imgClassName={styles.logo}
							resource={logo}
							priority
							size="(max-width: 768px) 80vw, 480px"
						/>
					) : null}
					<Title order={1} ta="center" className={styles.heading}>
						{heading || event.name}
					</Title>
					{subheading ? (
						<Text size="lg" c="dimmed" ta="center" maw="48ch">
							{subheading}
						</Text>
					) : null}
					{dateRange ? (
						<Text size="sm" fw={600} tt="uppercase" c="ausSpeedrunsOrange" className={styles.dates}>
							{dateRange}
						</Text>
					) : null}

					{stats.length > 0 ? (
						<SimpleGrid cols={{ base: 2, sm: stats.length }} spacing="md" w="100%" mt="lg">
							{stats.map((stat) => (
								<Paper
									key={stat.label}
									withBorder
									p="lg"
									className={stat.label === "Raised" ? styles.statFeatured : styles.stat}
								>
									<Text fw={800} className={styles.statValue}>
										{stat.value}
									</Text>
									<Text size="sm" fw={600} tt="uppercase" c="dimmed" className={styles.statLabel}>
										{stat.label}
									</Text>
								</Paper>
							))}
						</SimpleGrid>
					) : null}

					{buttons.length > 0 ? (
						<Group justify="center" gap="sm" mt="lg">
							{buttons.map((button, index) => (
								<HeroButton
									key={`${button.url}-${index}`}
									label={button.label}
									url={button.url}
									primary={index === 0}
								/>
							))}
						</Group>
					) : null}
				</Stack>
			</Container>
		</section>
	);
}
