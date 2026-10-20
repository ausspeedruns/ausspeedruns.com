export const RUN_TYPES = [
	{ label: "Run", value: "run" },
	{ label: "Medley", value: "medley" },
	{ label: "Segment", value: "segment" },
	{ label: "Setup Buffer", value: "setupBuffer" },
	{ label: "Sleep", value: "sleep" },
	{ label: "Other", value: "other" },
] as const;

export type RunType = (typeof RUN_TYPES)[number]["value"];

/** Types that are counted as a "run" for stats, profiles, game pages and VODs. */
export const COUNTED_RUN_TYPES = ["run", "medley"] as const satisfies readonly RunType[];

/** Types that take default setup time after them and can have runners, incentives and submissions. */
export function isPerformanceType(type: RunType | null | undefined): boolean {
	return type === "run" || type === "medley";
}

export const DEFAULT_SETUP_MINUTES = 10;

export function runTypeLabel(type: RunType | null | undefined): string {
	return RUN_TYPES.find((option) => option.value === type)?.label ?? "Run";
}
