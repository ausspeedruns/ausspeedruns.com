// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
	blocksSignature,
	draftBlocksToEvent,
	eventBlocksToDraft,
	findBlockProblems,
	normaliseDraftBlocks,
	readableTextColour,
	resolveBlockRuns,
	toScheduleBlocks,
} from "#/utilities/schedule/blocks";
import type { DraftBlock, DraftRow, EventSummary } from "#/utilities/schedule/types";
import { validateDraft } from "#/utilities/schedule/validation";

const range = (name: string, start: number | null, end: number | null = null) => ({ name, start, end });

describe("resolveBlockRuns", () => {
	it("maps every run between start and end to its block", () => {
		const zelda = range("Zelda", 2, 4);
		const single = range("Single", 6);
		const map = resolveBlockRuns([zelda, single], [1, 2, 3, 4, 5, 6]);
		expect([...map.entries()].map(([id, block]) => [id, block.name])).toEqual([
			[2, "Zelda"],
			[3, "Zelda"],
			[4, "Zelda"],
			[6, "Single"],
		]);
	});

	it("ignores blocks whose runs are missing and keeps the first block on overlap", () => {
		const map = resolveBlockRuns([range("A", 1, 2), range("B", 2, 3), range("Gone", 99)], [1, 2, 3]);
		expect(map.get(2)?.name).toBe("A");
		expect(map.get(3)?.name).toBe("B");
		expect(map.size).toBe(3);
	});
});

describe("findBlockProblems", () => {
	it("reports missing, reversed and overlapping blocks", () => {
		const problems = findBlockProblems(
			[range("A", 1, 3), range("B", 3, 4), range("C", 5, 4), range("D", null), range("E", 1, 42)],
			[1, 2, 3, 4, 5],
		);
		expect(problems).toEqual([
			{ type: "endBeforeStart", block: 2 },
			{ type: "missingStart", block: 3 },
			{ type: "missingEnd", block: 4 },
			{ type: "overlap", block: 1, other: 0 },
		]);
	});

	it("accepts adjacent blocks", () => {
		expect(findBlockProblems([range("A", 1, 2), range("B", 3, 4)], [1, 2, 3, 4])).toEqual([]);
	});
});

describe("readableTextColour", () => {
	it("picks black or white for contrast", () => {
		expect(readableTextColour("#ffffff")).toBe("#000000");
		expect(readableTextColour("#ff0")).toBe("#000000");
		expect(readableTextColour("#08a256")).toBe("#000000");
		expect(readableTextColour("#783884")).toBe("#ffffff");
		expect(readableTextColour("#000000")).toBe("#ffffff");
		expect(readableTextColour("rebeccapurple")).toBe("#ffffff");
		expect(readableTextColour(null)).toBe("#ffffff");
	});
});

