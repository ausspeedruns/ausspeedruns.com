export const RUN_TYPES = [
	{ label: "Run", value: "run" },
	{ label: "Setup Buffer", value: "setupBuffer" },
	{ label: "Sleep", value: "sleep" },
	{ label: "Other", value: "other" },
] as const;

export type RunType = (typeof RUN_TYPES)[number]["value"];

export const DEFAULT_SETUP_MINUTES = 10;

export function runTypeLabel(type: RunType | null | undefined): string {
	return RUN_TYPES.find((option) => option.value === type)?.label ?? "Run";
}
