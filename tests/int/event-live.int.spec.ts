// @vitest-environment node
import { describe, expect, it } from "vitest";

import type { Incentive, Run } from "#/payload-types";
import {
	getLiveState,
	selectUpcomingIncentives,
	toLiveIncentive,
	toLiveRun,
	type LiveIncentive,
	type LiveRun,
} from "#/utilities/events/liveSchedule";

const HOUR = 60 * 60 * 1000;
const START = new Date("2026-10-09T00:00:00Z").getTime();
const at = (hours: number) => START + hours * HOUR;
const iso = (hours: number) => new Date(at(hours)).toISOString();

function run(id: number, startHours: number, estimateHours: number | null, type: LiveRun["type"] = "run"): LiveRun {
	return {
		id,
		type,
		title: `Run ${id}`,
		category: "Any%",
		platform: null,
		runners: [],
		isRace: false,
		isCoop: false,
		scheduledTime: iso(startHours),
		estimateMs: estimateHours === null ? null : estimateHours * HOUR,
	};
}

// 0-1h run, 1-1.5h sleep, gap until 2h, 2-3h run
const schedule = [run(1, 0, 1), run(2, 1, 0.5, "sleep"), run(3, 2, 1)];

describe("getLiveState", () => {
	it("is empty without runs", () => {
		expect(getLiveState([], at(0)).status).toBe("empty");
	});

	it("points at the first game run before the event", () => {
		const scheduleWithSetup = [run(9, -0.5, 0.25, "setupBuffer"), ...schedule];
		expect(getLiveState(scheduleWithSetup, at(-1))).toEqual({
			status: "pre",
			currentIndex: null,
			nextIndex: 1,
			progress: null,
		});
	});

	it("tracks the current run and its progress", () => {
		expect(getLiveState(schedule, at(0.25))).toEqual({ status: "live", currentIndex: 0, nextIndex: 2, progress: 0.25 });
	});

	it("treats non-run entries as the current entry", () => {
		const state = getLiveState(schedule, at(1.25));
		expect(state.status).toBe("live");
		expect(schedule[state.currentIndex!].type).toBe("sleep");
		expect(state.nextIndex).toBe(2);
	});

	it("reports a gap between entries", () => {
		expect(getLiveState(schedule, at(1.75))).toEqual({
			status: "between",
			currentIndex: null,
			nextIndex: 2,
			progress: null,
		});
	});

	it("falls back to the next start time when an estimate is missing", () => {
		const state = getLiveState([run(1, 0, null), run(2, 2, 1)], at(1));
		expect(state).toMatchObject({ status: "live", currentIndex: 0, progress: 0.5 });
	});

	it("ends after the final run finishes", () => {
		expect(getLiveState(schedule, at(2.5)).status).toBe("live");
		expect(getLiveState(schedule, at(3)).status).toBe("post");
	});
});

describe("selectUpcomingIncentives", () => {
	const incentive = (id: number, start: number | null, end: number | null): LiveIncentive => ({
		id,
		title: `Incentive ${id}`,
		runLabel: null,
		scheduledTime: start === null ? null : iso(start),
		endTime: end === null ? null : iso(end),
		result: { kind: "goal", goal: 100, current: 0, met: false },
	});

	it("drops finished incentives and sorts the rest by run time", () => {
		const incentives = [incentive(1, 5, 6), incentive(2, 0, 1), incentive(3, null, null), incentive(4, 2, 3)];
		expect(selectUpcomingIncentives(incentives, at(1.5), 3).map((item) => item.id)).toEqual([4, 1, 3]);
	});

	it("keeps an incentive while its run is on", () => {
		expect(selectUpcomingIncentives([incentive(1, 0, 1)], at(0.5), 3)).toHaveLength(1);
	});

	it("limits the number returned", () => {
		const incentives = [incentive(1, 1, 2), incentive(2, 2, 3), incentive(3, 3, 4)];
		expect(selectUpcomingIncentives(incentives, at(0), 2).map((item) => item.id)).toEqual([1, 2]);
	});
});

describe("serialisers", () => {
	const user = { id: "u1", username: "speedy", email: "secret@example.com" };

	it("keeps only public run fields and merges other runners", () => {
		const live = toLiveRun({
			id: 1,
			type: "run",
			game: { id: 1, name: "Celeste" },
			category: "Any%",
			platform: "PC",
			runners: [user],
			otherRunners: "Guest One, Guest Two",
			estimate: "00:30:00",
			scheduledTime: iso(0),
			isRace: true,
		} as unknown as Run);

		expect(live).toMatchObject({
			title: "Celeste",
			runners: [{ name: "speedy", username: "speedy" }, { name: "Guest One" }, { name: "Guest Two" }],
			isRace: true,
			estimateMs: 0.5 * HOUR,
		});
		expect(JSON.stringify(live)).not.toContain("secret@example.com");
	});

	it("uses the label for non-run entries and skips unscheduled runs", () => {
		expect(
			toLiveRun({ id: 2, type: "sleep", category: "Overnight break", estimate: "8:00:00", scheduledTime: iso(0) } as Run),
		).toMatchObject({ title: "Overnight break", runners: [] });
		expect(toLiveRun({ id: 3, estimate: "1:00:00" } as Run)).toBeNull();
	});

	it("derives the incentive end time from its run", () => {
		const live = toLiveIncentive({
			id: 1,
			title: "Kill the boss",
			type: "goal",
			data: { goal: 500, current: 100 },
			run: { id: 1, game: { id: 1, name: "Celeste" }, category: "Any%", estimate: "1:00:00", scheduledTime: iso(0) },
		} as unknown as Incentive);

		expect(live).toMatchObject({ runLabel: "Celeste – Any%", scheduledTime: iso(0), endTime: iso(1) });
		expect(toLiveIncentive({ id: 2, title: "Broken", type: "goal", data: null } as Incentive)).toBeNull();
	});
});
