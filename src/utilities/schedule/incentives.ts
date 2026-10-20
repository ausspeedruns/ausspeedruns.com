export type IncentiveType = "goal" | "war";

export interface Goal {
	goal: number;
	current: number;
}

export interface War {
	options: {
		name: string;
		total: number;
	}[];
}

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

export function validateIncentiveData(value: unknown, type: IncentiveType | null | undefined): true | string {
	if (value === null || value === undefined) return true;
	if (typeof value !== "object" || Array.isArray(value)) return "Incentive data must be an object.";

	if (type === "goal") {
		const goal = value as Partial<Goal>;
		if (!isFiniteNumber(goal.goal) || !isFiniteNumber(goal.current)) {
			return 'Goal incentives need numeric "goal" and "current" values, e.g. {"goal": 500, "current": 0}.';
		}
	}

	if (type === "war") {
		const war = value as Partial<War>;
		if (
			!Array.isArray(war.options) ||
			!war.options.every((option) => typeof option?.name === "string" && isFiniteNumber(option?.total))
		) {
			return 'War incentives need an "options" list of {"name": string, "total": number}.';
		}
	}

	return true;
}
