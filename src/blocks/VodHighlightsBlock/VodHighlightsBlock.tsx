import React from "react";
import { Anchor, Badge, Card, CardSection, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";

import type { Run, VodHighlightsBlock as VodHighlightsBlockProps } from "#/payload-types";
import { relationId } from "#access/helpers.ts";
import { getGameName, getYouTubeVideoId } from "#/utilities/runDisplay";
import { getEventRuns } from "#/utilities/events/postEventData";
import { getRunnerNames } from "#/utilities/events/postEventSummary";

import styles from "./VodHighlightsBlock.module.css";

export async function VodHighlightsBlock(props: VodHighlightsBlockProps) {
	const { title, specificRuns, limit, playlistUrl } = props;
	const eventId = relationId(props.event);

	const picked = (specificRuns ?? []).filter((run): run is Run => typeof run === "object" && run !== null);
	const source = picked.length > 0 ? picked : eventId !== null ? await getEventRuns(eventId) : [];

	const vods = source
		.map((run) => ({ run, videoId: getYouTubeVideoId(run.youtube) }))
		.filter((entry): entry is { run: Run; videoId: string } => entry.videoId !== null)
		.slice(0, limit ?? 6);

	if (vods.length === 0) return null;

	return (
		<Container component="section" size="lg">
			<Stack gap="md">
				<Group justify="space-between" align="baseline" gap="xs">
					{title ? <Title order={2}>{title}</Title> : null}
					{playlistUrl ? (
						<Anchor href={playlistUrl} target="_blank" rel="noopener noreferrer" fw={600}>
							View all VODs →
						</Anchor>
					) : null}
				</Group>
				<SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="md">
					{vods.map(({ run, videoId }) => {
						const runners = getRunnerNames(run).join(", ");
						return (
							<Card
								key={run.id}
								component="a"
								href={`https://www.youtube.com/watch?v=${videoId}`}
								target="_blank"
								rel="noopener noreferrer"
								withBorder
								padding="sm"
								className={styles.card}
							>
								<CardSection className={styles.thumb}>
									<img
										src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
										alt=""
										loading="lazy"
										className={styles.thumbImage}
									/>
									<span className={styles.play} aria-hidden="true" />
									{run.time ? (
										<Badge color="dark" variant="filled" className={styles.time}>
											{run.time}
										</Badge>
									) : null}
								</CardSection>
								<Text fw={700} mt="sm" lh={1.3}>
									{getGameName(run.game)}
								</Text>
								<Text size="sm" c="dimmed">
									{run.category}
									{runners ? ` · ${runners}` : ""}
								</Text>
							</Card>
						);
					})}
				</SimpleGrid>
			</Stack>
		</Container>
	);
}
