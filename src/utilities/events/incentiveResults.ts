import type { Incentive } from "#/payload-types";
import { getRunDisplayName } from "#/utilities/runDisplay";

export interface GoalResult {
	kind: "goal";
	goal: number;
	current: number;
	met: boolean;
}

export interface WarResult {
	kind: "war";
	/** Sorted by total, highest first. May be empty if nobody has donated yet. */
	options: { name: string; total: number }[];
	total: number;
}

/** To add a new incentive type, add its result here, parse it below and register it in `#/components/Incentives/incentiveKinds`. */
export type IncentiveResult = GoalResult | WarResult;

function toNumber(value: unknown): number {
	const number = typeof value === "number" ? value : Number(value);
	return Number.isFinite(number) ? number : 0;
}

/** Parses an incentive's JSON data into a typed goal/war result. Returns null if the data is unusable. */
export function parseIncentiveResult(incentive: Pick<Incentive, "type" | "data">): IncentiveResult | null {
	const data = incentive.data;
	if (!data || typeof data !== "object" || Array.isArray(data)) return null;
	const record = data as Record<string, unknown>;

	if (incentive.type === "goal") {
		const goal = toNumber(record.goal);
		const current = toNumber(record.current);
		return { kind: "goal", goal, current, met: goal > 0 && current >= goal };
	}

	if (incentive.type === "war" && Array.isArray(record.options)) {
		const options = record.options
			.filter((option): option is Record<string, unknown> => Boolean(option) && typeof option === "object")
			.map((option) => ({ name: String(option.name ?? ""), total: toNumber(option.total) }))
			.filter((option) => option.name)
			.sort((a, b) => b.total - a.total);
		return { kind: "war", options, total: options.reduce((sum, option) => sum + option.total, 0) };
	}

	return null;
}

/** "Game – Category" for the incentive's run. Medleys use their category as the name, so it isn't repeated. */
export function getIncentiveRunLabel(run: Incentive["run"]): string | null {
	if (!run || typeof run !== "object") return null;
	return [getRunDisplayName(run), run.type === "medley" ? null : run.category].filter(Boolean).join(" – ") || null;
}

/** Public blurb for an incentive. Legacy incentives keep it in notes. */
export function getIncentiveDescription(incentive: Pick<Incentive, "description" | "notes">): string | null {
	return incentive.description || incentive.notes || null;
}

/** Percentage of max, rounded down so a goal never shows 100% before it's actually met. */
export function percent(value: number, max: number): number {
	if (max <= 0) return 0;
	return Math.min(100, Math.floor((value / max) * 100));
}
