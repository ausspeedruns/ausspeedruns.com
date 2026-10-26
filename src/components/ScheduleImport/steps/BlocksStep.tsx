"use client";

import {
	ActionIcon,
	Alert,
	Badge,
	Box,
	Button,
	Card,
	ColorInput,
	Group,
	Paper,
	ScrollArea,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Title,
	Tooltip,
	UnstyledButton,
} from "@mantine/core";
import { useMemo, useState } from "react";

import { blockIndexRange, readableTextColour } from "#/utilities/schedule/blocks.ts";
import { formatInTz, type TimedRow } from "#/utilities/schedule/timing.ts";
import type { DraftBlock, DraftRow } from "#/utilities/schedule/types.ts";
import { runnerNames, useSchedule } from "../context.tsx";
import { addBlock, moveBlock, newBlock, removeBlock, updateBlock } from "../draftOps.ts";

const SWATCHES = ["#08a256", "#783884", "#e98033", "#437c90", "#cc2936", "#2a4d9b", "#b8860b", "#d6336c", "#bbbbbb"];

function rowLabel(row: DraftRow, segmentTypeName: (id: number | null | undefined) => string | undefined): string {
	switch (row.type) {
		case "run":
			return `${row.gameName || "Untitled"}${row.category ? ` — ${row.category}` : ""}`;
		case "medley":
			return `Medley: ${row.category || "Untitled medley"}`;
		case "segment":
			return row.category || segmentTypeName(row.segmentTypeId) || "Segment";
		case "setupBuffer":
			return "Setup buffer";
		case "sleep":
			return row.category || "Overnight break";
		default:
			return row.category || row.gameName || "Other";
	}
}

const blockText = (block: DraftBlock) => block.textColour || readableTextColour(block.colour);

function BlockCard({
	block,
	index,
	count,
	options,
	range,
	timeRange,
	selection,
}: {
	block: DraftBlock;
	index: number;
	count: number;
	options: { value: string; label: string }[];
	range: { from: number; to: number } | null;
	timeRange: string | null;
	selection: { from: number; to: number } | null;
}) {
	const { update, issues } = useSchedule();
	const patch = (changes: Partial<DraftBlock>) => update((previous) => updateBlock(previous, block.key, changes));
	const blockIssues = issues.filter((issue) => issue.blockKey === block.key);
	const runCount = range ? range.to - range.from + 1 : 0;

	return (
		<Card withBorder padding="md" style={{ borderLeft: `6px solid ${block.colour || "transparent"}` }}>
			<Stack gap="sm">
				<Group justify="space-between" wrap="nowrap">
					<Badge
						size="lg"
						radius="sm"
						style={{ background: block.colour, color: blockText(block), textTransform: "none" }}
					>
						{block.name || "Untitled block"}
					</Badge>
					<Group gap={4} wrap="nowrap">
						<Text size="xs" c="dimmed">
							{runCount > 0 ? `${runCount} ${runCount === 1 ? "entry" : "entries"}` : "No runs"}
							{timeRange ? ` · ${timeRange}` : ""}
						</Text>
						<ActionIcon
							variant="subtle"
							aria-label="Move up"
							disabled={index === 0}
							onClick={() => update((previous) => moveBlock(previous, block.key, -1))}
						>
							↑
						</ActionIcon>
						<ActionIcon
							variant="subtle"
							aria-label="Move down"
							disabled={index === count - 1}
							onClick={() => update((previous) => moveBlock(previous, block.key, 1))}
						>
							↓
						</ActionIcon>
					</Group>
				</Group>

				<TextInput
					label="Name"
					required
					placeholder="The Legend of Block"
					value={block.name}
					onChange={(e) => patch({ name: e.currentTarget.value })}
				/>
				<SimpleGrid cols={2}>
					<ColorInput
						label="Colour"
						required
						format="hex"
						swatches={SWATCHES}
						value={block.colour}
						onChange={(colour) => patch({ colour })}
					/>
					<ColorInput
						label="Text colour"
						format="hex"
						placeholder={`Auto (${readableTextColour(block.colour)})`}
						swatches={["#ffffff", "#000000"]}
						value={block.textColour}
						onChange={(textColour) => patch({ textColour })}
					/>
				</SimpleGrid>
				<Select
					label="Start run"
					required
					searchable
					placeholder="Choose a run…"
					data={options}
					value={block.startRowKey}
					onChange={(startRowKey) => patch({ startRowKey })}
				/>
				<Select
					label="End run"
					description="Leave empty for a single-run block."
					searchable
					clearable
					placeholder="Same as start"
					data={options}
					value={block.endRowKey}
					onChange={(endRowKey) => patch({ endRowKey })}
				/>

				{blockIssues.map((issue) => (
					<Text key={issue.message} size="sm" c={issue.level === "error" ? "red" : "yellow.8"}>
						{issue.message}
					</Text>
				))}

				<Group justify="space-between">
					<Tooltip label="Select runs in the list first (click, then shift-click)" disabled={Boolean(selection)}>
						<Button
							size="xs"
							variant="light"
							disabled={!selection}
							onClick={() =>
								selection &&
								patch({
									startRowKey: options[selection.from].value,
									endRowKey: selection.to !== selection.from ? options[selection.to].value : null,
								})
							}
						>
							Use selected runs
						</Button>
					</Tooltip>
					<Button
						size="xs"
						color="red"
						variant="subtle"
						onClick={() => update((previous) => removeBlock(previous, block.key))}
					>
						Remove
					</Button>
				</Group>
			</Stack>
		</Card>
	);
}

