import React from "react";
import type { DonationTrackerBlock as DonationTrackerBlockProps, Incentive, Run } from "#/payload-types";
import { getPayload } from "payload";
import configPromise from "#payload-config";
import { formatCurrency, resolveEvent } from "#/utilities/events/postEventData";
import {
	getIncentiveDescription,
	getIncentiveRunLabel,
	parseIncentiveResult,
	type IncentiveResult,
} from "#/utilities/events/incentiveResults";
import { IncentiveCard } from "#/components/Incentives/IncentiveCard";
import { Container, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import styles from "./DonationTrackerBlock.module.css";

type ParsedEntry = { incentive: Incentive; result: IncentiveResult };

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
		.map((incentive) => ({ incentive, result: parseIncentiveResult(incentive) }))
		.filter((entry): entry is ParsedEntry => entry.result !== null);

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
		<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="sm" className={styles.grid}>
			{entries.map(({ incentive, result }) => (
				<IncentiveCard
					key={incentive.id}
					size="sm"
					title={incentive.title}
					runLabel={getIncentiveRunLabel(incentive.run)}
					description={getIncentiveDescription(incentive)}
					scheduledTime={typeof incentive.run === "object" ? incentive.run?.scheduledTime : null}
					isActive={incentive.isActive ?? true}
					result={result}
				/>
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
