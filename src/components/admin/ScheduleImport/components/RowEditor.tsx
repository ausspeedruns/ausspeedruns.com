"use client";

import {
	Autocomplete,
	Checkbox,
	Drawer,
	Group,
	NumberInput,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Textarea,
} from "@mantine/core";

import { RUN_TYPES } from "#/utilities/schedule/constants.ts";
import { estimateToMs, msToEstimate } from "#/utilities/schedule/timing.ts";
import type { DraftRow } from "#/utilities/schedule/types.ts";
import { useSchedule } from "../context.tsx";
import { updateRow } from "../draftOps.ts";
import { RunnerPicker } from "./RunnerPicker.tsx";

interface RowEditorProps {
	rowKey: string | null;
	onClose: () => void;
}

/** Drawer for editing every field of a schedule row. */
export function RowEditor({ rowKey, onClose }: RowEditorProps) {
	const { state, update, data, submissionsById } = useSchedule();
	const row = state.rows.find((candidate) => candidate.key === rowKey);
	const isRun = row?.type === "run";
	const isChild = Boolean(row?.parentKey);
	const parent = isChild ? state.rows.find((candidate) => candidate.key === row?.parentKey) : undefined;
	const children = row?.type === "medley" ? state.rows.filter((candidate) => candidate.parentKey === row.key) : [];

	const patch = (changes: Partial<DraftRow>) => {
		if (row) update((previous) => updateRow(previous, row.key, changes));
	};

	const title = !row
		? ""
		: isRun
			? row.gameName || "Untitled run"
			: row.type === "medley"
				? row.category || "Untitled medley"
				: row.type === "segment"
					? "Edit segment"
					: "Edit block";

	return (
		<Drawer opened={Boolean(row)} onClose={onClose} position="right" size="lg" title={title}>
			{row && (
				<Stack>
					{parent && (
						<Text size="sm" c="dimmed">
							Part of the medley <strong>{parent.category || "Untitled medley"}</strong>. Its time is
							informational, laid out within the medley&apos;s slot.
						</Text>
					)}
					<SimpleGrid cols={{ base: 1, sm: 3 }}>
						<Select
							label="Type"
							allowDeselect={false}
							disabled={isChild}
							data={RUN_TYPES.map((type) => ({ value: type.value, label: type.label }))}
							value={row.type}
							onChange={(value) => value && patch({ type: value as DraftRow["type"] })}
						/>
						<TextInput
							label={row.type === "medley" ? "Slot length" : "Estimate / length"}
							description="HH:MM:SS"
							value={row.estimate}
							error={estimateToMs(row.estimate) === null ? "Invalid" : undefined}
							onChange={(event) => patch({ estimate: event.currentTarget.value })}
						/>
						{!isChild && (
							<NumberInput
								label="Setup after"
								description="Minutes"
								min={0}
								placeholder={
									isRun || row.type === "medley" ? `${state.defaultSetupMinutes} (default)` : "0"
								}
								value={row.setupMinutesOverride ?? ""}
								onChange={(value) =>
									patch({ setupMinutesOverride: value === "" ? null : Math.max(0, Number(value)) })
								}
							/>
						)}
					</SimpleGrid>

					{row.type === "medley" && (
						<>
							<TextInput
								label="Medley name"
								description="Shown on the schedule, e.g. '5 Minute Games Showcase'"
								value={row.category}
								onChange={(event) => patch({ category: event.currentTarget.value })}
							/>
							<TextInput
								label="Platform"
								description="Optional. Defaults to the games' platforms"
								value={row.platform}
								onChange={(event) => patch({ platform: event.currentTarget.value })}
							/>
							<Text size="sm" c="dimmed">
								{children.length} {children.length === 1 ? "game" : "games"} totalling{" "}
								{msToEstimate(children.reduce((total, child) => total + (estimateToMs(child.estimate) ?? 0), 0))}.
								Runners are taken from the games. Add games with the + menu on the medley row.
							</Text>
						</>
					)}

					{row.type === "segment" && (
						<>
							<Select
								label="Segment type"
								description="Manage these in the Segment Types collection"
								data={data.segmentTypes.map((type) => ({ value: String(type.id), label: type.name }))}
								value={row.segmentTypeId ? String(row.segmentTypeId) : null}
								error={row.segmentTypeId ? undefined : "Required"}
								onChange={(value) => patch({ segmentTypeId: value ? Number(value) : null })}
							/>
							<TextInput
								label="Title"
								description="e.g. 'The AusSpeedruns Report'"
								value={row.category}
								onChange={(event) => patch({ category: event.currentTarget.value })}
							/>
							<RunnerPicker runnerIds={row.runnerIds} onChange={(runnerIds) => patch({ runnerIds })} />
							<TextInput
								label="Other presenters without accounts"
								description="Comma separated"
								value={row.otherRunners}
								onChange={(event) => patch({ otherRunners: event.currentTarget.value })}
							/>
						</>
					)}

					{row.type === "medley" || row.type === "segment" ? null : isRun ? (
						<>
							<SimpleGrid cols={{ base: 1, sm: 2 }}>
								<Autocomplete
									label="Game"
									description="Pick an existing game, or type a new name to create it on apply"
									data={[...new Set(data.games.map((game) => game.name))]}
									limit={20}
									value={row.gameName}
									onChange={(gameName) => patch({ gameName })}
								/>
								<TextInput
									label="Category"
									value={row.category}
									onChange={(event) => patch({ category: event.currentTarget.value })}
								/>
								<TextInput
									label="Platform"
									value={row.platform}
									onChange={(event) => patch({ platform: event.currentTarget.value })}
								/>
								<TextInput
									label="Tech platform"
									value={row.techPlatform}
									onChange={(event) => patch({ techPlatform: event.currentTarget.value })}
								/>
							</SimpleGrid>

							<RunnerPicker runnerIds={row.runnerIds} onChange={(runnerIds) => patch({ runnerIds })} />
							<TextInput
								label="Other runners without accounts"
								description="Comma separated"
								value={row.otherRunners}
								onChange={(event) => patch({ otherRunners: event.currentTarget.value })}
							/>

							<Group>
								<Checkbox
									label="Race / co-op"
									checked={row.isRace}
									onChange={(event) =>
										patch({
											isRace: event.currentTarget.checked,
											pairingConfirmed: !event.currentTarget.checked,
										})
									}
								/>
								{row.isRace && (
									<Checkbox
										label="Co-op (not a race)"
										checked={row.isCoop}
										onChange={(event) => patch({ isCoop: event.currentTarget.checked })}
									/>
								)}
							</Group>

							{row.submissionIds.length > 0 && (
								<Text size="sm" c="dimmed">
									Linked submissions:{" "}
									{row.submissionIds
										.map((id) => {
											const submission = submissionsById.get(id);
											return submission ? `${submission.runnerUsername} (#${id})` : `#${id}`;
										})
										.join(", ")}
								</Text>
							)}
						</>
					) : (
						<TextInput
							label="Label"
							description="Shown on the schedule, e.g. 'Overnight break'"
							value={row.category}
							onChange={(event) => patch({ category: event.currentTarget.value })}
						/>
					)}

					<Textarea
						label="Special requirements"
						autosize
						minRows={3}
						value={row.specialRequirements}
						onChange={(event) => patch({ specialRequirements: event.currentTarget.value })}
					/>

					{(isRun || row.type === "medley") && (
						<SimpleGrid cols={{ base: 1, sm: 3 }}>
							<TextInput
								label="YouTube VOD"
								value={row.youtube ?? ""}
								onChange={(event) => patch({ youtube: event.currentTarget.value })}
							/>
							<TextInput
								label="Twitch VOD"
								value={row.twitch ?? ""}
								onChange={(event) => patch({ twitch: event.currentTarget.value })}
							/>
							<TextInput
								label="Final time"
								value={row.time ?? ""}
								onChange={(event) => patch({ time: event.currentTarget.value })}
							/>
						</SimpleGrid>
					)}
				</Stack>
			)}
		</Drawer>
	);
}
