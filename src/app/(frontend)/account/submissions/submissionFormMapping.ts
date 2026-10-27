import type { Submission } from "#payload-types.ts";
import type {
	DonationIncentive,
	GameSubmissionResults,
} from "#/app/(frontend)/submit-game/GameSubmission/submissionTypes";
import type { UpdateSubmissionValues } from "./updateSubmissionAction";

/** Availability is stored as a JSON string (or array) of "true"/"false" values, one per event day. */
export function parseAvailability(value: Submission["availability"]): boolean[] {
	let parsed: unknown = value;
	if (typeof value === "string") {
		try {
			parsed = JSON.parse(value);
		} catch {
			return [];
		}
	}

	if (!Array.isArray(parsed)) return [];
	return parsed.map((day) => day === true || day === "true");
}

export function parseDonationIncentives(value: Submission["donationIncentives"]): DonationIncentive[] {
	if (!Array.isArray(value)) return [];
	return value
		.filter(
			(incentive): incentive is Record<string, unknown> => Boolean(incentive) && typeof incentive === "object",
		)
		.map((incentive) => ({
			title: String(incentive.title ?? ""),
			time: incentive.time ? String(incentive.time) : undefined,
			description: incentive.description ? String(incentive.description) : undefined,
		}));
}

function eventId(event: Submission["event"]): number {
	return typeof event === "object" && event ? event.id : event;
}

export function submissionToFormValues(submission: Submission): GameSubmissionResults {
	const incentives = parseDonationIncentives(submission.donationIncentives);

	return {
		event: eventId(submission.event),
		game: submission.game ?? "",
		platform: submission.platform ?? "",
		techPlatform: submission.techPlatform || submission.platform || "",
		ageRating: submission.ageRating ?? null,
		category: submission.category ?? "",
		video: submission.video ?? "",
		estimate: submission.estimate ?? "",
		possibleEstimate: submission.possibleEstimate || undefined,
		possibleEstimateReason: submission.possibleEstimate ? (submission.possibleEstimateReason ?? "") : undefined,
		lowerEstimate: "",
		specialRequirements: submission.specialRequirements ?? "",
		donationIncentives: incentives.length > 0 ? incentives : undefined,
		availability: parseAvailability(submission.availability),
		race: submission.raceType ?? "noRace",
		racer: submission.racer ?? "",
		coop: Boolean(submission.isCoop),
		backup: Boolean(submission.canBackup),
	};
}

export function formValuesToUpdate(values: GameSubmissionResults, eventDays: number): UpdateSubmissionValues {
	const isRace = values.race !== "noRace";
	const incentives = (values.donationIncentives ?? [])
		.filter((incentive) => incentive.title.trim())
		.map((incentive) => ({
			title: incentive.title.trim(),
			...(incentive.time?.trim() ? { time: incentive.time.trim() } : {}),
			...(incentive.description?.trim() ? { description: incentive.description.trim() } : {}),
		}));

	return {
		game: values.game,
		category: values.category,
		platform: values.platform,
		techPlatform: values.techPlatform,
		estimate: values.estimate,
		possibleEstimate: values.possibleEstimate ?? "",
		possibleEstimateReason: values.possibleEstimate !== undefined ? (values.possibleEstimateReason ?? "") : "",
		specialRequirements: values.specialRequirements,
		video: values.video,
		ageRating: values.ageRating,
		raceType: values.race,
		racer: isRace ? values.racer : "",
		isCoop: isRace && values.coop,
		canBackup: values.backup,
		donationIncentives: incentives,
		// Same format the submission form uses when creating. Events without dates keep whatever was stored.
		availability: JSON.stringify(
			Array.from({ length: eventDays > 0 ? eventDays : values.availability.length }, (_, i) =>
				values.availability[i] ? "true" : "false",
			),
		),
	};
}
