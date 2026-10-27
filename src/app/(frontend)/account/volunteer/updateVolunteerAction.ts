"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getPayload } from "payload";

import config from "#payload-config";

import type { Volunteer } from "#payload-types.ts";

export interface UpdateVolunteerValues {
	role: Volunteer["role"];
	availability: string[];
	maximumTime: number | null | undefined;
	maxDailyHostTime: number | null | undefined;
	hostSpecificGame: string;
	hostSpecificRunner: string;
	hostOtherInformation: string;
	techExperience: string;
}

function trimToNull(value: string) {
	const trimmedValue = value.trim();
	return trimmedValue.length > 0 ? trimmedValue : null;
}

function resolveVolunteerUserId(value: Volunteer["volunteer"]) {
	if (typeof value === "number" || typeof value === "string") {
		return value;
	}

	if (value && typeof value === "object") {
		return value.id;
	}

	return null;
}

export async function updateVolunteer(volunteerId: number, values: UpdateVolunteerValues) {
	const payload = await getPayload({ config });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		return {
			message: "You need to be logged in to edit volunteer applications.",
			success: false,
		};
	}

	if (!values.role || values.role.length === 0) {
		return {
			message: "Select at least one role.",
			success: false,
		};
	}

	try {
		const existingVolunteer = await payload.findByID({
			collection: "volunteers",
			overrideAccess: false,
			user,
			id: volunteerId,
			depth: 0,
		});

		if (!existingVolunteer) {
			return {
				message: "Volunteer application not found.",
				success: false,
			};
		}

		const volunteerUserId = resolveVolunteerUserId(existingVolunteer.volunteer);
		if (volunteerUserId !== user.id) {
			return {
				message: "You can only edit your own volunteer applications.",
				success: false,
			};
		}

		await payload.update({
			collection: "volunteers",
			overrideAccess: false,
			user,
			id: volunteerId,
			data: {
				role: values.role,
				// Payload array fields must be an array; null throws during update
				availability: values.availability.map((time) => ({ time })),
				maximumTime: values.maximumTime ?? null,
				maxDailyHostTime: values.maxDailyHostTime ?? null,
				hostSpecificGame: trimToNull(values.hostSpecificGame),
				hostSpecificRunner: trimToNull(values.hostSpecificRunner),
				hostOtherInformation: trimToNull(values.hostOtherInformation),
				techExperience: trimToNull(values.techExperience),
			},
		});

		revalidatePath("/account/volunteer");

		return {
			message: "Volunteer application updated.",
			success: true,
		};
	} catch (error) {
		console.error("Error updating volunteer application:", error);

		return {
			message: error instanceof Error ? error.message : "Unable to save your volunteer application right now.",
			success: false,
		};
	}
}

export async function withdrawVolunteer(volunteerId: number) {
	const payload = await getPayload({ config });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		return { message: "You need to be logged in to withdraw applications.", success: false };
	}

	try {
		// Access control limits this to the volunteer's own applications, and a hook blocks reviewed ones
		await payload.delete({ collection: "volunteers", id: volunteerId, overrideAccess: false, user });
		revalidatePath("/account/volunteer");
		return { message: "Application withdrawn.", success: true };
	} catch (error) {
		console.error("Error withdrawing volunteer application:", error);
		return {
			message: error instanceof Error ? error.message : "Unable to withdraw your application right now.",
			success: false,
		};
	}
}
