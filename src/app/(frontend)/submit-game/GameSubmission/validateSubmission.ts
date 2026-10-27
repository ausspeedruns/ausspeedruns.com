import { validateEstimate, validateUrl } from "#fields/validators.ts";
import type { GameSubmissionResults } from "./submissionTypes";

type StepErrors = Record<string, string>;

function estimateToSeconds(estimate: string): number {
	const [hours = 0, mins = 0, secs = 0] = estimate.split(":").map(Number);
	return hours * 3600 + mins * 60 + secs;
}

function isBlank(value: string | undefined | null): boolean {
	return !value || value.trim() === "";
}

function gameInfoErrors(values: GameSubmissionResults): StepErrors {
	const errors: StepErrors = {};
	if (isBlank(values.game)) errors.game = "Please enter a game";
	if (isBlank(values.platform)) errors.platform = "Please enter a platform";
	if (isBlank(values.techPlatform)) errors.techPlatform = "Please enter the platform you will run on";
	if (!values.ageRating) errors.ageRating = "Please select an age rating";
	return errors;
}

function runInfoErrors(values: GameSubmissionResults): StepErrors {
	const errors: StepErrors = {};

	if (isBlank(values.category)) errors.category = "Please enter a category";

	if (isBlank(values.video)) {
		errors.video = "Please enter a video link";
	} else {
		const videoResult = validateUrl(values.video);
		if (videoResult !== true) errors.video = videoResult;
	}

	const estimateResult = validateEstimate(values.estimate);
	if (estimateResult !== true) {
		errors.estimate = estimateResult;
	} else if (estimateToSeconds(values.estimate) === 0) {
		errors.estimate = "Please enter an estimate";
	}

	// possibleEstimate is only defined while the "possible to go under" checkbox is ticked
	if (values.possibleEstimate !== undefined) {
		if (isBlank(values.possibleEstimateReason)) {
			errors.possibleEstimateReason = "Please enter a reason for the lower estimate";
		}

		const possibleResult = validateEstimate(values.possibleEstimate);
		if (possibleResult !== true) {
			errors.possibleEstimate = possibleResult;
		} else if (estimateToSeconds(values.possibleEstimate) === 0) {
			errors.possibleEstimate = "Please enter a lower estimate";
		} else if (
			!errors.estimate &&
			estimateToSeconds(values.possibleEstimate) >= estimateToSeconds(values.estimate)
		) {
			errors.possibleEstimate = "Must be lower than your estimate";
		}
	}

	values.donationIncentives?.forEach((incentive, i) => {
		if (isBlank(incentive.title)) errors[`donationIncentives.${i}.title`] = "Please enter a name";
	});

	return errors;
}

function availabilityErrors(values: GameSubmissionResults, eventDays: number): StepErrors {
	// Events without dates yet can't ask for availability
	if (eventDays <= 0) return {};
	if (values.availability.slice(0, eventDays).some(Boolean)) return {};
	return { availability: "Please select at least one day you are available" };
}

function raceCoopErrors(values: GameSubmissionResults): StepErrors {
	if (values.race === "noRace" || !isBlank(values.racer)) return {};
	return { racer: "Please enter the name of the other runner(s)" };
}

/** Returns only the errors for the given step; an empty object means the step is complete. */
export function getStepErrors(step: number, values: GameSubmissionResults, eventDays: number): StepErrors {
	switch (step) {
		case 0:
			return gameInfoErrors(values);
		case 1:
			return runInfoErrors(values);
		case 2:
			return availabilityErrors(values, eventDays);
		case 3:
			return raceCoopErrors(values);
		default:
			return {};
	}
}
