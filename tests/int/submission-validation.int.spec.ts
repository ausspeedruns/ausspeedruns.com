import { describe, expect, it } from "vitest";

import { getStepErrors } from "#/app/(frontend)/submit-game/GameSubmission/validateSubmission";
import { getEventDays } from "#/utilities/getEventDays";
import type { GameSubmissionResults } from "#/app/(frontend)/submit-game/GameSubmission/submissionTypes";

const validValues: GameSubmissionResults = {
	event: 1,
	game: "Super Mario 64",
	platform: "N64",
	techPlatform: "N64",
	ageRating: "m_or_lower",
	category: "16 Star",
	video: "https://youtu.be/abc123",
	estimate: "00:20:00",
	possibleEstimate: undefined,
	possibleEstimateReason: undefined,
	lowerEstimate: "",
	specialRequirements: "",
	donationIncentives: undefined,
	availability: [true],
	race: "noRace",
	racer: "",
	coop: false,
	backup: true,
};

const EVENT_DAYS = 3;
const errorsFor = (step: number, values: GameSubmissionResults) => getStepErrors(step, values, EVENT_DAYS);

describe("getEventDays", () => {
	it("counts the event days inclusively", () => {
		expect(getEventDays("2026-07-10T00:00:00.000Z", "2026-07-12T00:00:00.000Z")).toBe(3);
	});

	it("returns 0 when the event has no dates", () => {
		expect(getEventDays("", "")).toBe(0);
		expect(getEventDays("2026-07-10T00:00:00.000Z", "")).toBe(0);
	});
});

describe("submission step validation", () => {
	it("skips availability when the event has no dates", () => {
		expect(getStepErrors(2, { ...validValues, availability: [] }, 0)).toEqual({});
	});

	it("ignores availability ticked beyond the event's length", () => {
		expect(errorsFor(2, { ...validValues, availability: [false, false, false, true] }).availability).toBeDefined();
	});

	it("passes every step for complete values", () => {
		for (let step = 0; step < 5; step++) {
			expect(errorsFor(step, validValues)).toEqual({});
		}
	});

	it("requires game info fields", () => {
		const errors = errorsFor(0, { ...validValues, game: " ", platform: "", techPlatform: "" });
		expect(Object.keys(errors).sort()).toEqual(["game", "platform", "techPlatform"]);
	});

	it("rejects an invalid video URL", () => {
		expect(errorsFor(1, { ...validValues, video: "asdfghjkl" }).video).toBeDefined();
		expect(errorsFor(1, { ...validValues, video: "ftp://example.com" }).video).toBeDefined();
		expect(errorsFor(1, { ...validValues, video: "" }).video).toBeDefined();
	});

	it("rejects a zero estimate", () => {
		expect(errorsFor(1, { ...validValues, estimate: "00:00:00" }).estimate).toBeDefined();
	});

	it("requires a reason and a lower value for a possible estimate", () => {
		const errors = errorsFor(1, {
			...validValues,
			possibleEstimate: "00:25:00",
			possibleEstimateReason: "",
		});
		expect(errors.possibleEstimate).toBe("Must be lower than your estimate");
		expect(errors.possibleEstimateReason).toBeDefined();

		expect(
			errorsFor(1, { ...validValues, possibleEstimate: "00:05:00", possibleEstimateReason: "New skip" }),
		).toEqual({});
	});

	it("requires a name for each donation incentive", () => {
		const errors = errorsFor(1, { ...validValues, donationIncentives: [{ title: "Hat" }, { title: "" }] });
		expect(errors).toEqual({ "donationIncentives.1.title": "Please enter a name" });
	});

	it("requires at least one available day", () => {
		expect(errorsFor(2, { ...validValues, availability: [] }).availability).toBeDefined();
		expect(errorsFor(2, { ...validValues, availability: [false, false] }).availability).toBeDefined();
	});

	it("requires the other runner's name for a race or co-op", () => {
		expect(errorsFor(3, { ...validValues, race: "solo", racer: "" }).racer).toBeDefined();
		expect(errorsFor(3, { ...validValues, race: "only", racer: "Luigi" })).toEqual({});
	});
});
