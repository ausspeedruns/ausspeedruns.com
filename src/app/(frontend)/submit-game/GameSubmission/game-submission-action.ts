"use server";

import { getPayload } from "payload";
import config from "#payload-config";
import type { GameSubmissionResults } from "./submissionTypes";
import { headers } from "next/headers";

export async function createSubmission(submissionData: GameSubmissionResults) {
	const payload = await getPayload({ config });
	const userHeaders = await headers();
	const { user } = await payload.auth({ headers: userHeaders });

	if (!user || !user.id) {
		return {
			success: false,
			error: "User not authenticated",
		};
	}

	if (!user._verified) {
		return {
			success: false,
			error: "Email not verified",
		};
	}

	if (!user.socials?.Discord) {
		return {
			success: false,
			error: "Discord account not linked",
		};
	}

	try {
		const submission = await payload.create({
			collection: "submissions",
			data: {
				event: submissionData.event,
				runner: user,
				canBackup: submissionData.backup,

				game: submissionData.game,
				platform: submissionData.platform,
				techPlatform: submissionData.techPlatform,
				ageRating: submissionData.ageRating,

				category: submissionData.category,
				estimate: submissionData.estimate,
				possibleEstimate: submissionData.possibleEstimate,
				possibleEstimateReason: submissionData.possibleEstimateReason,
				specialRequirements: submissionData.specialRequirements,
				donationIncentives: submissionData.donationIncentives ?? [],
				video: submissionData.video,

				availability: JSON.stringify(
					submissionData.availability.map((available) => (available ? "true" : "false")),
				),

				raceType: submissionData.race,
				racer: submissionData.racer,
				isCoop: submissionData.coop,
			},
		});
		return { success: true, data: submission };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Submission failed",
		};
	}
}
