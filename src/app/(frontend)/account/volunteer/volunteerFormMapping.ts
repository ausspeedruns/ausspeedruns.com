import type { Volunteer } from "#payload-types.ts";
import {
	NOT_AVAILABLE,
	toSubmissionData,
	type VolunteerFormValues,
} from "#/app/(frontend)/volunteer/validateVolunteer";
import type { UpdateVolunteerValues } from "./updateVolunteerAction";

export function volunteerToFormValues(volunteer: Volunteer): VolunteerFormValues {
	const event = volunteer.event;

	return {
		event: typeof event === "object" && event ? event.id : event,
		roles: volunteer.role ?? [],
		// Already agreed to when applying
		confirm: true,
		dayTimes: (volunteer.availability ?? []).map((slot) =>
			!slot.time || slot.time === NOT_AVAILABLE ? "" : slot.time,
		),
		maxTime: volunteer.maximumTime || "",
		maxDailyHostTime: volunteer.maxDailyHostTime || "",
		specificGame: volunteer.hostSpecificGame ?? "",
		specificRunner: volunteer.hostSpecificRunner ?? "",
		additionalInfo: volunteer.hostOtherInformation ?? "",
		techExperience: volunteer.techExperience ?? "",
	};
}

export function formValuesToVolunteerUpdate(
	values: VolunteerFormValues,
	eventDays: number,
	original: Volunteer,
): UpdateVolunteerValues {
	const data = toSubmissionData(values, eventDays);
	const isHost = values.roles.includes("host");

	return {
		role: data.roles,
		// Without event dates there are no day inputs, so keep whatever was stored
		availability:
			eventDays > 0
				? data.dayTimes
				: (original.availability ?? []).map((slot) => slot.time ?? "").filter(Boolean),
		maximumTime: data.maxTime,
		maxDailyHostTime: isHost ? data.maxDailyHostTime : null,
		hostSpecificGame: data.specificGame,
		hostSpecificRunner: data.specificRunner,
		hostOtherInformation: data.additionalInfo,
		techExperience: data.techExperience,
	};
}
