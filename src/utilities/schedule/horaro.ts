import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { runTypeLabel, type RunType } from "./constants.ts";
import { estimateToMs } from "./timing.ts";

dayjs.extend(utc);
dayjs.extend(timezone);

// Horaro rejects cells longer than this
const HORARO_CELL_LIMIT = 512;

export interface HoraroRunInput {
	type: RunType;
	title: string;
	game: string;
	category: string;
	platform: string;
	estimate: string;
	scheduledTime: string;
	isRace: boolean;
	isCoop: boolean;
	runners: { username: string; twitch?: string | null; bluesky?: string | null }[];
	otherRunners: string;
	incentives: string[];
}

export interface HoraroSchedule {
	schedule: {
		name: string;
		slug: string;
		timezone: string;
		start: string;
		website: string;
		twitch: string;
		setup: string;
		setup_t: number;
		event: { name: string; slug: string };
		columns: string[];
		items: { length: string; length_t: number; data: (string | null)[] }[];
	};
}

/** Seconds to an ISO 8601 duration, e.g. 5400 → "PT1H30M". */
export function secondsToIsoDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;
	const parts = `${hours ? `${hours}H` : ""}${minutes ? `${minutes}M` : ""}${secs ? `${secs}S` : ""}`;
	return `PT${parts || "0S"}`;
}

function cell(value: string | null | undefined): string | null {
	if (!value || value === "?") return null;
	return value.substring(0, HORARO_CELL_LIMIT);
}

function joinRunners(names: string[], isRace: boolean, isCoop: boolean): string {
	return names.join(isRace && !isCoop ? " vs. " : ", ");
}

/**
 * Builds a Horaro import JSON. Horaro has a single global setup time, so any gap larger than it
 * is folded into the preceding item's length.
 */
export function buildHoraroSchedule(
	event: { name: string; shortName: string; timezone: string },
	runs: HoraroRunInput[],
): HoraroSchedule {
	const sorted = [...runs].sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

	const gaps = sorted.slice(0, -1).map((run, i) => {
		const end = new Date(run.scheduledTime).getTime() + (estimateToMs(run.estimate) ?? 0);
		return Math.max(0, Math.round((new Date(sorted[i + 1].scheduledTime).getTime() - end) / 1000));
	});
	// Horaro adds the same setup after every item, so use the smallest gap to keep start times exact
	const setupSeconds = gaps.length > 0 ? Math.min(...gaps) : 0;

	return {
		schedule: {
			name: "Main Schedule",
			slug: event.shortName.toLowerCase(),
			timezone: event.timezone,
			start: sorted[0] ? dayjs(sorted[0].scheduledTime).tz(event.timezone).format() : "",
			website: "https://ausspeedruns.com/",
			twitch: "ausspeedruns",
			setup: secondsToIsoDuration(setupSeconds),
			setup_t: setupSeconds,
			event: { name: event.name, slug: event.shortName },
			columns: ["Game", "Category", "Runner", "Platform", "Donation Incentives", "Bluesky"],
			items: sorted.map((run, i) => {
				const lengthSeconds = Math.round((estimateToMs(run.estimate) ?? 0) / 1000) + Math.max(0, (gaps[i] ?? setupSeconds) - setupSeconds);

				if (run.type !== "run") {
					return {
						length: secondsToIsoDuration(lengthSeconds),
						length_t: lengthSeconds,
						data: [cell(run.category || runTypeLabel(run.type)), null, null, null, null, null],
					};
				}

				const runnerNames = [
					...run.runners.map((runner) =>
						runner.twitch ? `[${runner.username}](https://www.twitch.tv/${runner.twitch})` : runner.username,
					),
					...run.otherRunners.split(",").map((name) => name.trim()).filter(Boolean),
				];
				const blueskies = run.runners
					.filter((runner) => runner.bluesky)
					.map((runner) => `[@${runner.bluesky}](https://bsky.app/profile/${runner.bluesky?.replace(/^@/, "")})`);

				return {
					length: secondsToIsoDuration(lengthSeconds),
					length_t: lengthSeconds,
					data: [
						cell(run.game),
						cell(run.category),
						cell(joinRunners(runnerNames, run.isRace, run.isCoop)),
						cell(run.platform),
						cell(run.incentives.join(" | ")),
						cell(blueskies.length > 0 ? joinRunners(blueskies, run.isRace, run.isCoop) : null),
					],
				};
			}),
		},
	};
}
