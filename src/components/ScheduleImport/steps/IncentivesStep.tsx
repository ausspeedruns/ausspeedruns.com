"use client";

import {
	Badge,
	Button,
	Card,
	Group,
	NumberInput,
	SegmentedControl,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Textarea,
	Title,
	Tooltip,
} from "@mantine/core";
import { useMemo, useState } from "react";

import { validateIncentiveData, type Goal, type War } from "#/utilities/schedule/incentives.ts";
import { formatInTz } from "#/utilities/schedule/timing.ts";
import type { DraftIncentive, DraftRow } from "#/utilities/schedule/types.ts";
import { runnerNames, useSchedule } from "../context.tsx";
import { newIncentive, updateIncentive } from "../draftOps.ts";

const STATUS_COLOURS: Record<DraftIncentive["status"], string> = {
	pending: "yellow",
	configured: "green",
	skipped: "gray",
};

function IncentiveCard({ incentive }: { incentive: DraftIncentive }) {
	const { update, submissionsById } = useSchedule();
	const patch = (changes: Partial<DraftIncentive>) =>
		update((previous) => updateIncentive(previous, incentive.key, changes));

	const source = incentive.sourceSubmissionId ? submissionsById.get(incentive.sourceSubmissionId) : undefined;
	const valid = incentive.title.trim() !== "" && validateIncentiveData(incentive.data, incentive.type) === true;
	const goal = incentive.data as Goal;
	const war = incentive.data as War;

	return (
		<Card
			withBorder
			padding="md"
			style={{
				borderLeft: `4px solid var(--mantine-color-${STATUS_COLOURS[incentive.status]}-6)`,
				opacity: incentive.status === "skipped" ? 0.65 : undefined,
			}}
		>
			<Stack gap="sm">
				<Group justify="space-between">
					<Group gap="xs">
						<Badge color={STATUS_COLOURS[incentive.status]} variant="light">
							{incentive.status}
						</Badge>
						<Text size="sm" c="dimmed">
							{source ? `Suggested by ${source.runnerUsername}` : "Custom incentive"}
						</Text>
					</Group>
					<Group gap="xs">
						<Tooltip label="Needs a title and a valid goal or options" disabled={valid}>
							<Button
								size="xs"
								color="green"
								variant={incentive.status === "configured" ? "light" : "filled"}
								disabled={!valid}
								onClick={() => patch({ status: "configured" })}
							>
								{incentive.status === "configured" ? "Configured ✓" : "Use incentive"}
							</Button>
						</Tooltip>
						<Button size="xs" variant="default" onClick={() => patch({ status: "skipped" })}>
							Skip
						</Button>
						{!source && (
							<Button
								size="xs"
								color="red"
								variant="subtle"
								onClick={() =>
									update((previous) => ({
										...previous,
										incentives: previous.incentives.filter(
											(candidate) => candidate.key !== incentive.key,
										),
									}))
								}
							>
								Delete
							</Button>
						)}
					</Group>
				</Group>

				<SimpleGrid cols={{ base: 1, sm: 2 }}>
					<TextInput
						label="Title"
						value={incentive.title}
						error={!incentive.title.trim() ? "Required" : undefined}
						onChange={(event) => patch({ title: event.currentTarget.value })}
					/>
					<Stack gap={4}>
						<Text size="sm" fw={500}>
							Type
						</Text>
						<SegmentedControl
							data={[
								{ value: "goal", label: "Goal" },
								{ value: "war", label: "War" },
							]}
							value={incentive.type}
							onChange={(value) => {
								const type = value as DraftIncentive["type"];
								patch({ type, data: type === "goal" ? { goal: 0, current: 0 } : { options: [] } });
							}}
						/>
					</Stack>
				</SimpleGrid>

				<Textarea
					label="Description (public)"
					autosize
					minRows={2}
					value={incentive.description}
					onChange={(event) => patch({ description: event.currentTarget.value })}
				/>
				<TextInput
					label="Notes / instructions for runner and hosts"
					value={incentive.notes}
					onChange={(event) => patch({ notes: event.currentTarget.value })}
				/>

				{incentive.type === "goal" && (
					<NumberInput
						label="Goal"
						prefix="$"
						thousandSeparator=","
						min={0}
						w={200}
						value={Number.isFinite(goal.goal) ? goal.goal : 0}
						onChange={(value) => patch({ data: { current: goal.current ?? 0, goal: Number(value) || 0 } })}
					/>
				)}

				{incentive.type === "war" && (
					<Stack gap="xs">
						<Text size="sm" fw={500}>
							Options
						</Text>
						{(war.options ?? []).map((option, i) => (
							<Group key={i} gap="xs">
								<TextInput
									placeholder="Option name"
									style={{ flex: 1 }}
									value={option.name}
									onChange={(event) => {
										const name = event.currentTarget.value;
										patch({
											data: {
												options: war.options.map((candidate, j) =>
													j === i ? { ...candidate, name } : candidate,
												),
											},
										});
									}}
								/>
								<Button
									variant="subtle"
									color="red"
									onClick={() => patch({ data: { options: war.options.filter((_, j) => j !== i) } })}
								>
									Remove
								</Button>
							</Group>
						))}
						<Group>
							<Button
								size="xs"
								variant="default"
								onClick={() =>
									patch({ data: { options: [...(war.options ?? []), { name: "", total: 0 }] } })
								}
							>
								+ Add option
							</Button>
						</Group>
					</Stack>
				)}
			</Stack>
		</Card>
	);
}

