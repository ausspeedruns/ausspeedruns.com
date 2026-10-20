// @vitest-environment node
import { describe, expect, it } from "vitest";

import { summariseEvents } from "#/utilities/events/allTimeStats";
import { getCountdownParts } from "#/utilities/countdown";

describe("summariseEvents", () => {
	const now = new Date("2026-10-20T00:00:00Z");

	it("sums raised amounts and only counts started events", () => {
		const result = summariseEvents(
			[
				{ id: 1, timeSettings: { timezone: "Australia/Melbourne", startTime: "2026-01-10T00:00:00Z" }, postEvent: { raised: 1000 } },
				{ id: 2, timeSettings: { timezone: "Australia/Melbourne", startTime: "2026-07-10T00:00:00Z" }, postEvent: { raised: 250.5 } },
				{ id: 3, timeSettings: { timezone: "Australia/Melbourne", startTime: "2027-01-23T00:00:00Z" }, postEvent: {} },
				{ id: 4, timeSettings: { timezone: "Australia/Melbourne" } },
			],
			now,
		);

		expect(result.totalRaised).toBe(1250.5);
		expect(result.startedEventIds).toEqual([1, 2]);
	});
});

describe("getCountdownParts", () => {
	it("splits a duration into days, hours, minutes and seconds", () => {
		const ms = ((94 * 24 + 21) * 3600 + 32 * 60 + 25) * 1000;
		expect(getCountdownParts(ms)).toEqual({ days: 94, hours: 21, minutes: 32, seconds: 25 });
	});

	it("clamps negative durations to zero", () => {
		expect(getCountdownParts(-5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
	});
});
