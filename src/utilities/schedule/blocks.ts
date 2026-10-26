import type { DraftBlock, DraftRow } from "./types.ts";

type RelationValue = number | { id: number } | null | undefined;

const idOf = (value: RelationValue): number | null =>
	value === null || value === undefined ? null : typeof value === "object" ? value.id : value;

/** Shape of a block as stored on the event (`scheduleMetadata.scheduleBlocks`). */
export interface EventBlockData {
	name: string;
	colour: string;
	textColour?: string | null;
	startRun: RelationValue;
	endRun?: RelationValue;
}

/** A named, coloured span of consecutive top-level runs called out on the public schedule. */
export interface ScheduleBlock {
	name: string;
	colour: string;
	textColour: string;
	startRunId: number;
	/** Null for single-run blocks */
	endRunId: number | null;
}

export interface BlockRange<Id> {
	name: string;
	start: Id | null;
	end: Id | null;
}

/** Index range (inclusive) covered by a block within the ordered list of ids, or null if the start is missing. */
export function blockIndexRange<Id>(block: BlockRange<Id>, orderedIds: Id[]): { from: number; to: number } | null {
	if (block.start === null || block.start === undefined) return null;
	const from = orderedIds.indexOf(block.start);
	if (from === -1) return null;
	if (block.end === null || block.end === undefined) return { from, to: from };
	const to = orderedIds.indexOf(block.end);
	if (to === -1) return null;
	return { from: Math.min(from, to), to: Math.max(from, to) };
}

/** Maps each id to the block covering it. Runs can belong to one block; the first block listed wins on overlap. */
export function resolveBlockRuns<Id, B extends BlockRange<Id>>(blocks: B[], orderedIds: Id[]): Map<Id, B> {
	const map = new Map<Id, B>();
	for (const block of blocks) {
		const range = blockIndexRange(block, orderedIds);
		if (!range) continue;
		for (let i = range.from; i <= range.to; i++) {
			if (!map.has(orderedIds[i])) map.set(orderedIds[i], block);
		}
	}
	return map;
}

export type BlockProblem =
	| { type: "missingStart"; block: number }
	| { type: "missingEnd"; block: number }
	| { type: "endBeforeStart"; block: number }
	| { type: "overlap"; block: number; other: number };

/** Finds blocks with missing/unknown runs, reversed ranges and overlaps (indexes refer to the `blocks` array). */
export function findBlockProblems<Id>(blocks: BlockRange<Id>[], orderedIds: Id[]): BlockProblem[] {
	const problems: BlockProblem[] = [];
	const ranges: ({ from: number; to: number } | null)[] = blocks.map((block, i) => {
		const from = block.start === null || block.start === undefined ? -1 : orderedIds.indexOf(block.start);
		if (from === -1) {
			problems.push({ type: "missingStart", block: i });
			return null;
		}
		if (block.end === null || block.end === undefined) return { from, to: from };
		const to = orderedIds.indexOf(block.end);
		if (to === -1) {
			problems.push({ type: "missingEnd", block: i });
			return null;
		}
		if (to < from) {
			problems.push({ type: "endBeforeStart", block: i });
			return null;
		}
		return { from, to };
	});

	for (let a = 0; a < ranges.length; a++) {
		for (let b = a + 1; b < ranges.length; b++) {
			const ra = ranges[a];
			const rb = ranges[b];
			if (ra && rb && ra.from <= rb.to && rb.from <= ra.to) problems.push({ type: "overlap", block: b, other: a });
		}
	}
	return problems;
}

export function describeBlockProblem(problem: BlockProblem, names: string[]): string {
	const name = names[problem.block] || `Block ${problem.block + 1}`;
	switch (problem.type) {
		case "missingStart":
			return `"${name}" needs a start run from this event's schedule.`;
		case "missingEnd":
			return `"${name}" has an end run that isn't in this event's schedule.`;
		case "endBeforeStart":
			return `"${name}" ends before it starts.`;
		case "overlap":
			return `"${name}" overlaps "${names[problem.other] || `Block ${problem.other + 1}`}". A run can only be in one block.`;
	}
}

function parseHex(colour: string): [number, number, number] | null {
	const hex = colour.trim().replace(/^#/, "");
	if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)) return null;
	const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex.slice(0, 6);
	return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

