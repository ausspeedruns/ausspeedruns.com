import type { Run } from "#/payload-types";

export interface PostEventSummary {
	totalRuns: number;
	totalRunSeconds: number;
	totalRunDurationLabel: string;
	uniqueRunnerCount: number;
}

const durationRegex = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/;
const tokenRegex = /(\d+)\s*([hms])/gi;

function parseOtherRunners(value: string | null | undefined): string[] {
	if (!value || typeof value !== "string") {
		return [];
	}

	return value
		.split(/[\n,;]+/)
		.map((entry) => entry.trim().toLowerCase())
		.filter(Boolean);
}

export function parseRunDurationToSeconds(rawValue: string | null | undefined): number | null {
	if (!rawValue || typeof rawValue !== "string") {
		return null;
	}

	const value = rawValue.trim().toLowerCase();

	if (!value) {
		return null;
	}

	const hhmmssMatch = value.match(durationRegex);

	if (hhmmssMatch) {
		const [, hoursString, minutesString, secondsString] = hhmmssMatch;
		const hours = Number(hoursString ?? "0");
		const minutes = Number(minutesString);
		const seconds = Number(secondsString);

		if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
			return null;
		}

		return hours * 60 * 60 + minutes * 60 + seconds;
	}

	let computedSeconds = 0;
	let hasToken = false;

	for (const token of value.matchAll(tokenRegex)) {
		hasToken = true;
		const amount = Number(token[1]);
		const unit = token[2];

		if (Number.isNaN(amount)) {
			continue;
		}

		if (unit === "h") {
			computedSeconds += amount * 60 * 60;
		} else if (unit === "m") {
			computedSeconds += amount * 60;
		} else if (unit === "s") {
			computedSeconds += amount;
		}
	}

	if (hasToken && computedSeconds > 0) {
		return computedSeconds;
	}

	return null;
}

export function formatSecondsAsDuration(totalSeconds: number): string {
	const safeTotal = Number.isFinite(totalSeconds) ? Math.max(0, Math.round(totalSeconds)) : 0;
	const hours = Math.floor(safeTotal / 3600);
	const minutes = Math.floor((safeTotal % 3600) / 60);
	const seconds = safeTotal % 60;

	if (hours > 0) {
		return `${hours}h ${minutes}m ${seconds}s`;
	}

	return `${minutes}m ${seconds}s`;
}

/** Compact hours/minutes label, e.g. "52h 14m". */
export function formatSecondsAsHours(totalSeconds: number): string {
	const safeTotal = Number.isFinite(totalSeconds) ? Math.max(0, Math.round(totalSeconds)) : 0;
	const hours = Math.floor(safeTotal / 3600);
	const minutes = Math.floor((safeTotal % 3600) / 60);

	return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/** Display names of everyone running a run, including runners without accounts. */
export function getRunnerNames(run: Run): string[] {
	const names: string[] = [];

	for (const runner of run.runners ?? []) {
		if (runner && typeof runner === "object") {
			names.push(runner.username || "Unknown runner");
		}
	}

	for (const name of (run.otherRunners ?? "").split(/[\n,;]+/)) {
		const trimmed = name.trim();
		if (trimmed) names.push(trimmed);
	}

	return names;
}

export function buildPostEventSummary(runs: Run[]): PostEventSummary {
	const runnerIds = new Set<string>();
	let totalRunSeconds = 0;

	for (const run of runs) {
		for (const runner of run.runners ?? []) {
			if (typeof runner === "string" || typeof runner === "number") {
				runnerIds.add(String(runner));
				continue;
			}

			if (runner && typeof runner === "object" && "id" in runner && runner.id) {
				runnerIds.add(String(runner.id));
			}
		}

		for (const name of parseOtherRunners(run.otherRunners)) {
			runnerIds.add(`external:${name}`);
		}

		const seconds = parseRunDurationToSeconds(run.time) ?? parseRunDurationToSeconds(run.estimate) ?? 0;
		totalRunSeconds += seconds;
	}

	return {
		totalRuns: runs.length,
		totalRunSeconds,
		totalRunDurationLabel: formatSecondsAsDuration(totalRunSeconds),
		uniqueRunnerCount: runnerIds.size,
	};
}
