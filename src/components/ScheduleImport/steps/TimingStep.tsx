"use client";

import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	ActionIcon,
	Alert,
	Button,
	Group,
	Menu,
	NumberInput,
	Stack,
	Table,
	Text,
	TextInput,
	Tooltip,
} from "@mantine/core";
import { Fragment, useMemo, useState } from "react";

import { RUN_TYPES, runTypeLabel } from "#/utilities/schedule/constants.ts";
import {
	eventDayKey,
	estimateToMs,
	formatInTz,
	msToEstimate,
	setupMinutesFor,
	type TimedRow,
} from "#/utilities/schedule/timing.ts";
import type { DraftRow, DraftRowType } from "#/utilities/schedule/types.ts";
import type { ScheduleIssue } from "#/utilities/schedule/validation.ts";
import { ConfirmModal } from "../components/feedback.tsx";
import { RowEditor } from "../components/RowEditor.tsx";
import { runnerNames, useSchedule } from "../context.tsx";
import {
	addRowToMedley,
	deleteRow,
	insertRowAfterKey,
	moveRow,
	newRow,
	removeRowFromMedley,
	updateRow,
} from "../draftOps.ts";

const COLUMN_COUNT = 9;

interface RowProps {
	timedRow: TimedRow<DraftRow>;
	label: string;
	issues: ScheduleIssue[];
	medleys: DraftRow[];
	onEdit: (key: string) => void;
	onInsert: (afterKey: string, type: DraftRowType, parentKey?: string | null) => void;
	onDelete: (row: DraftRow) => void;
}

function rowTitle(row: DraftRow, segmentTypes: { id: number; name: string }[]): string {
	if (row.type === "medley") return row.category || "Untitled medley";
	if (row.type === "segment") return segmentTypes.find((type) => type.id === row.segmentTypeId)?.name ?? "Segment";
	return runTypeLabel(row.type);
}

