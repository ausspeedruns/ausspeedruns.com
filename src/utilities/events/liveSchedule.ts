import type { Incentive, Run, User } from "#/payload-types";
import { relationId } from "#/access/helpers";
import { getGameName, getRunDisplayName } from "#/utilities/runDisplay";
import { sortChildren } from "#/utilities/runs/medley";
import { estimateToMs } from "#/utilities/schedule/timing";
import {
	getIncentiveDescription,
	getIncentiveRunLabel,
	parseIncentiveResult,
	type IncentiveResult,
} from "./incentiveResults";

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
	description: string | null;
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
		if (runs[index].type === "run" || runs[index].type === "medley") return index;
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

const HAS_PEOPLE: NonNullable<Run["type"]>[] = ["run", "medley", "segment"];

/** Serialises a populated run, keeping only public fields. Medleys list their games as the category. */
export function toLiveRun(run: Run, children: Run[] = []): LiveRun | null {
	if (!run.scheduledTime) return null;
	const type = run.type ?? "run";

	let title: string;
	let category: string | null = null;
	if (type === "run") {
		title = getGameName(run.game);
		category = run.category ?? null;
	} else if (type === "medley") {
		title = getRunDisplayName(run);
		category = children.length > 0 ? children.map((child) => getGameName(child.game)).join(", ") : "Medley";
	} else if (type === "segment") {
		title = run.title || run.category || "Segment";
	} else {
		title = run.category || "Intermission";
	}

	return {
		id: run.id,
		type,
		title,
		category,
		platform: run.platform ?? null,
		runners: HAS_PEOPLE.includes(type) ? runnersFor(run) : [],
		isRace: Boolean(run.isRace),
		isCoop: Boolean(run.isCoop),
		scheduledTime: run.scheduledTime,
		estimateMs: estimateToMs(run.estimate),
	};
}

/** Serialises the main schedule; medley games are folded into their medley. */
export function toLiveRuns(runs: Run[]): LiveRun[] {
	const childrenByParent = new Map<number, Run[]>();
	for (const run of runs) {
		const parentId = relationId(run.parent);
		if (parentId === null) continue;
		childrenByParent.set(parentId, [...(childrenByParent.get(parentId) ?? []), run]);
	}

	return runs
		.filter((run) => relationId(run.parent) === null)
		.map((run) => toLiveRun(run, sortChildren(childrenByParent.get(run.id) ?? [])))
		.filter((run): run is LiveRun => run !== null);
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
		description: getIncentiveDescription(incentive),
		runLabel: getIncentiveRunLabel(run),
		scheduledTime,
		endTime:
			scheduledTime && estimateMs !== null
				? new Date(new Date(scheduledTime).getTime() + estimateMs).toISOString()
				: null,
		result,
	};
}
