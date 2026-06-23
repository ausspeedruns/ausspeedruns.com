import type { Run } from "#payload-types.ts";

export function getEventLabel(run: Run): string {
	if (!run.event || typeof run.event === "number") {
		return "Event Pending";
	}

	return run.event.shortName ?? run.event.name ?? "Event Pending";
}
