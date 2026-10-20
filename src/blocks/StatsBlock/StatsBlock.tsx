import React from "react";
import type { StatsBlock as StatsBlockProps } from "#/payload-types";
import { Container, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { getAllTimeStats } from "#/utilities/events/allTimeStats";
import { formatCurrency } from "#/utilities/events/postEventData";
import styles from "./StatsBlock.module.css";

export async function StatsBlock(props: StatsBlockProps) {
	const { title, description, showRaised = true, showEvents = true, showRuns = true, extraStats } = props;
	const totals = showRaised || showEvents || showRuns ? await getAllTimeStats() : null;

	const stats: { label: string; value: string; featured?: boolean }[] = [];
	if (totals && showRaised && totals.totalRaised > 0) {
		stats.push({ label: "Raised for charity", value: formatCurrency(totals.totalRaised), featured: true });
	}
	if (totals && showEvents && totals.eventCount > 0) {
		stats.push({ label: "Events", value: totals.eventCount.toLocaleString() });
	}
	if (totals && showRuns && totals.runCount > 0) {
		stats.push({ label: "Runs", value: totals.runCount.toLocaleString() });
	}
	for (const stat of extraStats ?? []) {
		if (stat.label && stat.value) stats.push({ label: stat.label, value: stat.value });
	}

	if (stats.length === 0) return null;

	return (
		<Container component="section" size="lg">
			<Stack gap="lg" align="center">
				{title ? (
					<Title order={2} ta="center">
						{title}
					</Title>
				) : null}
				{description ? (
					<Text c="dimmed" ta="center" maw="60ch">
						{description}
					</Text>
				) : null}
				<SimpleGrid cols={{ base: Math.min(stats.length, 2), sm: Math.min(stats.length, 4) }} spacing="md" w="100%">
					{stats.map((stat) => (
						<Paper key={stat.label} withBorder p="lg" className={stat.featured ? styles.statFeatured : styles.stat}>
							<Text fw={800} className={styles.value}>
								{stat.value}
							</Text>
							<Text size="sm" fw={600} tt="uppercase" c="dimmed" className={styles.label}>
								{stat.label}
							</Text>
						</Paper>
					))}
				</SimpleGrid>
			</Stack>
		</Container>
	);
}
