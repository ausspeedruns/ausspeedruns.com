import { describe, expect, it } from "vitest";

import {
	formValuesToUpdate,
	parseAvailability,
	submissionToFormValues,
} from "#/app/(frontend)/account/submissions/submissionFormMapping";
import {
	formValuesToVolunteerUpdate,
	volunteerToFormValues,
} from "#/app/(frontend)/account/volunteer/volunteerFormMapping";
import type { Submission, Volunteer } from "#payload-types.ts";

const submission = {
	id: 1,
	event: 7,
	runner: "user",
	status: "pending",
	game: "Portal",
	category: "Glitchless",
	platform: "PC",
	techPlatform: null,
	estimate: "00:30:00",
	possibleEstimate: "",
	possibleEstimateReason: "",
	video: "https://youtu.be/x",
	ageRating: "m_or_lower",
	raceType: null,
	racer: null,
	isCoop: false,
	canBackup: true,
	specialRequirements: null,
	donationIncentives: [{ title: "Name the file", time: "2 mins" }],
	availability: '["true","false","true"]',
	createdAt: "",
	updatedAt: "",
} as unknown as Submission;

describe("submission edit mapping", () => {
	it("parses availability stored as a JSON string or an array", () => {
		expect(parseAvailability('["true","false"]')).toEqual([true, false]);
		expect(parseAvailability([true, "false", "true"])).toEqual([true, false, true]);
		expect(parseAvailability(null)).toEqual([]);
		expect(parseAvailability("not json")).toEqual([]);
	});

	it("maps a stored submission into form values", () => {
		const values = submissionToFormValues(submission);
		expect(values).toMatchObject({
			event: 7,
			techPlatform: "PC",
			possibleEstimate: undefined,
			possibleEstimateReason: undefined,
			race: "noRace",
			availability: [true, false, true],
			donationIncentives: [{ title: "Name the file", time: "2 mins" }],
		});
	});

	it("round-trips back to the update payload", () => {
		const values = submissionToFormValues(submission);
		const update = formValuesToUpdate({ ...values, racer: "Ignored", coop: true }, 3);

		expect(update.availability).toBe('["true","false","true"]');
		expect(update.possibleEstimate).toBe("");
		// Race info is dropped when not racing
		expect(update.racer).toBe("");
		expect(update.isCoop).toBe(false);
		expect(update.donationIncentives).toEqual([{ title: "Name the file", time: "2 mins" }]);
	});

	it("drops blank incentives and keeps stored availability for events without dates", () => {
		const values = submissionToFormValues(submission);
		const update = formValuesToUpdate({ ...values, donationIncentives: [{ title: " " }] }, 0);
		expect(update.donationIncentives).toEqual([]);
		expect(update.availability).toBe('["true","false","true"]');
	});
});

const volunteer = {
	id: 2,
	event: { id: 9 },
	volunteer: "user",
	status: "pending",
	role: ["host", "tech"],
	availability: [{ time: "10am - 6pm" }, { time: "Not available" }],
	maximumTime: 10,
	maxDailyHostTime: 3,
	hostSpecificGame: "Portal",
	hostSpecificRunner: null,
	hostOtherInformation: null,
	techExperience: "OBS",
	createdAt: "",
	updatedAt: "",
} as unknown as Volunteer;

describe("volunteer edit mapping", () => {
	it("maps a stored application into form values", () => {
		expect(volunteerToFormValues(volunteer)).toMatchObject({
			event: 9,
			roles: ["host", "tech"],
			confirm: true,
			dayTimes: ["10am - 6pm", ""],
			maxTime: 10,
			maxDailyHostTime: 3,
			specificGame: "Portal",
		});
	});

	it("clears host answers when the host role is removed", () => {
		const values = { ...volunteerToFormValues(volunteer), roles: ["tech" as const] };
		const update = formValuesToVolunteerUpdate(values, 2, volunteer);
		expect(update).toMatchObject({
			role: ["tech"],
			availability: ["10am - 6pm", "Not available"],
			maxDailyHostTime: null,
			hostSpecificGame: "",
			techExperience: "OBS",
		});
	});

	it("keeps stored availability for events without dates", () => {
		const update = formValuesToVolunteerUpdate({ ...volunteerToFormValues(volunteer), dayTimes: [] }, 0, volunteer);
		expect(update.availability).toEqual(["10am - 6pm", "Not available"]);
	});
});