function RunList({
	entries,
	blockByKey,
	selection,
	onSelect,
	label,
}: {
	entries: TimedRow<DraftRow>[];
	blockByKey: Map<string, DraftBlock>;
	selection: { from: number; to: number } | null;
	onSelect: (index: number, extend: boolean) => void;
	label: (entry: TimedRow<DraftRow>) => { time: string; title: string; detail: string };
}) {
	return (
		<Stack gap={2}>
			{entries.map((entry, index) => {
				const block = blockByKey.get(entry.row.key);
				const previousBlock = index > 0 ? blockByKey.get(entries[index - 1].row.key) : undefined;
				const selected = selection !== null && index >= selection.from && index <= selection.to;
				const { time, title, detail } = label(entry);
				const minor = entry.row.type === "setupBuffer" || entry.row.type === "sleep";

				return (
					<Box key={entry.row.key}>
						{block && block !== previousBlock && (
							<Text
								size="xs"
								fw={700}
								px="xs"
								mt={6}
								style={{
									background: block.colour,
									color: blockText(block),
									borderRadius: "4px 4px 0 0",
									display: "inline-block",
								}}
							>
								{block.name || "Untitled block"}
							</Text>
						)}
						<UnstyledButton
							onClick={(e) => onSelect(index, e.shiftKey)}
							w="100%"
							px="xs"
							py={4}
							style={{
								display: "grid",
								gridTemplateColumns: "110px 1fr",
								gap: 8,
								alignItems: "center",
								borderLeft: `6px solid ${block?.colour ?? "transparent"}`,
								borderRadius: 4,
								background: selected
									? "var(--mantine-color-blue-light)"
									: block
										? `color-mix(in srgb, ${block.colour} 15%, transparent)`
										: undefined,
								outline: selected ? "1px solid var(--mantine-color-blue-filled)" : undefined,
								opacity: minor ? 0.6 : undefined,
							}}
						>
							<Text size="xs" c="dimmed" ff="monospace">
								{time}
							</Text>
							<Box style={{ minWidth: 0 }}>
								<Text size="sm" fw={minor ? 400 : 600} truncate>
									{title}
								</Text>
								{detail && (
									<Text size="xs" c="dimmed" truncate>
										{detail}
									</Text>
								)}
							</Box>
						</UnstyledButton>
					</Box>
				);
			})}
		</Stack>
	);
}

