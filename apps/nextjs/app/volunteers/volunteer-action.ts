"use server";

import { getRegisteredClient } from "@libs/urql";
import { gql } from "urql";

type VolunteerSubmission = {
	userId: string;
	jobType: string;
	eventHostTime: number;
	maxDailyHostTime: number;
	dayTimes: string[];
	specificGame: string;
	specificRunner: string;
	additionalInfo: string;
	experience: string;
	favMeme: string;
	runnerManagementAvailability: string;
	techAvailability: string;
	techExperience: string;
	eventId: string;
};

const ADD_VOLUNTEER_MUTATION = gql`
	mutation (
		$userId: ID
		$jobType: VolunteerJobTypeType
		$eventHostTime: Int
		$maxDailyHostTime: Int
		$dayTimes: JSON
		$specificGame: String
		$specificRunner: String
		$additionalInfo: String
		$experience: String
		$favMeme: String
		$runnerManagementAvailability: String
		$techAvailability: String
		$techExperience: String
		$eventId: ID
	) {
		createVolunteer(
			data: {
				volunteer: { connect: { id: $userId } }
				jobType: $jobType
				eventHostTime: $eventHostTime
				maxDailyHostTime: $maxDailyHostTime
				dayTimes: $dayTimes
				specificGame: $specificGame
				specificRunner: $specificRunner
				additionalInfo: $additionalInfo
				experience: $experience
				favMeme: $favMeme
				runnerManagementAvailability: $runnerManagementAvailability
				techAvailablity: $techAvailability
				techExperience: $techExperience
				event: { connect: { id: $eventId } }
			}
		) {
			__typename
		}
	}
`;

export async function createSubmission(volunteer: VolunteerSubmission) {
	const client = getRegisteredClient();
	const result = await client.mutation(ADD_VOLUNTEER_MUTATION, volunteer).toPromise();
	return result.data?.createVolunteer;
}