/** Black or white, whichever has more contrast against the given hex colour (white for unknown colours). */
export function readableTextColour(background: string | null | undefined): string {
	const rgb = background ? parseHex(background) : null;
	if (!rgb) return "#ffffff";
	const [r, g, b] = rgb.map((channel) => {
		const c = channel / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	// Contrast with white vs. black: (1.05)/(L+0.05) vs (L+0.05)/0.05
	return 1.05 / (luminance + 0.05) >= (luminance + 0.05) / 0.05 ? "#ffffff" : "#000000";
}

/** Event blocks for the public schedule, with text colour filled in when it was left empty. */
export function toScheduleBlocks(blocks: EventBlockData[] | null | undefined): ScheduleBlock[] {
	return (blocks ?? []).flatMap((block) => {
		const startRunId = idOf(block.startRun);
		if (startRunId === null) return [];
		const endRunId = idOf(block.endRun);
		return [
			{
				name: block.name,
				colour: block.colour,
				textColour: block.textColour || readableTextColour(block.colour),
				startRunId,
				endRunId: endRunId === startRunId ? null : endRunId,
			},
		];
	});
}

/** Converts draft blocks to event blocks, dropping blocks whose start row wasn't applied as a run. */
export function draftBlocksToEvent(
	blocks: DraftBlock[],
	runIdByKey: Record<string, number>,
): { blocks: (EventBlockData & { startRun: number; endRun: number | null })[]; skipped: string[] } {
	const skipped: string[] = [];
	const result = blocks.flatMap((block) => {
		const startRun = block.startRowKey ? runIdByKey[block.startRowKey] : undefined;
		if (startRun === undefined) {
			skipped.push(block.name || "Untitled block");
			return [];
		}
		const endRun = block.endRowKey ? (runIdByKey[block.endRowKey] ?? null) : null;
		return [
			{
				name: block.name.trim() || "Untitled block",
				colour: block.colour,
				textColour: block.textColour || null,
				startRun,
				endRun: endRun === startRun ? null : endRun,
			},
		];
	});
	return { blocks: result, skipped };
}

/** Converts event blocks back into draft blocks using the run → row key mapping. */
export function eventBlocksToDraft(
	blocks: EventBlockData[] | null | undefined,
	keyByRunId: Map<number, string>,
	makeKey: () => string,
): DraftBlock[] {
	return (blocks ?? []).map((block) => {
		const start = idOf(block.startRun);
		const end = idOf(block.endRun);
		return {
			key: makeKey(),
			name: block.name,
			colour: block.colour,
			textColour: block.textColour ?? "",
			startRowKey: start !== null ? (keyByRunId.get(start) ?? null) : null,
			endRowKey: end !== null && end !== start ? (keyByRunId.get(end) ?? null) : null,
		};
	});
}

/** Clears block endpoints that no longer point at a top-level row (e.g. after deleting or re-importing rows). */
export function normaliseDraftBlocks(blocks: DraftBlock[] | null | undefined, rows: DraftRow[]): DraftBlock[] {
	const topLevel = new Set(rows.filter((row) => !row.parentKey).map((row) => row.key));
	return (blocks ?? []).map((block) => {
		let startRowKey = block.startRowKey && topLevel.has(block.startRowKey) ? block.startRowKey : null;
		let endRowKey = block.endRowKey && topLevel.has(block.endRowKey) ? block.endRowKey : null;
		if (!startRowKey && endRowKey) [startRowKey, endRowKey] = [endRowKey, null];
		if (endRowKey === startRowKey) endRowKey = null;
		return startRowKey === block.startRowKey && endRowKey === block.endRowKey
			? block
			: { ...block, startRowKey, endRowKey };
	});
}

/** Comparable signature of a set of event blocks (used to detect edits made outside the schedule tool). */
export function blocksSignature(blocks: EventBlockData[] | null | undefined): string {
	return JSON.stringify(
		(blocks ?? []).map((block) => [
			block.name,
			block.colour,
			block.textColour || "",
			idOf(block.startRun),
			idOf(block.endRun) === idOf(block.startRun) ? null : idOf(block.endRun),
		]),
	);
}
