import type { DraftRow } from "./types.ts";

type Row = Pick<DraftRow, "key" | "type" | "parentKey">;

export function isChildRow(row: Pick<DraftRow, "parentKey">): boolean {
	return Boolean(row.parentKey);
}

/** Child rows of a medley, in order. */
export function childRows<T extends Row>(rows: T[], medleyKey: string): T[] {
	return rows.filter((row) => row.parentKey === medleyKey);
}

/**
 * Makes the medley structure consistent: children whose medley is missing (or isn't a medley) or that
 * aren't game runs become top-level rows, and every child is moved to directly follow its medley.
 * Relative order is otherwise preserved.
 */
export function normaliseRows<T extends Row>(rows: T[]): T[] {
	const medleys = new Set(rows.filter((row) => row.type === "medley" && !isChildRow(row)).map((row) => row.key));
	const fixed = rows.map((row) => {
		if (!row.parentKey) return row;
		if (row.type === "run" && medleys.has(row.parentKey)) return row;
		return { ...row, parentKey: null };
	});

	const result: T[] = [];
	for (const row of fixed) {
		if (isChildRow(row)) continue;
		result.push(row);
		if (row.type === "medley") result.push(...childRows(fixed, row.key));
	}
	return result;
}

/** Index range [start, end] of a top-level row and its children. */
function blockRange(rows: Row[], index: number): [number, number] {
	let end = index;
	while (end + 1 < rows.length && rows[end + 1].parentKey === rows[index].key) end++;
	return [index, end];
}

/**
 * Drag-and-drop move. Medleys move with their games. A game run dropped onto a medley's game (or dropped
 * downwards onto a medley) joins that medley; dropped onto a top-level row it leaves its medley.
 */
export function moveRowInTree<T extends Row>(rows: T[], from: number, to: number): T[] {
	if (from === to || !rows[from] || !rows[to]) return rows;
	const active = rows[from];
	const over = rows[to];
	const movingDown = from < to;
	const isActiveTopLevel = !isChildRow(active);

	// Rows being moved: a top-level row brings its children along
	const [start, end] = isActiveTopLevel ? blockRange(rows, from) : [from, from];
	if (to >= start && to <= end) return rows;

	const moving = rows.slice(start, end + 1);
	const remaining = [...rows.slice(0, start), ...rows.slice(end + 1)];
	const overIndex = remaining.indexOf(over);

	const canBeChild = active.type === "run" && !(isActiveTopLevel && end > start);
	let insertAt: number;
	let parentKey: string | null = null;

	if (canBeChild && isChildRow(over)) {
		parentKey = over.parentKey ?? null;
		insertAt = movingDown ? overIndex + 1 : overIndex;
	} else if (canBeChild && over.type === "medley" && movingDown) {
		parentKey = over.key;
		insertAt = overIndex + 1;
	} else {
		// Anchor on the top-level block the target belongs to
		const anchorIndex = isChildRow(over) ? remaining.findIndex((row) => row.key === over.parentKey) : overIndex;
		const [anchorStart, anchorEnd] = blockRange(remaining, anchorIndex);
		insertAt = movingDown ? anchorEnd + 1 : anchorStart;
	}

	const [head, ...rest] = moving;
	const moved = [{ ...head, parentKey }, ...rest];
	return normaliseRows([...remaining.slice(0, insertAt), ...moved, ...remaining.slice(insertAt)]);
}

/** Puts a game run at the end of a medley. */
export function addToMedley<T extends Row>(rows: T[], key: string, medleyKey: string): T[] {
	const row = rows.find((candidate) => candidate.key === key);
	if (!row || row.type !== "run" || key === medleyKey) return rows;
	if (rows.some((candidate) => candidate.parentKey === key)) return rows;
	const without = rows.filter((candidate) => candidate.key !== key);
	const medleyIndex = without.findIndex((candidate) => candidate.key === medleyKey);
	if (medleyIndex < 0) return rows;
	const [, end] = blockRange(without, medleyIndex);
	return normaliseRows([...without.slice(0, end + 1), { ...row, parentKey: medleyKey }, ...without.slice(end + 1)]);
}

/** Moves a medley game out to just after its medley. */
export function removeFromMedley<T extends Row>(rows: T[], key: string): T[] {
	const row = rows.find((candidate) => candidate.key === key);
	if (!row?.parentKey) return rows;
	const without = rows.filter((candidate) => candidate.key !== key);
	const medleyIndex = without.findIndex((candidate) => candidate.key === row.parentKey);
	const [, end] = blockRange(without, medleyIndex);
	return normaliseRows([...without.slice(0, end + 1), { ...row, parentKey: null }, ...without.slice(end + 1)]);
}

/** Inserts a row after another. Game runs inserted after a medley game join the same medley. */
export function insertRowAfter<T extends Row>(rows: T[], afterKey: string | null, row: T): T[] {
	if (afterKey === null) return normaliseRows([...rows, row]);
	const index = rows.findIndex((candidate) => candidate.key === afterKey);
	if (index < 0) return normaliseRows([...rows, row]);
	const after = rows[index];

	if (row.type === "run" && after.parentKey) {
		return normaliseRows([...rows.slice(0, index + 1), { ...row, parentKey: after.parentKey }, ...rows.slice(index + 1)]);
	}

	const anchorIndex = after.parentKey ? rows.findIndex((candidate) => candidate.key === after.parentKey) : index;
	const [, end] = blockRange(rows, anchorIndex);
	return normaliseRows([...rows.slice(0, end + 1), { ...row, parentKey: row.parentKey ?? null }, ...rows.slice(end + 1)]);
}
