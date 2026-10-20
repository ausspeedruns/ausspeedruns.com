"use client";

import {
	Badge,
	Button,
	Card,
	Checkbox,
	Code,
	Group,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Textarea,
	Title,
} from "@mantine/core";
import { useMemo } from "react";

import {
	findDuplicateSubmissionLinks,
	matchRacerTextToUsers,
	mergeSpecialRequirements,
	suggestPartners,
} from "#/utilities/schedule/pairing.ts";
import { eventDayIndex, formatInTz, type TimedRow } from "#/utilities/schedule/timing.ts";
import type { DraftRow, SubmissionSummary } from "#/utilities/schedule/types.ts";
import { RunnerPicker } from "../components/RunnerPicker.tsx";
import { useSchedule } from "../context.tsx";
import { deleteRow, linkSubmission, unlinkSubmission, updateRow } from "../draftOps.ts";

function Requirements({ text }: { text: string }) {
	return (
		<Code block style={{ whiteSpace: "pre-wrap" }}>
			{text || "None"}
		</Code>
	);
}

function SubmissionDetails({
	submission,
	dayIndex,
	onRemove,
}: {
	submission: SubmissionSummary;
	dayIndex: number | null;
	onRemove?: () => void;
}) {
	const available = dayIndex === null ? null : submission.availability[dayIndex];

	return (
		<Paper withBorder p="sm" style={{ borderStyle: "dashed" }}>
			<Stack gap={4}>
				<Group justify="space-between">
					<Text fw={600} size="sm">
						{submission.runnerUsername} — {submission.category} ({submission.estimate})
					</Text>
					{onRemove && (
						<Button size="compact-xs" variant="subtle" color="red" onClick={onRemove}>
							Unlink
						</Button>
					)}
				</Group>
				<Text size="xs" c="dimmed">
					Submission #{submission.id} ·{" "}
					{submission.raceType === "only" ? "Race/co-op only" : "Race/co-op or solo"}
					{submission.isCoop ? " · Co-op" : ""}
					{submission.racer ? ` · Racer: "${submission.racer}"` : ""}
					{submission.techPlatform ? ` · Tech: ${submission.techPlatform}` : ""}
				</Text>
				{(available === false || available === undefined) && dayIndex !== null && (
					<Text size="xs" c="yellow">
						⚠ Not available that day
					</Text>
				)}
				<Text size="xs" c="dimmed">
					Special requirements:
				</Text>
				<Requirements text={submission.specialRequirements} />
			</Stack>
		</Paper>
	);
}