describe("block conversions", () => {
	const block = (overrides: Partial<DraftBlock>): DraftBlock => ({
		key: "b1",
		name: "Zelda",
		colour: "#08a256",
		textColour: "",
		startRowKey: "r1",
		endRowKey: "r3",
		...overrides,
	});

	it("converts draft blocks to event blocks via the applied run map", () => {
		const result = draftBlocksToEvent(
			[block({}), block({ key: "b2", name: "Lost", startRowKey: "gone" }), block({ key: "b3", endRowKey: "r1" })],
			{ r1: 10, r3: 30 },
		);
		expect(result.skipped).toEqual(["Lost"]);
		expect(result.blocks).toEqual([
			{ name: "Zelda", colour: "#08a256", textColour: null, startRun: 10, endRun: 30 },
			{ name: "Zelda", colour: "#08a256", textColour: null, startRun: 10, endRun: null },
		]);
	});

	it("round-trips event blocks back into the draft", () => {
		let n = 0;
		const blocks = eventBlocksToDraft(
			[{ name: "Zelda", colour: "#08a256", textColour: "#fff", startRun: { id: 10 }, endRun: 30 }],
			new Map([
				[10, "r1"],
				[30, "r3"],
			]),
			() => `k${n++}`,
		);
		expect(blocks).toEqual([block({ key: "k0", textColour: "#fff" })]);
	});

	it("fills in text colour and drops blocks without a start run for the public schedule", () => {
		expect(
			toScheduleBlocks([
				{ name: "A", colour: "#ffffff", startRun: 1, endRun: 1 },
				{ name: "B", colour: "#000000", textColour: "#ff0000", startRun: { id: 2 }, endRun: { id: 3 } },
				{ name: "C", colour: "#000000", startRun: null },
			]),
		).toEqual([
			{ name: "A", colour: "#ffffff", textColour: "#000000", startRunId: 1, endRunId: null },
			{ name: "B", colour: "#000000", textColour: "#ff0000", startRunId: 2, endRunId: 3 },
		]);
	});

	it("signatures ignore populated vs. unpopulated relationships", () => {
		expect(blocksSignature([{ name: "A", colour: "#fff", startRun: { id: 1 }, endRun: { id: 2 } }])).toBe(
			blocksSignature([{ name: "A", colour: "#fff", textColour: null, startRun: 1, endRun: 2 }]),
		);
	});

	it("clears endpoints that no longer point at top-level rows", () => {
		const rows = [{ key: "r1" }, { key: "r2", parentKey: "r1" }, { key: "r3" }] as DraftRow[];
		expect(normaliseDraftBlocks([block({ startRowKey: "r2", endRowKey: "r3" })], rows)).toEqual([
			block({ startRowKey: "r3", endRowKey: null }),
		]);
		expect(normaliseDraftBlocks([block({ startRowKey: "missing", endRowKey: "missing" })], rows)).toEqual([
			block({ startRowKey: null, endRowKey: null }),
		]);
	});
});

describe("validateDraft blocks", () => {
	const event: EventSummary = {
		id: 1,
		name: "Test",
		shortName: "TEST",
		startTime: "2026-07-04T00:00:00.000Z",
		endTime: "2026-07-05T00:00:00.000Z",
		timezone: "Australia/Melbourne",
	};
	const row = (key: string): DraftRow => ({
		key,
		type: "run",
		parentKey: null,
		segmentTypeId: null,
		submissionIds: [1],
		gameName: "Game",
		category: "Any%",
		platform: "PC",
		techPlatform: "",
		estimate: "00:30:00",
		setupMinutesOverride: null,
		runnerIds: ["u1"],
		otherRunners: "",
		isRace: false,
		isCoop: false,
		specialRequirements: "",
		pairingConfirmed: true,
		racerHint: "",
	});
	const base = { defaultSetupMinutes: 10, rows: [row("a"), row("b"), row("c")], incentives: [] };
	const blockIssues = (blocks: DraftBlock[]) =>
		validateDraft({ ...base, blocks }, event, []).filter((issue) => issue.step === "blocks");
	const draftBlock = (overrides: Partial<DraftBlock>): DraftBlock => ({
		key: "x",
		name: "Block",
		colour: "#123456",
		textColour: "",
		startRowKey: "a",
		endRowKey: null,
		...overrides,
	});

	it("accepts valid blocks and drafts without blocks", () => {
		expect(blockIssues([draftBlock({ endRowKey: "b" }), draftBlock({ key: "y", startRowKey: "c" })])).toEqual([]);
		expect(validateDraft(base, event, []).filter((issue) => issue.step === "blocks")).toEqual([]);
	});

	it("flags names, colours, ordering and overlaps", () => {
		const issues = blockIssues([
			draftBlock({ name: " ", colour: "not a colour" }),
			draftBlock({ key: "y", startRowKey: "a", endRowKey: "c" }),
			draftBlock({ key: "z", startRowKey: null }),
		]);
		expect(issues.map((issue) => [issue.level, issue.blockKey])).toEqual([
			["error", "x"],
			["error", "x"],
			["warning", "z"],
			["error", "y"],
		]);
	});
});
