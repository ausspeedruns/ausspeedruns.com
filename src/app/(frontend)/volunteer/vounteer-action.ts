"use server";

import { getPayload } from "payload";
import config from "#payload-config";
import { headers } from "next/headers";
import type { Volunteer } from "#/payload-types";

export interface VolunteerSubmissionData {
	event: number;
	roles: Volunteer["role"];
	maxTime: number;
	maxDailyHostTime: number;
	dayTimes: string[];
	specificGame: string;
	specificRunner: string;
	additionalInfo: string;
	techExperience: string;
}

export async function submitVolunteer(submissionData: VolunteerSubmissionData) {
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
			collection: "volunteers",
			data: {
				event: submissionData.event,
				volunteer: user,
				role: submissionData.roles,
				availability: submissionData.dayTimes.map((time) => ({ time })),
				maximumTime: submissionData.maxTime,
				maxDailyHostTime: submissionData.maxDailyHostTime,
				hostOtherInformation: submissionData.additionalInfo,
				hostSpecificGame: submissionData.specificGame,
				hostSpecificRunner: submissionData.specificRunner,
				techExperience: submissionData.techExperience,
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
