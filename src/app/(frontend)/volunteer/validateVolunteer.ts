import type { VolunteerSubmissionData } from "./volunteerAction";

export type VolunteerFormValues = Omit<VolunteerSubmissionData, "maxTime" | "maxDailyHostTime"> & {
	// NumberInput reports "" when cleared
	maxTime: number | string;
	maxDailyHostTime: number | string;
	confirm: boolean;
};

export const NOT_AVAILABLE = "Not available";

function isBlank(value: string | undefined | null) {
	return !value || value.trim() === "";
}

function toHours(value: number | string): number {
	const hours = typeof value === "number" ? value : Number(value);
	return Number.isFinite(hours) ? hours : 0;
}

/** Returns field errors for the volunteer form; an empty object means it's valid. */
export function getVolunteerErrors(values: VolunteerFormValues, eventDays: number): Record<string, string> {
	const errors: Record<string, string> = {};
	const isHost = values.roles.includes("host");

	if (!values.event) errors.event = "Please select an event";
	if (values.roles.length === 0) errors.roles = "Please select at least one role";

	if (values.roles.length > 0) {
		const maxTime = toHours(values.maxTime);
		if (maxTime <= 0) errors.maxTime = "Please enter the most hours you'd like to volunteer";

		if (isHost) {
			const maxHostTime = toHours(values.maxDailyHostTime);
			if (maxHostTime <= 0) {
				errors.maxDailyHostTime = "Please enter the most hours you'd like to host in one sitting";
			} else if (maxTime > 0 && maxHostTime > maxTime) {
				errors.maxDailyHostTime = "This can't be more than your total hours";
			}
		}

		if (values.roles.includes("tech") && isBlank(values.techExperience)) {
			errors.techExperience = "Please tell us about your tech experience (it's fine to say none!)";
		}

		if (eventDays > 0 && !values.dayTimes.slice(0, eventDays).some((time) => !isBlank(time))) {
			errors.dayTimes = "Please enter your availability for at least one day";
		}
	}

	if (!values.confirm) errors.confirm = "Please confirm you can be at the venue for your shifts";

	return errors;
}

/** Converts form values into what the server action expects, dropping answers for unselected roles. */
export function toSubmissionData(values: VolunteerFormValues, eventDays: number): VolunteerSubmissionData {
	const isHost = values.roles.includes("host");
	const isTech = values.roles.includes("tech");

	return {
		event: values.event,
		roles: values.roles,
		maxTime: toHours(values.maxTime),
		maxDailyHostTime: isHost ? toHours(values.maxDailyHostTime) : 0,
		dayTimes: values.dayTimes.slice(0, eventDays).map((time) => (isBlank(time) ? NOT_AVAILABLE : time.trim())),
		specificGame: isHost ? values.specificGame.trim() : "",
		specificRunner: isHost ? values.specificRunner.trim() : "",
		additionalInfo: isHost ? values.additionalInfo.trim() : "",
		techExperience: isTech ? values.techExperience.trim() : "",
	};
}
