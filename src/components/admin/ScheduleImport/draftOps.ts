import { nanoid } from "nanoid";

import { incentivesFromSubmission, normaliseName } from "#/utilities/schedule/csv.ts";
import {
	addToMedley,
	insertRowAfter,
	moveRowInTree,
	normaliseRows,
	removeFromMedley,
} from "#/utilities/schedule/medley.ts";
import { mergeSpecialRequirements } from "#/utilities/schedule/pairing.ts";
import { normaliseDraftBlocks } from "#/utilities/schedule/blocks.ts";
import type {
	DraftBlock,
	DraftIncentive,
	DraftRow,
	DraftRowType,
	DraftState,
	SubmissionSummary,
} from "#/utilities/schedule/types.ts";

export function newRow(type: DraftRowType, parentKey: string | null = null): DraftRow {
	const estimate =
		type === "sleep"
			? "08:00:00"
			: type === "setupBuffer"
				? "00:15:00"
				: type === "medley"
					? "01:00:00"
					: type === "segment"
						? "00:10:00"
						: "00:30:00";
	return {
		key: nanoid(),
		type,
		parentKey: type === "run" ? parentKey : null,
		segmentTypeId: null,
		submissionIds: [],
		gameName: "",
		category: type === "sleep" ? "Overnight break" : "",
		platform: "",
		techPlatform: "",
		estimate: parentKey && type === "run" ? "00:05:00" : estimate,
		setupMinutesOverride: null,
		runnerIds: [],
		otherRunners: "",
		isRace: false,
		isCoop: false,
		specialRequirements: "",
		pairingConfirmed: type !== "run",
		racerHint: "",
	};
}

export function newIncentive(rowKey: string): DraftIncentive {
	return {
		key: nanoid(),
		rowKey,
		sourceSubmissionId: null,
		status: "pending",
		title: "",
		description: "",
		notes: "",
		type: "goal",
		data: { goal: 0, current: 0 },
	};
}

export function updateRow(state: DraftState, key: string, patch: Partial<DraftRow>): DraftState {
	const rows = state.rows.map((row) => (row.key === key ? { ...row, ...patch } : row));
	// Changing a medley's type or a child's type can break the medley structure
	return { ...state, rows: patch.type || patch.parentKey !== undefined ? normaliseRows(rows) : rows };
}

export function moveRow(state: DraftState, from: number, to: number): DraftState {
	return { ...state, rows: moveRowInTree(state.rows, from, to) };
}

export function insertRow(state: DraftState, index: number, row: DraftRow): DraftState {
	const rows = [...state.rows];
	rows.splice(index, 0, row);
	return { ...state, rows: normaliseRows(rows) };
}

/** Inserts after the given row (or at the end). Game runs inserted after a medley game join that medley. */
export function insertRowAfterKey(state: DraftState, afterKey: string | null, row: DraftRow): DraftState {
	return { ...state, rows: insertRowAfter(state.rows, afterKey, row) };
}

export function addRowToMedley(state: DraftState, key: string, medleyKey: string): DraftState {
	return { ...state, rows: addToMedley(state.rows, key, medleyKey) };
}

export function removeRowFromMedley(state: DraftState, key: string): DraftState {
	return { ...state, rows: removeFromMedley(state.rows, key) };
}

/** Removes a row. Removing a medley removes its games too. */
export function deleteRow(state: DraftState, key: string): DraftState {
	const removed = new Set([key, ...state.rows.filter((row) => row.parentKey === key).map((row) => row.key)]);
	const rows = state.rows.filter((row) => !removed.has(row.key));
	return {
		...state,
		rows,
		incentives: state.incentives.filter((incentive) => !removed.has(incentive.rowKey)),
		blocks: normaliseDraftBlocks(state.blocks, rows),
	};
}

const BLOCK_COLOURS = ["#08a256", "#783884", "#e98033", "#437c90", "#cc2936", "#2a4d9b", "#b8860b", "#d6336c"];

export function newBlock(state: DraftState, startRowKey: string | null = null, endRowKey: string | null = null): DraftBlock {
	return {
		key: nanoid(),
		name: "",
		colour: BLOCK_COLOURS[(state.blocks ?? []).length % BLOCK_COLOURS.length],
		textColour: "",
		startRowKey,
		endRowKey: endRowKey === startRowKey ? null : endRowKey,
	};
}

