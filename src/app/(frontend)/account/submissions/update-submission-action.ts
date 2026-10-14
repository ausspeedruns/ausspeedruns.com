"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getPayload } from "payload";

import config from "#payload-config";

import type { Submission } from "#payload-types.ts";

export interface UpdateSubmissionValues {
	game: string;
	category: string;
	platform: string;
	techPlatform: string;
	estimate: string;
	possibleEstimate: string;
	possibleEstimateReason: string;
	specialRequirements: string;
	video: string;
	ageRating: Submission["ageRating"];
	raceType: Submission["raceType"];
	racer: string;
	isCoop: boolean;
	canBackup: boolean;
	donationIncentives: Submission["donationIncentives"];
	availability: Submission["availability"];
}

function emptyStringToNull(value: string) {
	const trimmedValue = value.trim();
	return trimmedValue.length > 0 ? trimmedValue : null;
}

function trimString(value: string) {
	return value.trim();
}

function getRunnerId(runner: Submission["runner"]) {
	if (typeof runner === "number" || typeof runner === "string") {
		return runner;
	}

	if (runner && typeof runner === "object") {
		return runner.id;
	}

	return null;
}

export async function updateSubmission(submissionId: number, values: UpdateSubmissionValues) {
	const payload = await getPayload({ config });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		return {
			message: "You need to be logged in to edit submissions.",
			success: false,
		};
	}

	if (!values.game.trim() || !values.category.trim() || !values.platform.trim() || !values.estimate.trim()) {
		return {
			message: "Game, category, platform, and estimate are required.",
			success: false,
		};
	}

	try {
		const existingSubmission = await payload.findByID({
			collection: "submissions",
			overrideAccess: false,
			user,
			id: submissionId,
			depth: 0,
		});

		if (!existingSubmission) {
			return {
				message: "Submission not found.",
				success: false,
			};
		}

		const runnerId = getRunnerId(existingSubmission.runner);
		if (runnerId !== user.id) {
			return {
				message: "You can only edit your own submissions.",
				success: false,
			};
		}

		await payload.update({
			collection: "submissions",
			overrideAccess: false,
			user,
			id: submissionId,
			data: {
				game: trimString(values.game),
				category: trimString(values.category),
				platform: trimString(values.platform),
				techPlatform: emptyStringToNull(values.techPlatform),
				estimate: trimString(values.estimate),
				possibleEstimate: emptyStringToNull(values.possibleEstimate),
				possibleEstimateReason: emptyStringToNull(values.possibleEstimateReason),
				specialRequirements: emptyStringToNull(values.specialRequirements),
				video: emptyStringToNull(values.video),
				ageRating: values.ageRating ?? null,
				raceType: values.raceType ?? null,
				racer: emptyStringToNull(values.racer),
				isCoop: values.isCoop,
				canBackup: values.canBackup,
				donationIncentives: values.donationIncentives ?? null,
				availability: values.availability ?? null,
			},
		});

		revalidatePath("/account/submissions");

		return {
			message: "Submission updated.",
			success: true,
		};
	} catch (error) {
		console.error("Error updating submission:", error);

		return {
			message: error instanceof Error ? error.message : "Unable to save your submission right now.",
			success: false,
		};
	}
}