type Filter = "all" | DraftIncentive["status"];

export function IncentivesStep() {
	const { state, update, timed, data, users } = useSchedule();
	const [filter, setFilter] = useState<Filter>("all");
	const [customRow, setCustomRow] = useState<string | null>(null);

	const runRows = useMemo(() => timed.filter((entry) => entry.row.type === "run"), [timed]);
	const counts = useMemo(() => {
		const rowKeys = new Set(state.rows.map((row) => row.key));
		const relevant = state.incentives.filter((incentive) => rowKeys.has(incentive.rowKey));
		return {
			pending: relevant.filter((incentive) => incentive.status === "pending").length,
			configured: relevant.filter((incentive) => incentive.status === "configured").length,
			skipped: relevant.filter((incentive) => incentive.status === "skipped").length,
		};
	}, [state]);

	const header = (row: DraftRow, start: Date) =>
		`${formatInTz(start, data.event.timezone, "EEE h:mm a")} — ${row.gameName} (${row.category}) by ${runnerNames(row, users).join(", ") || "?"}`;

	const groups = runRows
		.map((entry) => ({
			entry,
			incentives: state.incentives.filter(
				(incentive) => incentive.rowKey === entry.row.key && (filter === "all" || incentive.status === filter),
			),
		}))
		.filter((group) => group.incentives.length > 0);

	return (
		<Stack>
			<Text size="sm" c="dimmed">
				Set up the donation incentives runners submitted. Pick a type, fill in the goal or war options, then
				press <strong>Use incentive</strong>. Skipped incentives are not created. Totals already donated are
				kept when the schedule is re-applied.
			</Text>

			<Group align="flex-end">
				<Badge color="green" variant="light" size="lg">
					{counts.configured} configured
				</Badge>
				<Badge color={counts.pending > 0 ? "yellow" : "gray"} variant="light" size="lg">
					{counts.pending} pending
				</Badge>
				<Badge color="gray" variant="light" size="lg">
					{counts.skipped} skipped
				</Badge>
				<SegmentedControl
					value={filter}
					onChange={(value) => setFilter(value as Filter)}
					data={[
						{ value: "all", label: "All" },
						{ value: "pending", label: "Pending" },
						{ value: "configured", label: "Configured" },
						{ value: "skipped", label: "Skipped" },
					]}
				/>
			</Group>

			<Group align="flex-end">
				<Select
					label="Add a custom incentive to"
					placeholder="Choose a run…"
					searchable
					style={{ flex: 1, maxWidth: 600 }}
					data={runRows.map(({ row, start }) => ({ value: row.key, label: header(row, start) }))}
					value={customRow}
					onChange={setCustomRow}
				/>
				<Button
					disabled={!customRow}
					onClick={() => {
						if (!customRow) return;
						update((previous) => ({
							...previous,
							incentives: [...previous.incentives, newIncentive(customRow)],
						}));
						setFilter("all");
					}}
				>
					+ Add
				</Button>
			</Group>

			{groups.length === 0 && <Text c="dimmed">No incentives to show.</Text>}

			{groups.map(({ entry, incentives }) => (
				<Stack key={entry.row.key} gap="sm">
					<Title order={4}>{header(entry.row, entry.start)}</Title>
					{incentives.map((incentive) => (
						<IncentiveCard key={incentive.key} incentive={incentive} />
					))}
				</Stack>
			))}
		</Stack>
	);
}
