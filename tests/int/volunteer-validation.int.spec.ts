import { describe, expect, it } from "vitest";

import {
	getVolunteerErrors,
	NOT_AVAILABLE,
	toSubmissionData,
	type VolunteerFormValues,
} from "#/app/(frontend)/volunteer/validateVolunteer";

const base: VolunteerFormValues = {
	event: 1,
	roles: ["frontDesk"],
	confirm: true,
	dayTimes: ["10am - 6pm", "", ""],
	maxTime: 8,
	maxDailyHostTime: "",
	specificGame: "",
	specificRunner: "",
	additionalInfo: "",
	techExperience: "",
};

describe("volunteer validation", () => {
	it("accepts a complete front desk application", () => {
		expect(getVolunteerErrors(base, 3)).toEqual({});
	});

	it("requires a role and confirmation", () => {
		const errors = getVolunteerErrors({ ...base, roles: [], confirm: false }, 3);
		expect(Object.keys(errors).sort()).toEqual(["confirm", "roles"]);
	});

	it("requires total hours for every role, not just hosts", () => {
		expect(getVolunteerErrors({ ...base, maxTime: "" }, 3).maxTime).toBeDefined();
		expect(getVolunteerErrors({ ...base, roles: ["stageHand"], maxTime: 0 }, 3).maxTime).toBeDefined();
	});

	it("requires host shift length, capped at the total hours", () => {
		const host = { ...base, roles: ["host" as const] };
		expect(getVolunteerErrors(host, 3).maxDailyHostTime).toBeDefined();
		expect(getVolunteerErrors({ ...host, maxDailyHostTime: 10 }, 3).maxDailyHostTime).toBe(
			"This can't be more than your total hours",
		);
		expect(getVolunteerErrors({ ...host, maxDailyHostTime: 3 }, 3)).toEqual({});
	});

	it("requires tech experience for tech applicants", () => {
		expect(getVolunteerErrors({ ...base, roles: ["tech"], techExperience: "  " }, 3).techExperience).toBeDefined();
		expect(getVolunteerErrors({ ...base, roles: ["tech"], techExperience: "None" }, 3)).toEqual({});
	});

	it("needs at least one available day, unless the event has no dates", () => {
		const noDays = { ...base, dayTimes: ["", " ", ""] };
		expect(getVolunteerErrors(noDays, 3).dayTimes).toBeDefined();
		expect(getVolunteerErrors({ ...noDays, dayTimes: [] }, 0)).toEqual({});
	});
});

describe("toSubmissionData", () => {
	it("marks blank days as not available and converts hours to numbers", () => {
		const data = toSubmissionData({ ...base, maxTime: "8" }, 3);
		expect(data.dayTimes).toEqual(["10am - 6pm", NOT_AVAILABLE, NOT_AVAILABLE]);
		expect(data.maxTime).toBe(8);
	});

	it("drops answers for roles that were deselected", () => {
		const data = toSubmissionData(
			{
				...base,
				maxDailyHostTime: 3,
				specificGame: "Portal",
				specificRunner: "Someone",
				additionalInfo: "Hi",
				techExperience: "OBS",
			},
			3,
		);
		expect(data).toMatchObject({
			maxDailyHostTime: 0,
			specificGame: "",
			specificRunner: "",
			additionalInfo: "",
			techExperience: "",
		});
	});
});
