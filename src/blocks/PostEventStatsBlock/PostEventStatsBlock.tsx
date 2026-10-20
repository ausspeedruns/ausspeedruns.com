import React from "react";
import {
	Accordion,
	AccordionControl,
	AccordionItem,
	AccordionPanel,
	Anchor,
	Container,
	Group,
	Paper,
	ScrollAreaAutosize,
	SimpleGrid,
	Stack,
	Table,
	TableTbody,
	TableTd,
	TableTh,
	TableThead,
	TableTr,
	Text,
	Title,
	VisuallyHidden,
} from "@mantine/core";

import type { PostEventStatsBlock as PostEventStatsBlockProps, Run } from "#/payload-types";
import { relationId } from "#access/helpers.ts";
import { getRunCategoryLabel, getRunDisplayName } from "#/utilities/runDisplay";
import { getEventRuns } from "#/utilities/events/postEventData";
import { buildPostEventSummary, formatSecondsAsHours, getRunnerNames } from "#/utilities/events/postEventSummary";

import styles from "./PostEventStatsBlock.module.css";

function isExternal(url: string) {
	return /^https?:\/\//.test(url);
}

function RunTable({ runs }: { runs: Run[] }) {
	return (
		<ScrollAreaAutosize mah="36rem" type="auto">
			<Table stickyHeader striped highlightOnHover verticalSpacing="xs" horizontalSpacing="md" fz="sm">
				<TableThead>
					<TableTr>
						<TableTh>Game</TableTh>
						<TableTh>Category</TableTh>
						<TableTh>Runner(s)</TableTh>
						<TableTh ta="right">Time</TableTh>
						<TableTh>
							<VisuallyHidden>VOD</VisuallyHidden>
						</TableTh>
					</TableTr>
				</TableThead>
				<TableTbody>
					{runs.map((run) => {
						const time = run.time?.trim();
						return (
							<TableTr key={run.id}>
								<TableTd fw={600}>{getRunDisplayName(run)}</TableTd>
								<TableTd>{getRunCategoryLabel(run)}</TableTd>
								<TableTd>{getRunnerNames(run).join(", ") || "—"}</TableTd>
								<TableTd ta="right" className={styles.numeric}>
									{time || (
										<Text span size="sm" c="dimmed" fs="italic" title="Estimate">
											{run.estimate}
										</Text>
									)}
								</TableTd>
								<TableTd>
									{run.youtube ? (
										<Anchor
											href={run.youtube}
											target="_blank"
											rel="noopener noreferrer"
											size="sm"
											fw={600}
										>
											Watch
										</Anchor>
									) : null}
								</TableTd>
							</TableTr>
						);
					})}
				</TableTbody>
			</Table>
		</ScrollAreaAutosize>
	);
}

export async function PostEventStatsBlock(props: PostEventStatsBlockProps) {
	const { title, showStats = true, showRunList = true, scheduleUrl, scheduleLabel } = props;
	const eventId = relationId(props.event);

	const runs = eventId !== null ? await getEventRuns(eventId) : [];
	const summary = eventId !== null ? buildPostEventSummary(runs) : null;

	const stats = [
		{ label: "Runs", value: (summary?.totalRuns ?? props.totalRuns ?? 0).toLocaleString() },
		{ label: "Runners", value: (summary?.uniqueRunnerCount ?? props.uniqueRunners ?? 0).toLocaleString() },
		{
			label: "Total run time",
			value: summary ? formatSecondsAsHours(summary.totalRunSeconds) : props.totalRunDuration || "—",
		},
		...(summary ? [{ label: "VODs", value: runs.filter((run) => run.youtube).length.toLocaleString() }] : []),
	];

	return (
		<Container component="section" size="lg">
			<Stack gap="md">
				<Group justify="space-between" align="baseline" gap="xs">
					{title ? <Title order={2}>{title}</Title> : null}
					{scheduleUrl ? (
						<Anchor
							href={scheduleUrl}
							fw={600}
							{...(isExternal(scheduleUrl) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
						>
							{scheduleLabel || "View schedule"} →
						</Anchor>
					) : null}
				</Group>

				{showStats ? (
					<SimpleGrid cols={{ base: 2, sm: stats.length }} spacing="sm">
						{stats.map((stat) => (
							<Paper key={stat.label} withBorder p="md" className={styles.card}>
								<Text size="xs" fw={600} tt="uppercase" c="dimmed">
									{stat.label}
								</Text>
								<Text fw={800} className={styles.value}>
									{stat.value}
								</Text>
							</Paper>
						))}
					</SimpleGrid>
				) : null}

				{showRunList && runs.length > 0 ? (
					<Accordion
						variant="contained"
						defaultValue={showStats ? null : "runs"}
						classNames={{ content: styles.runListContent, panel: styles.runListPanel }}
					>
						<AccordionItem value="runs">
							<AccordionControl>
								<Text fw={600}>All {runs.length} runs</Text>
							</AccordionControl>
							<AccordionPanel>
								<RunTable runs={runs} />
							</AccordionPanel>
						</AccordionItem>
					</Accordion>
				) : null}
			</Stack>
		</Container>
	);
}
