import type { Incentive } from "#/payload-types";

export interface GoalResult {
	kind: "goal";
	goal: number;
	current: number;
	met: boolean;
}

export interface WarResult {
	kind: "war";
	options: { name: string; total: number }[];
	total: number;
}

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
		if (goal <= 0) return null;
		return { kind: "goal", goal, current, met: current >= goal };
	}

	if (incentive.type === "war" && Array.isArray(record.options)) {
		const options = record.options
			.filter((option): option is Record<string, unknown> => Boolean(option) && typeof option === "object")
			.map((option) => ({ name: String(option.name ?? ""), total: toNumber(option.total) }))
			.filter((option) => option.name)
			.sort((a, b) => b.total - a.total);
		if (options.length === 0) return null;
		return { kind: "war", options, total: options.reduce((sum, option) => sum + option.total, 0) };
	}

	return null;
}

export function percent(value: number, max: number): number {
	if (max <= 0) return 0;
	return Math.min(100, Math.round((value / max) * 100));
}
