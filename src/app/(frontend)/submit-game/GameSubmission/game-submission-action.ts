"use server";

import { getPayload } from "payload";
import config from "#payload-config";
import type { GameSubmissionResults } from "./submissionTypes";
import { headers } from "next/headers";

// const CREATE_GAME_SUBMISSION = gql`
// 	mutation (
// 		$userId: ID!
// 		$game: String!
// 		$category: String!
// 		$platform: String!
// 		$techPlatform: String!
// 		$estimate: String!
// 		$possibleEstimate: String
// 		$possibleEstimateReason: String
// 		$ageRating: SubmissionAgeRatingType
// 		$newDonationIncentives: JSON
// 		$specialReqs: String
// 		$availableDates: JSON!
// 		$race: SubmissionRaceType
// 		$racer: String
// 		$coop: Boolean
// 		$video: String!
// 		$eventId: ID!
// 		$willingBackup: Boolean
// 	) {
// 		createSubmission(
// 			data: {
// 				runner: { connect: { id: $userId } }
// 				game: $game
// 				category: $category
// 				platform: $platform
// 				techPlatform: $techPlatform
// 				estimate: $estimate
// 				possibleEstimate: $possibleEstimate
// 				possibleEstimateReason: $possibleEstimateReason
// 				ageRating: $ageRating
// 				newDonationIncentives: $newDonationIncentives
// 				specialReqs: $specialReqs
// 				availability: $availableDates
// 				race: $race
// 				racer: $racer
// 				coop: $coop
// 				video: $video
// 				event: { connect: { id: $eventId } }
// 				willingBackup: $willingBackup
// 			}
// 		) {
// 			game
// 			category
// 			estimate
// 			possibleEstimate
// 			platform
// 			techPlatform
// 			race
// 			coop
// 			racer
// 			newDonationIncentives
// 		}
// 	}
// `;

function stringAvailabilityToBooleanArray(availability?: string) {
	if (!availability) {
		return [];
	}

	return JSON.parse(availability).map((date: string) => date === "true");
}

export async function createSubmission(submissionData: GameSubmissionResults) {
	const payload = await getPayload({ config });
	const userHeaders = await headers();
	const { user } = await payload.auth({ headers: userHeaders });

	if (!user || !user.id) {
		throw new Error("User not authenticated");
	}

	if (!user.socials?.Discord) {
		throw new Error("Discord handle is required to submit a game");
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

				availability: stringAvailabilityToBooleanArray(
					JSON.stringify(submissionData.availability.map((available) => (available ? "true" : "false"))),
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