function PairingCard({ timedRow, index }: { timedRow: TimedRow<DraftRow>; index: number }) {
	const { row, start } = timedRow;
	const { state, update, data, submissionsById, users } = useSchedule();
	const tz = data.event.timezone;
	const dayIndex = data.event.startTime ? eventDayIndex(start, data.event.startTime, tz) : null;

	const linked = row.submissionIds
		.map((id) => submissionsById.get(id))
		.filter((submission): submission is SubmissionSummary => Boolean(submission));
	const suggestions = useMemo(() => suggestPartners(row, data.submissions).slice(0, 5), [row, data.submissions]);
	const userMatches = useMemo(
		() =>
			matchRacerTextToUsers(
				row,
				[...users].map(([id, username]) => ({ id, username })),
			),
		[row, users],
	);

	// Other rows a suggested submission is already scheduled as (e.g. both racers' rows were imported)
	const rowsBySubmission = useMemo(() => {
		const map = new Map<number, { key: string; index: number }>();
		state.rows.forEach((candidate, i) => {
			if (candidate.key === row.key) return;
			for (const id of candidate.submissionIds) map.set(id, { key: candidate.key, index: i });
		});
		return map;
	}, [state.rows, row.key]);

	const merged = mergeSpecialRequirements(linked);
	const patch = (changes: Partial<DraftRow>) => update((previous) => updateRow(previous, row.key, changes));

	return (
		<Card
			withBorder
			padding="md"
			style={{
				borderLeft: `4px solid var(--mantine-color-${row.pairingConfirmed ? "green" : "yellow"}-6)`,
			}}
		>
			<Stack>
				<Group justify="space-between">
					<Title order={4}>
						#{index + 1} {row.gameName} — {row.category}
					</Title>
					<Text size="sm" c="dimmed">
						{formatInTz(start, tz, "ddd D MMM, h:mm A")} · {row.estimate}
					</Text>
				</Group>

				<Group>
					<Checkbox
						label="Co-op (not a race)"
						checked={row.isCoop}
						onChange={(event) => patch({ isCoop: event.currentTarget.checked })}
					/>
					<Button
						size="xs"
						variant="default"
						onClick={() => patch({ isRace: false, isCoop: false, pairingConfirmed: true })}
					>
						Schedule as solo run
					</Button>
				</Group>

				<SimpleGrid cols={{ base: 1, md: 2 }}>
					<Stack gap="xs">
						<Text fw={600}>Linked submissions</Text>
						{linked.length === 0 && (
							<Text size="sm" c="dimmed">
								None
							</Text>
						)}
						{linked.map((submission, i) => (
							<SubmissionDetails
								key={submission.id}
								submission={submission}
								dayIndex={dayIndex}
								onRemove={
									i === 0
										? undefined
										: () =>
												update((previous) =>
													unlinkSubmission(previous, row.key, submission, data.submissions),
												)
								}
							/>
						))}
					</Stack>

					<Stack gap="xs">
						<Text fw={600}>Suggested partners</Text>
						{suggestions.length === 0 && userMatches.length === 0 && (
							<Text size="sm" c="dimmed">
								No matching submissions found{row.racerHint ? ` for "${row.racerHint}"` : ""}. Add
								runners manually below.
							</Text>
						)}
						{suggestions.map(({ submission, score, reasons }) => {
							const otherRow = rowsBySubmission.get(submission.id);
							return (
								<Paper key={submission.id} withBorder p="sm">
									<Stack gap={4}>
										<Group justify="space-between">
											<Text fw={600} size="sm">
												{submission.runnerUsername} — {submission.category}
											</Text>
											<Badge color={score >= 4 ? "green" : "gray"} variant="light">
												{score >= 4 ? "Strong match" : "Possible"}
											</Badge>
										</Group>
										<Text size="xs" c="dimmed">
											{reasons.join(" · ")}
										</Text>
										{submission.specialRequirements && (
											<Requirements text={submission.specialRequirements} />
										)}
										{otherRow && (
											<Text size="xs" c="yellow">
												⚠ Also scheduled as its own row (#{otherRow.index + 1}).
											</Text>
										)}
										<Group gap="xs" justify="flex-end">
											<Button
												size="xs"
												onClick={() =>
													update((previous) =>
														linkSubmission(previous, row.key, submission, data.submissions),
													)
												}
											>
												Link
											</Button>
											{otherRow && (
												<Button
													size="xs"
													variant="default"
													onClick={() =>
														update((previous) =>
															deleteRow(
																linkSubmission(
																	previous,
																	row.key,
																	submission,
																	data.submissions,
																),
																otherRow.key,
															),
														)
													}
												>
													Link &amp; remove row #{otherRow.index + 1}
												</Button>
											)}
										</Group>
									</Stack>
								</Paper>
							);
						})}
						{userMatches.map((user) => (
							<Paper key={user.id} withBorder p="sm">
								<Group justify="space-between">
									<Stack gap={0}>
										<Text fw={600} size="sm">
											{user.username}
										</Text>
										<Text size="xs" c="dimmed">
											Named in the racer field but has no submission for this game.
										</Text>
									</Stack>
									<Button
										size="xs"
										variant="default"
										onClick={() => patch({ runnerIds: [...row.runnerIds, user.id] })}
									>
										Add as runner
									</Button>
								</Group>
							</Paper>
						))}
					</Stack>
				</SimpleGrid>

				<RunnerPicker runnerIds={row.runnerIds} onChange={(runnerIds) => patch({ runnerIds })} />
				<TextInput
					label="Other runners without accounts"
					description="Comma separated"
					value={row.otherRunners}
					onChange={(event) => patch({ otherRunners: event.currentTarget.value })}
				/>

				<Textarea
					label="Special requirements for the run"
					description="Merged from all linked submissions — edit to combine them properly"
					autosize
					minRows={3}
					value={row.specialRequirements}
					onChange={(event) => patch({ specialRequirements: event.currentTarget.value })}
				/>

				<Group justify="flex-end">
					{merged !== row.specialRequirements && (
						<Button size="xs" variant="default" onClick={() => patch({ specialRequirements: merged })}>
							Reset special requirements from submissions
						</Button>
					)}
					<Button
						size="xs"
						color={row.pairingConfirmed ? "gray" : "green"}
						variant={row.pairingConfirmed ? "light" : "filled"}
						onClick={() => patch({ pairingConfirmed: !row.pairingConfirmed })}
					>
						{row.pairingConfirmed ? "Confirmed ✓ (undo)" : "Confirm runners"}
					</Button>
				</Group>
			</Stack>
		</Card>
	);
}

export function PairingStep() {
	const { timed, state, submissionsById } = useSchedule();
	const races = timed
		.map((entry, index) => ({ entry, index }))
		.filter(({ entry }) => entry.row.type === "run" && entry.row.isRace);
	const confirmed = races.filter(({ entry }) => entry.row.pairingConfirmed).length;
	const duplicates = findDuplicateSubmissionLinks(state.rows);

	return (
		<Stack>
			<Text size="sm" c="dimmed">
				Every runner in a race or co-op submits separately, but the run only takes one row. Link the other
				runners&apos; submissions here so they are accepted too, and so their special requirements aren&apos;t
				lost. Linking also pulls in their incentives.
			</Text>
			<Group>
				<Badge size="lg" variant="light" color={confirmed === races.length ? "green" : "yellow"}>
					{confirmed}/{races.length} confirmed
				</Badge>
				{duplicates.size > 0 && (
					<Badge size="lg" variant="light" color="yellow">
						Linked to more than one row:{" "}
						{[...duplicates.keys()]
							.map((id) => submissionsById.get(id)?.runnerUsername ?? `#${id}`)
							.join(", ")}
					</Badge>
				)}
			</Group>
			{races.length === 0 && <Text c="dimmed">There are no races or co-ops in the schedule.</Text>}
			{races.map(({ entry, index }) => (
				<PairingCard key={entry.row.key} timedRow={entry} index={index} />
			))}
		</Stack>
	);
}