function ScheduleRow({ timedRow, label, issues, medleys, onEdit, onInsert, onDelete }: RowProps) {
	const { row, start } = timedRow;
	const { data, state, update, users } = useSchedule();
	const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
		id: row.key,
	});

	const level = issues.some((issue) => issue.level === "error") ? "red" : issues.length > 0 ? "yellow" : null;
	const isRun = row.type === "run";
	const isChild = Boolean(row.parentKey);
	const isMedley = row.type === "medley";
	const children = isMedley ? state.rows.filter((candidate) => candidate.parentKey === row.key) : [];
	const names = isMedley
		? [...new Set(children.flatMap((child) => runnerNames(child, users)))]
		: runnerNames(row, users);
	const childrenMs = children.reduce((total, child) => total + (estimateToMs(child.estimate) ?? 0), 0);
	const isBlock = !isRun && !isMedley;

	return (
		<Table.Tr
			ref={setNodeRef}
			style={{
				transform: CSS.Translate.toString(transform),
				transition,
				position: "relative",
				zIndex: isDragging ? 2 : undefined,
				opacity: isDragging ? 0.85 : undefined,
				background: isDragging
					? "var(--mantine-color-body)"
					: isMedley
						? "var(--mantine-color-grape-light)"
						: isChild
							? "color-mix(in srgb, var(--mantine-color-grape-light) 40%, transparent)"
							: isBlock
								? "var(--mantine-color-default-hover)"
								: undefined,
				boxShadow: level ? `inset 4px 0 0 var(--mantine-color-${level}-6)` : undefined,
				fontStyle: isBlock ? "italic" : undefined,
			}}
		>
			<Table.Td>
				<ActionIcon
					ref={setActivatorNodeRef}
					variant="subtle"
					color="gray"
					aria-label="Drag to reorder"
					style={{ cursor: "grab", touchAction: "none" }}
					{...attributes}
					{...listeners}
				>
					⠿
				</ActionIcon>
			</Table.Td>
			<Table.Td>
				{level ? (
					<Tooltip
						label={issues.map((issue) => issue.message).join("\n")}
						multiline
						maw={420}
						style={{ whiteSpace: "pre-line" }}
						position="top-start"
					>
						<Text size="sm" fw={700} c={level} style={{ cursor: "help" }}>
							{label} ⚠
						</Text>
					</Tooltip>
				) : (
					<Text size="sm" c="dimmed">
						{label}
					</Text>
				)}
			</Table.Td>
			<Table.Td style={{ whiteSpace: "nowrap" }}>
				{isChild ? (
					<Text size="sm" c="dimmed">
						~{formatInTz(start, data.event.timezone, "h:mm a")}
					</Text>
				) : (
					formatInTz(start, data.event.timezone, "h:mm a")
				)}
			</Table.Td>
			<Table.Td style={{ paddingLeft: isChild ? 28 : undefined }}>
				{isRun ? (
					<Text fw={600} size="sm" c={row.gameName ? undefined : "red"} lineClamp={1}>
						{isChild && "↳ "}
						{row.gameName || "Missing game"}
					</Text>
				) : (
					<Text fw={600} size="sm">
						{isMedley ? `Medley: ${rowTitle(row, data.segmentTypes)}` : rowTitle(row, data.segmentTypes)}
					</Text>
				)}
				{isRun && (
					<Text size="xs" c="dimmed">
						{[row.platform, row.isRace ? (row.isCoop ? "Co-op" : "Race") : ""].filter(Boolean).join(" · ")}
					</Text>
				)}
				{isMedley && (
					<Text size="xs" c={childrenMs > (estimateToMs(row.estimate) ?? 0) ? "orange" : "dimmed"}>
						{children.length} {children.length === 1 ? "game" : "games"} · {msToEstimate(childrenMs)} of games
					</Text>
				)}
			</Table.Td>
			<Table.Td>
				<Text size="sm" lineClamp={1}>
					{isMedley ? "—" : row.category || "—"}
				</Text>
			</Table.Td>
			<Table.Td>
				{(isRun || isMedley || row.type === "segment") &&
					(names.length > 0 ? (
						<Text size="sm" lineClamp={1} title={names.join(", ")}>
							{names.join(row.isRace && !row.isCoop ? " vs. " : ", ")}
						</Text>
					) : (
						isRun && (
							<Text size="sm" c="red" fw={600}>
								No runners
							</Text>
						)
					))}
			</Table.Td>
			<Table.Td>
				<TextInput
					size="xs"
					w={90}
					aria-label="Estimate"
					value={row.estimate}
					error={estimateToMs(row.estimate) === null}
					onChange={(event) => {
						const estimate = event.currentTarget.value;
						update((previous) => updateRow(previous, row.key, { estimate }));
					}}
				/>
			</Table.Td>
			<Table.Td>
				{isChild ? (
					<Text size="sm" c="dimmed" title="Games in a medley share the medley's slot">
						—
					</Text>
				) : (
				<NumberInput
					size="xs"
					w={70}
					hideControls
					min={0}
					aria-label="Setup minutes after"
					placeholder={String(
						setupMinutesFor({ ...row, setupMinutesOverride: null }, state.defaultSetupMinutes),
					)}
					value={row.setupMinutesOverride ?? ""}
					onChange={(value) =>
						update((previous) =>
							updateRow(previous, row.key, {
								setupMinutesOverride: value === "" ? null : Math.max(0, Number(value)),
							}),
						)
					}
				/>
				)}
			</Table.Td>
			<Table.Td>
				<Group gap={4} wrap="nowrap" justify="flex-end">
					<Button size="compact-xs" variant="default" onClick={() => onEdit(row.key)}>
						Edit
					</Button>
					<Menu position="bottom-end" withinPortal>
						<Menu.Target>
							<ActionIcon variant="default" size="sm" aria-label="Insert after">
								+
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							{isMedley && (
								<>
									<Menu.Label>This medley</Menu.Label>
									<Menu.Item onClick={() => onInsert(row.key, "run", row.key)}>Add a game</Menu.Item>
									<Menu.Divider />
								</>
							)}
							<Menu.Label>{isChild ? "Insert after (runs join the medley)" : "Insert after this row"}</Menu.Label>
							{RUN_TYPES.map((type) => (
								<Menu.Item key={type.value} onClick={() => onInsert(row.key, type.value)}>
									{type.label}
								</Menu.Item>
							))}
							{isRun && !isChild && medleys.length > 0 && (
								<>
									<Menu.Divider />
									<Menu.Label>Move into medley</Menu.Label>
									{medleys.map((medley) => (
										<Menu.Item
											key={medley.key}
											onClick={() => update((previous) => addRowToMedley(previous, row.key, medley.key))}
										>
											{medley.category || "Untitled medley"}
										</Menu.Item>
									))}
								</>
							)}
							{isChild && (
								<>
									<Menu.Divider />
									<Menu.Item onClick={() => update((previous) => removeRowFromMedley(previous, row.key))}>
										Move out of medley
									</Menu.Item>
								</>
							)}
						</Menu.Dropdown>
					</Menu>
					<ActionIcon
						variant="default"
						size="sm"
						color="red"
						aria-label="Delete row"
						onClick={() => onDelete(row)}
					>
						✕
					</ActionIcon>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
}

