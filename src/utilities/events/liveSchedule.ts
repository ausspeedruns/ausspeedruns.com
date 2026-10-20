import type { Incentive, Run, User } from "#/payload-types";
import { getGameName } from "#/utilities/runDisplay";
import { estimateToMs } from "#/utilities/schedule/timing";
import { parseIncentiveResult, type IncentiveResult } from "./incentiveResults";

export interface LiveRunner {
	name: string;
	/** Set when the runner has an account, so we can link to their profile. */
	username?: string;
}

export interface LiveRun {
	id: number;
	type: NonNullable<Run["type"]>;
	/** Game name for runs, or the label (category) for setup/sleep/other entries. */
	title: string;
	category: string | null;
	platform: string | null;
	runners: LiveRunner[];
	isRace: boolean;
	isCoop: boolean;
	scheduledTime: string;
	estimateMs: number | null;
}

export interface LiveIncentive {
	id: number;
	title: string;
	runLabel: string | null;
	scheduledTime: string | null;
	/** When the incentive's run is expected to finish. Null if unknown. */
	endTime: string | null;
	result: IncentiveResult;
}

export interface LiveData {
	runs: LiveRun[];
	incentives: LiveIncentive[];
}

export type LiveStatus = "empty" | "pre" | "live" | "between" | "post";

export interface LiveState {
	status: LiveStatus;
	/** Index of the entry currently on stream (may be a setup/sleep entry). */
	currentIndex: number | null;
	/** Index of the next game run after now. */
	nextIndex: number | null;
	/** Fraction (0-1) of the current entry's estimate that has elapsed. */
	progress: number | null;
}

function runEnd(runs: LiveRun[], index: number): number {
	const run = runs[index];
	const start = new Date(run.scheduledTime).getTime();
	if (run.estimateMs !== null) return start + run.estimateMs;
	const next = runs[index + 1];
	return next ? new Date(next.scheduledTime).getTime() : start;
}

function nextGameRun(runs: LiveRun[], fromIndex: number): number | null {
	for (let index = fromIndex; index < runs.length; index++) {
		if (runs[index].type === "run") return index;
	}
	return null;
}

/** Works out what's on stream from a schedule sorted by scheduledTime. */
export function getLiveState(runs: LiveRun[], now: number): LiveState {
	if (runs.length === 0) return { status: "empty", currentIndex: null, nextIndex: null, progress: null };

	let lastStarted = -1;
	for (let index = 0; index < runs.length; index++) {
		if (new Date(runs[index].scheduledTime).getTime() <= now) lastStarted = index;
		else break;
	}

	if (lastStarted === -1) {
		return { status: "pre", currentIndex: null, nextIndex: nextGameRun(runs, 0), progress: null };
	}

	const start = new Date(runs[lastStarted].scheduledTime).getTime();
	const end = runEnd(runs, lastStarted);
	const nextIndex = nextGameRun(runs, lastStarted + 1);

	if (now < end) {
		const progress = Math.min(1, Math.max(0, (now - start) / (end - start)));
		return { status: "live", currentIndex: lastStarted, nextIndex, progress };
	}

	if (lastStarted === runs.length - 1) {
		return { status: "post", currentIndex: null, nextIndex: null, progress: null };
	}

	return { status: "between", currentIndex: null, nextIndex, progress: null };
}

/** Active incentives whose run hasn't finished yet, soonest first. */
export function selectUpcomingIncentives(incentives: LiveIncentive[], now: number, count: number): LiveIncentive[] {
	const time = (value: string | null) => (value ? new Date(value).getTime() : Number.POSITIVE_INFINITY);

	return incentives
		.filter((incentive) => incentive.endTime === null || new Date(incentive.endTime).getTime() > now)
		.sort((a, b) => time(a.scheduledTime) - time(b.scheduledTime))
		.slice(0, count);
}

function runnersFor(run: Run): LiveRunner[] {
	const users = (run.runners ?? [])
		.filter((runner): runner is User => Boolean(runner) && typeof runner === "object")
		.map((runner) => ({ name: runner.username, username: runner.username }));
	const others = (run.otherRunners ?? "")
		.split(",")
		.map((name) => name.trim())
		.filter(Boolean)
		.map((name) => ({ name }));
	return [...users, ...others];
}

/** Serialises a populated run, keeping only public fields. */
export function toLiveRun(run: Run): LiveRun | null {
	if (!run.scheduledTime) return null;
	const type = run.type ?? "run";

	return {
		id: run.id,
		type,
		title: type === "run" ? getGameName(run.game) : run.category || "Intermission",
		category: type === "run" ? (run.category ?? null) : null,
		platform: run.platform ?? null,
		runners: type === "run" ? runnersFor(run) : [],
		isRace: Boolean(run.isRace),
		isCoop: Boolean(run.isCoop),
		scheduledTime: run.scheduledTime,
		estimateMs: estimateToMs(run.estimate),
	};
}

export function toLiveIncentive(incentive: Incentive): LiveIncentive | null {
	const result = parseIncentiveResult(incentive);
	if (!result) return null;

	const run = incentive.run && typeof incentive.run === "object" ? incentive.run : null;
	const scheduledTime = run?.scheduledTime ?? null;
	const estimateMs = run ? estimateToMs(run.estimate) : null;

	return {
		id: incentive.id,
		title: incentive.title,
		runLabel: run ? [getGameName(run.game), run.category].filter(Boolean).join(" – ") : null,
		scheduledTime,
		endTime:
			scheduledTime && estimateMs !== null
				? new Date(new Date(scheduledTime).getTime() + estimateMs).toISOString()
				: null,
		result,
	};
}