export function addBlock(state: DraftState, block: DraftBlock): DraftState {
	return { ...state, blocks: [...(state.blocks ?? []), block] };
}

export function updateBlock(state: DraftState, key: string, patch: Partial<DraftBlock>): DraftState {
	return {
		...state,
		blocks: normaliseDraftBlocks(
			(state.blocks ?? []).map((block) => (block.key === key ? { ...block, ...patch } : block)),
			state.rows,
		),
	};
}

export function removeBlock(state: DraftState, key: string): DraftState {
	return { ...state, blocks: (state.blocks ?? []).filter((block) => block.key !== key) };
}

export function moveBlock(state: DraftState, key: string, direction: -1 | 1): DraftState {
	const blocks = [...(state.blocks ?? [])];
	const index = blocks.findIndex((block) => block.key === key);
	const target = index + direction;
	if (index === -1 || target < 0 || target >= blocks.length) return state;
	[blocks[index], blocks[target]] = [blocks[target], blocks[index]];
	return { ...state, blocks };
}

export function updateIncentive(state: DraftState, key: string, patch: Partial<DraftIncentive>): DraftState {
	return {
		...state,
		incentives: state.incentives.map((incentive) =>
			incentive.key === key ? { ...incentive, ...patch } : incentive,
		),
	};
}

/**
 * Links a partner submission to a race/co-op row: adds the runner, pulls in their incentives,
 * and re-merges special requirements unless the organiser has already edited them by hand.
 */
export function linkSubmission(
	state: DraftState,
	rowKey: string,
	submission: SubmissionSummary,
	submissions: SubmissionSummary[],
): DraftState {
	const row = state.rows.find((candidate) => candidate.key === rowKey);
	if (!row || row.submissionIds.includes(submission.id)) return state;

	const before = submissions.filter((candidate) => row.submissionIds.includes(candidate.id));
	const after = [...before, submission];
	const untouched =
		row.specialRequirements.trim() === mergeSpecialRequirements(before).trim() || !row.specialRequirements.trim();

	const alreadyHasIncentives = state.incentives.some((incentive) => incentive.sourceSubmissionId === submission.id);
	// Skip suggestions already on the row (e.g. rebuilt from live incentives that lost their source)
	const rowTitles = new Set(
		state.incentives
			.filter((incentive) => incentive.rowKey === rowKey)
			.map((incentive) => normaliseName(incentive.title)),
	);
	const newIncentives = incentivesFromSubmission(submission, rowKey).filter(
		(incentive) => !rowTitles.has(normaliseName(incentive.title)),
	);

	return {
		...updateRow(state, rowKey, {
			submissionIds: after.map((candidate) => candidate.id),
			runnerIds:
				submission.runnerId && !row.runnerIds.includes(submission.runnerId)
					? [...row.runnerIds, submission.runnerId]
					: row.runnerIds,
			techPlatform: row.techPlatform || submission.techPlatform,
			specialRequirements: untouched ? mergeSpecialRequirements(after) : row.specialRequirements,
		}),
		// If the partner was also imported as its own row, move their incentives onto this row
		incentives: alreadyHasIncentives
			? state.incentives.map((incentive) =>
					incentive.sourceSubmissionId === submission.id ? { ...incentive, rowKey } : incentive,
				)
			: [...state.incentives, ...newIncentives],
	};
}

export function unlinkSubmission(
	state: DraftState,
	rowKey: string,
	submission: SubmissionSummary,
	submissions: SubmissionSummary[],
): DraftState {
	const row = state.rows.find((candidate) => candidate.key === rowKey);
	if (!row) return state;

	const before = submissions.filter((candidate) => row.submissionIds.includes(candidate.id));
	const after = before.filter((candidate) => candidate.id !== submission.id);
	const untouched = row.specialRequirements.trim() === mergeSpecialRequirements(before).trim();

	return {
		...updateRow(state, rowKey, {
			submissionIds: row.submissionIds.filter((id) => id !== submission.id),
			runnerIds: row.runnerIds.filter((id) => id !== submission.runnerId),
			specialRequirements: untouched ? mergeSpecialRequirements(after) : row.specialRequirements,
		}),
		incentives: state.incentives.filter(
			(incentive) => !(incentive.rowKey === rowKey && incentive.sourceSubmissionId === submission.id),
		),
	};
}