export function BlocksStep() {
	const { state, update, timed, data, users, goToStep } = useSchedule();
	const [anchor, setAnchor] = useState<number | null>(null);
	const [selection, setSelection] = useState<{ from: number; to: number } | null>(null);

	const segmentTypeName = (id: number | null | undefined) =>
		data.segmentTypes.find((type) => type.id === id)?.name;

	const blocks = state.blocks ?? [];
	const entries = useMemo(() => timed.filter((entry) => !entry.row.parentKey), [timed]);
	const keys = useMemo(() => entries.map((entry) => entry.row.key), [entries]);
	const tz = data.event.timezone;

	const label = (entry: TimedRow<DraftRow>) => {
		const runners = entry.row.type === "run" || entry.row.type === "segment" ? runnerNames(entry.row, users) : [];
		const games =
			entry.row.type === "medley" ? state.rows.filter((row) => row.parentKey === entry.row.key).length : 0;
		return {
			time: formatInTz(entry.start, tz, "EEE h:mm a"),
			title: rowLabel(entry.row, segmentTypeName),
			detail:
				entry.row.type === "medley"
					? `${games} ${games === 1 ? "game" : "games"}`
					: [runners.join(", "), entry.row.platform].filter(Boolean).join(" · "),
		};
	};

	const options = entries.map((entry) => {
		const { time, title } = label(entry);
		return { value: entry.row.key, label: `${time} — ${title}` };
	});

	const ranges = blocks.map((block) =>
		blockIndexRange({ name: block.name, start: block.startRowKey, end: block.endRowKey }, keys),
	);
	const blockByKey = new Map<string, DraftBlock>();
	blocks.forEach((block, i) => {
		const range = ranges[i];
		if (!range) return;
		for (let index = range.from; index <= range.to; index++) {
			if (!blockByKey.has(keys[index])) blockByKey.set(keys[index], block);
		}
	});

	const timeRange = (range: { from: number; to: number } | null) =>
		range
			? `${formatInTz(entries[range.from].start, tz, "EEE h:mm a")} – ${formatInTz(entries[range.to].end, tz, "h:mm a")}`
			: null;

	const select = (index: number, extend: boolean) => {
		if (extend && anchor !== null) {
			setSelection({ from: Math.min(anchor, index), to: Math.max(anchor, index) });
			return;
		}
		if (selection && selection.from === index && selection.to === index) {
			setAnchor(null);
			setSelection(null);
			return;
		}
		setAnchor(index);
		setSelection({ from: index, to: index });
	};

	const createFromSelection = () => {
		if (!selection) return;
		update((previous) => addBlock(previous, newBlock(previous, keys[selection.from], keys[selection.to])));
		setSelection(null);
		setAnchor(null);
	};

	if (entries.length === 0) {
		return (
			<Alert color="blue">
				Import a schedule first, then group runs into themed blocks here.{" "}
				<Button size="xs" variant="subtle" onClick={() => goToStep("import")}>
					Go to import
				</Button>
			</Alert>
		);
	}

	return (
		<Stack>
			<Text size="sm" c="dimmed">
				Blocks call out themed runs of the schedule (e.g. a Zelda block). Each block covers every entry from its
				start run to its end run, and is shown on the public schedule with its colour. A run can only be in one
				block. Blocks are saved to the event when the schedule is applied.
			</Text>

			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
				<Stack>
					<Group justify="space-between">
						<Title order={4}>Blocks ({blocks.length})</Title>
						<Group gap="xs">
							<Button size="xs" variant="default" onClick={() => update((previous) => addBlock(previous, newBlock(previous)))}>
								+ Empty block
							</Button>
							<Button size="xs" disabled={!selection} onClick={createFromSelection}>
								+ Block from selection
							</Button>
						</Group>
					</Group>
					{blocks.length === 0 && (
						<Text c="dimmed" size="sm">
							No blocks yet. Click a run in the schedule, shift-click another to select a range, then press{" "}
							<strong>Block from selection</strong>.
						</Text>
					)}
					{blocks.map((block, index) => (
						<BlockCard
							key={block.key}
							block={block}
							index={index}
							count={blocks.length}
							options={options}
							range={ranges[index]}
							timeRange={timeRange(ranges[index])}
							selection={selection}
						/>
					))}
				</Stack>

				<Paper withBorder p="sm" style={{ alignSelf: "start", position: "sticky", top: 16 }}>
					<Group justify="space-between" mb="xs">
						<Title order={4}>Schedule</Title>
						<Text size="xs" c="dimmed">
							{selection
								? `${selection.to - selection.from + 1} selected · ${timeRange(selection)}`
								: "Click to select, shift-click for a range"}
						</Text>
					</Group>
					<ScrollArea.Autosize mah="70vh" type="auto">
						<RunList
							entries={entries}
							blockByKey={blockByKey}
							selection={selection}
							onSelect={select}
							label={label}
						/>
					</ScrollArea.Autosize>
				</Paper>
			</SimpleGrid>
		</Stack>
	);
}
