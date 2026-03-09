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

	console.log(submissionData);

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

	// let donationIncentives = [];
	// if (submissionData.get("donationIncentives")) {
	// 	donationIncentives = JSON.parse(submissionData.get("donationIncentives") as string);
	// }

	// const data: GameSubmissionData & { userId: string } = {
	// 	game: submissionData.get("game") as string,
	// 	platform: submissionData.get("platform") as string,
	// 	techPlatform: submissionData.get("techPlatform") as string,
	// 	ageRating: submissionData.get("ageRating") as AgeRatingLiterals,
	// 	category: submissionData.get("category") as string,
	// 	estimate: submissionData.get("estimate") as string,
	// 	possibleEstimate: (submissionData.get("possibleEstimate") as string) ?? "",
	// 	possibleEstimateReason: (submissionData.get("possibleEstimateReason") as string) ?? "",
	// 	specialReqs: (submissionData.get("specialReqs") as string) ?? "",
	// 	newDonationIncentives: donationIncentives,
	// 	availableDates: stringAvailabilityToBooleanArray(submissionData.get("availability") as string),
	// 	race: submissionData.get("race") as RaceLiterals,
	// 	racer: (submissionData.get("racer") as string) ?? "",
	// 	coop: submissionData.get("coop") === "true",
	// 	video: submissionData.get("video") as string,
	// 	eventId: submissionData.get("eventId") as string,
	// 	willingBackup: submissionData.get("willingBackup") === "true",
	// 	// userId: user.user.id,
	// };

	// const client = getUrqlCookieClient();

	// if (!client) {
	// 	throw new Error("Unauthorized");
	// }

	// const result = await client.mutation(CREATE_GAME_SUBMISSION, data).toPromise();

	// if (result.error) {
	// 	throw result.error;
	// }

	// // return result.data.createSubmission as MUTATION_SUBMISSION_RESULTS["createSubmission"];
	// return result.data.createSubmission;
}
