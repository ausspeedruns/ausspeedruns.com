"use server";

import { getUrqlCookieClient } from "@libs/urql";
import { gql } from "urql";

type SubmissionAgeRatingType = "m_or_lower" | "ma15" | "ra18";

type SubmissionRaceType = "no" | "solo" | "only";

type Submission = {
	userCookie?: string;
	submissionID: string;
	game: string;
	category: string;
	platform: string;
	techPlatform: string;
	estimate: string;
	possibleEstimate?: string;
	possibleEstimateReason?: string;
	ageRating?: SubmissionAgeRatingType;
	newDonationIncentives?: any;
	race?: SubmissionRaceType;
	racer?: string;
	coop: boolean;
	video: string;
	specialReqs?: string;
	willingBackup: boolean;
	availableDates: any;
};

const MUTATION_SUBMISSION = gql`
	mutation (
		$submissionID: ID!
		$game: String!
		$category: String!
		$platform: String!
		$techPlatform: String!
		$estimate: String!
		$possibleEstimate: String
		$possibleEstimateReason: String
		$ageRating: SubmissionAgeRatingType
		$newDonationIncentives: JSON
		$race: SubmissionRaceType
		$racer: String
		$coop: Boolean
		$video: String!
		$specialReqs: String
		$willingBackup: Boolean
		$availableDates: JSON!
	) {
		updateSubmission(
			where: { id: $submissionID }
			data: {
				game: $game
				category: $category
				platform: $platform
				techPlatform: $techPlatform
				estimate: $estimate
				possibleEstimate: $possibleEstimate
				possibleEstimateReason: $possibleEstimateReason
				ageRating: $ageRating
				newDonationIncentives: $newDonationIncentives
				race: $race
				racer: $racer
				coop: $coop
				video: $video
				specialReqs: $specialReqs
				willingBackup: $willingBackup
				availability: $availableDates
			}
		) {
			__typename
		}
	}
`;


export async function updateSubmission(submission: Submission) {
	const client = getUrqlCookieClient();

	if (!client) {
		throw new Error("Unauthorized");
	}

	const result = await client.mutation(MUTATION_SUBMISSION, submission).toPromise();

	if (result.error) {
		throw new Error(result.error.message);
	}

	return result.data?.updateSubmission;
}

type SubmissionBackup = {
	cookie?: string;
	submissionID: string;
	willingBackup: boolean;
};

const MUTATION_BACKUP = gql`
	mutation ($submissionID: ID, $willingBackup: Boolean!) {
		updateSubmission(where: { id: $submissionID }, data: { willingBackup: $willingBackup }) {
			__typename
		}
	}
`;

export async function updateSubmissionBackup(submission: SubmissionBackup) {
	const client = getUrqlCookieClient();

	if (!client) {
		throw new Error("Unauthorized");
	}

	const result = await client.mutation(MUTATION_BACKUP, submission).toPromise();

	return result.data?.updateSubmission;
}

type SubmissionDelete = {
	cookie?: string;
	submissionID: string;
};

const MUTATION_DELETE = gql`
	mutation ($submissionID: ID) {
		deleteSubmission(where: { id: $submissionID }) {
			__typename
		}
	}
`;

export async function deleteSubmission(submission: SubmissionDelete) {
	const client = getUrqlCookieClient();

	if (!client) {
		throw new Error("Unauthorized");
	}

	const result = await client.mutation(MUTATION_DELETE, submission).toPromise();
	
	return result.data?.deleteSubmission;
}