export function TimingStep() {
	const { data, state, update, timed, issues } = useSchedule();
	const [editingKey, setEditingKey] = useState<string | null>(null);
	const [deleting, setDeleting] = useState<DraftRow | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const issuesByRow = useMemo(() => {
		const map = new Map<string, ScheduleIssue[]>();
		for (const issue of issues) {
			if (!issue.rowKey) continue;
			map.set(issue.rowKey, [...(map.get(issue.rowKey) ?? []), issue]);
		}
		return map;
	}, [issues]);

	const insert = (afterKey: string | null, type: DraftRowType, parentKey: string | null = null) => {
		const row = newRow(type, parentKey);
		update((previous) => insertRowAfterKey(previous, afterKey, row));
		if (type !== "setupBuffer" && type !== "sleep") setEditingKey(row.key);
	};

	const medleys = state.rows.filter((row) => row.type === "medley" && !row.parentKey);

	// "3" for top-level rows, "3.1" for games inside a medley
	const labels = useMemo(() => {
		let top = 0;
		let child = 0;
		return state.rows.map((row) => {
			if (row.parentKey) return `${top}.${++child}`;
			child = 0;
			return String(++top);
		});
	}, [state.rows]);

	const onDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;
		update((previous) => {
			const from = previous.rows.findIndex((row) => row.key === active.id);
			const to = previous.rows.findIndex((row) => row.key === over.id);
			return from < 0 || to < 0 ? previous : moveRow(previous, from, to);
		});
	};

	const tz = data.event.timezone;
	const generalIssues = issues.filter((issue) => issue.step === "timing" && !issue.rowKey);

	if (!data.event.startTime) {
		return (
			<Alert color="yellow">
				Set a start time on the event first. Times are calculated from the event start, each row&apos;s estimate
				and the setup time after it.
			</Alert>
		);
	}

	let previousDay = "";

	return (
		<Stack>
			<Text size="sm" c="dimmed">
				Drag rows to reorder. Times flow from the event start (
				{formatInTz(data.event.startTime, tz, "EEE d MMM, h:mm a")} {tz}) using each row&apos;s estimate plus
				the setup after it. Runs and medleys use the default setup unless overridden; segments, buffers,
				sleep and other blocks default to no setup. Games inside a medley share the medley&apos;s slot: drag a
				run onto a medley&apos;s game (or down onto the medley) to add it, or use the + menu. Hover ⚠ to see a
				row&apos;s warnings.
			</Text>

			<Group align="flex-end">
				<NumberInput
					label="Default setup between runs"
					description="Minutes"
					w={200}
					min={0}
					value={state.defaultSetupMinutes}
					onChange={(value) =>
						update((previous) => ({ ...previous, defaultSetupMinutes: Math.max(0, Number(value) || 0) }))
					}
				/>
				{RUN_TYPES.map((type) => (
					<Button key={type.value} variant="default" onClick={() => insert(null, type.value)}>
						+ {type.label}
					</Button>
				))}
			</Group>

			{generalIssues.map((issue) => (
				<Alert key={issue.message} color={issue.level === "error" ? "red" : "yellow"} p="xs">
					{issue.message}
				</Alert>
			))}

			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
				<SortableContext items={state.rows.map((row) => row.key)} strategy={verticalListSortingStrategy}>
					<Table.ScrollContainer minWidth={980}>
						<Table verticalSpacing={6} withTableBorder>
							<Table.Thead>
								<Table.Tr>
									<Table.Th w={40} />
									<Table.Th w={56}>#</Table.Th>
									<Table.Th w={90}>Start</Table.Th>
									<Table.Th>Game</Table.Th>
									<Table.Th>Category / label</Table.Th>
									<Table.Th>Runners</Table.Th>
									<Table.Th w={100}>Estimate</Table.Th>
									<Table.Th w={80}>Setup</Table.Th>
									<Table.Th w={140} />
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{state.rows.length === 0 && (
									<Table.Tr>
										<Table.Td colSpan={COLUMN_COUNT}>
											<Text c="dimmed">No rows yet — import a CSV or add rows.</Text>
										</Table.Td>
									</Table.Tr>
								)}
								{timed.map((timedRow, index) => {
									const day = timedRow.row.parentKey ? previousDay : eventDayKey(timedRow.start, tz);
									const showDivider = day !== previousDay;
									previousDay = day;
									return (
										<Fragment key={timedRow.row.key}>
											{showDivider && (
												<Table.Tr bg="var(--mantine-color-default-border)">
													<Table.Td colSpan={COLUMN_COUNT}>
														<Text fw={700}>
															{formatInTz(timedRow.start, tz, "EEEE d MMMM")}
														</Text>
													</Table.Td>
												</Table.Tr>
											)}
											<ScheduleRow
												timedRow={timedRow}
												label={labels[index] ?? String(index + 1)}
												medleys={medleys}
												issues={issuesByRow.get(timedRow.row.key) ?? []}
												onEdit={setEditingKey}
												onInsert={insert}
												onDelete={setDeleting}
											/>
										</Fragment>
									);
								})}
							</Table.Tbody>
						</Table>
					</Table.ScrollContainer>
				</SortableContext>
			</DndContext>

			<RowEditor rowKey={editingKey} onClose={() => setEditingKey(null)} />

			<ConfirmModal
				opened={deleting !== null}
				title="Remove row?"
				confirmLabel="Remove"
				danger
				onCancel={() => setDeleting(null)}
				onConfirm={() => deleting && update((previous) => deleteRow(previous, deleting.key))}
			>
				<Text>
					Remove{" "}
					<strong>
						{deleting?.type === "run"
							? deleting.gameName || "this run"
							: deleting?.type === "medley"
								? deleting.category || "this medley"
								: runTypeLabel(deleting?.type)}
					</strong>{" "}
					from the schedule?{" "}
					{deleting?.type === "medley"
						? "Its games and all of their incentives will be removed too."
						: "Its incentives will be removed too."}
				</Text>
			</ConfirmModal>
		</Stack>
	);
}
