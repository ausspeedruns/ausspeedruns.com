import React from "react";
import type { DonationTrackerBlock as DonationTrackerBlockProps, Incentive, Run } from "#/payload-types";
import { getPayload } from "payload";
import configPromise from "#payload-config";
import { getGameName } from "#/utilities/runDisplay";
import { formatCurrency, resolveEvent } from "#/utilities/events/postEventData";
import { Badge, Container, Group, Paper, Progress, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import styles from "./DonationTrackerBlock.module.css";

interface GoalResult {
	kind: "goal";
	goal: number;
	current: number;
	met: boolean;
}

interface WarResult {
	kind: "war";
	options: { name: string; total: number }[];
	total: number;
}

type IncentiveResult = GoalResult | WarResult | null;

function toNumber(value: unknown): number {
	const number = typeof value === "number" ? value : Number(value);
	return Number.isFinite(number) ? number : 0;
}

function parseResult(incentive: Incentive): IncentiveResult {
	const data = incentive.data;
	if (!data || typeof data !== "object" || Array.isArray(data)) return null;
	const record = data as Record<string, unknown>;

	if (incentive.type === "goal") {
		const goal = toNumber(record.goal);
		const current = toNumber(record.current);
		if (goal <= 0) return null;
		return { kind: "goal", goal, current, met: current >= goal };
	}

	if (incentive.type === "war" && Array.isArray(record.options)) {
		const options = record.options
			.filter((option): option is Record<string, unknown> => Boolean(option) && typeof option === "object")
			.map((option) => ({ name: String(option.name ?? ""), total: toNumber(option.total) }))
			.filter((option) => option.name)
			.sort((a, b) => b.total - a.total);
		if (options.length === 0) return null;
		return { kind: "war", options, total: options.reduce((sum, option) => sum + option.total, 0) };
	}

	return null;
}

function runLabel(run: Incentive["run"]): string | null {
	if (!run || typeof run !== "object") return null;
	return `${getGameName(run.game)} – ${run.category}`;
}

function percent(value: number, max: number): number {
	if (max <= 0) return 0;
	return Math.min(100, Math.round((value / max) * 100));
}

function ResultCard({ incentive, result }: { incentive: Incentive; result: Exclude<IncentiveResult, null> }) {
	const label = runLabel(incentive.run);
	const isGoal = result.kind === "goal";

	return (
		<Paper withBorder p="sm" className={styles.card} data-met={isGoal && result.met ? "true" : undefined}>
			<Stack gap="xs">
				<Stack gap={2}>
					{label && (
						<Text size="xs" c="dimmed" truncate="end">
							{label}
						</Text>
					)}
					<Text fw={700} lh={1.3}>
						{incentive.title}
					</Text>
				</Stack>

				{result.kind === "goal" ? (
					<Stack gap={6}>
						<Progress
							value={percent(result.current, result.goal)}
							color={result.met ? "lime" : "gray"}
							size="md"
						/>
						<Group justify="space-between" gap="xs" wrap="nowrap">
							<Text size="sm" c="dimmed" className={styles.numeric}>
								<Text span fw={700} c="bright">
									{formatCurrency(result.current)}
								</Text>{" "}
								/ {formatCurrency(result.goal)}
							</Text>
							<Badge variant="light" color={result.met ? "lime" : "gray"}>
								{result.met ? "Met" : `${percent(result.current, result.goal)}%`}
							</Badge>
						</Group>
					</Stack>
				) : (
					<Stack gap={8}>
						{result.options.map((option, index) => {
							const isWinner = index === 0 && result.total > 0;
							return (
								<Stack key={`${option.name}-${index}`} gap={4}>
									<Group justify="space-between" gap="xs" wrap="nowrap">
										<Group gap={6} wrap="nowrap" className={styles.optionName}>
											{isWinner && (
												<Badge variant="light" color="blue" size="sm">
													Winner
												</Badge>
											)}
											<Text
												size="sm"
												fw={isWinner ? 600 : 400}
												c={isWinner ? undefined : "dimmed"}
											>
												{option.name}
											</Text>
										</Group>
										<Text size="sm" c={isWinner ? undefined : "dimmed"} className={styles.numeric}>
											{formatCurrency(option.total)}
										</Text>
									</Group>
									<Progress
										value={percent(option.total, result.options[0].total)}
										color={isWinner ? "blue" : "gray"}
										size="sm"
									/>
								</Stack>
							);
						})}
					</Stack>
				)}
			</Stack>
		</Paper>
	);
}

function GroupHeader({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<Group justify="space-between" align="baseline" className={styles.groupHeader}>
			<Title order={3} size="h4">
				{title}
			</Title>
			<Text size="sm" c="dimmed">
				{children}
			</Text>
		</Group>
	);
}
export async function DonationTrackerBlock(props: DonationTrackerBlockProps) {
	const { title, displayMode } = props;
	const eventData = await resolveEvent(props.event);
	if (!eventData) return null;

	const isResults = displayMode === "results";
	const payload = await getPayload({ config: configPromise });

	const incentivesRes = await payload.find({
		collection: "incentives",
		where: {
			and: [{ event: { equals: eventData.id } }, ...(isResults ? [] : [{ isActive: { equals: true } }])],
		},
		depth: 2,
		limit: 200,
		pagination: false,
	});

	const results = (incentivesRes.docs as Incentive[])
		.map((incentive) => ({ incentive, result: parseResult(incentive) }))
		.filter(
			(entry): entry is { incentive: Incentive; result: Exclude<IncentiveResult, null> } => entry.result !== null,
		);

	const goals = results.filter((entry) => entry.result.kind === "goal");
	const goalsMet = goals.filter((entry) => entry.result.kind === "goal" && entry.result.met).length;
	const wars = results.filter((entry) => entry.result.kind === "war");

	const sortedGoals = [...goals].sort((a, b) => {
		if (a.result.kind !== "goal" || b.result.kind !== "goal") return 0;
		const aScheduledTime = new Date((a.incentive.run as Run).scheduledTime ?? "").getTime();
		const bScheduledTime = new Date((b.incentive.run as Run).scheduledTime ?? "").getTime();
		return aScheduledTime - bScheduledTime;
	});

	const raised = eventData.postEvent?.raised;

	const renderGrid = (entries: typeof results) => (
		<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="sm">
			{entries.map(({ incentive, result }) => (
				<ResultCard key={incentive.id} incentive={incentive} result={result} />
			))}
		</SimpleGrid>
	);

	return (
		<Container component="section" size="lg">
			<Stack gap="xl">
				{title && (
					<Title order={2} ta="center">
						{title}
					</Title>
				)}

				{!isResults && raised ? (
					<Paper withBorder p="md" className={styles.totalRaised}>
						<Text size="xs" fw={600} tt="uppercase" c="dimmed" ta="center">
							Total raised
						</Text>
						<Text fw={800} className={styles.totalValue} ta="center">
							{formatCurrency(raised)}
						</Text>
					</Paper>
				) : null}

				{results.length === 0 ? (
					<Text c="dimmed" ta="center">
						{isResults ? "No incentives were run for this event." : "No active incentives."}
					</Text>
				) : isResults ? (
					<>
						{sortedGoals.length > 0 ? (
							<Stack gap="sm">
								<GroupHeader title="Donation goals">
									<Text span fw={700} c="lime">
										{goalsMet}
									</Text>{" "}
									of {goals.length} met
								</GroupHeader>
								{renderGrid(sortedGoals)}
							</Stack>
						) : null}
						{wars.length > 0 ? (
							<Stack gap="sm">
								<GroupHeader title="Bid wars">
									<Text span fw={700} c="blue">
										{wars.length}
									</Text>{" "}
									decided
								</GroupHeader>
								{renderGrid(wars)}
							</Stack>
						) : null}
					</>
				) : (
					renderGrid(results)
				)}
			</Stack>
		</Container>
	);
}
