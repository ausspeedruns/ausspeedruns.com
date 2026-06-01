"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getPayload } from "payload";
import crypto from "node:crypto";

import configPromise from "#payload-config";

import type { User } from "#/payload-types";
import { render } from "@react-email/components";
import { VerificationEmail } from "#/collections/Users/emails/verification";

export interface UserEditFormValues {
	name: string;
	email: string;
	pronouns: string;
	dateOfBirth: Date | null;
	state: string;
	discord: string;
	twitch: string;
	bluesky: string;
}

function emptyStringToNull<T extends string>(value: T) {
	const trimmedValue = value.trim();
	return trimmedValue.length > 0 ? trimmedValue : null;
}

function isStringAValidState(value?: string | null): value is NonNullable<User["state"]> {
	const validStates: NonNullable<User["state"]>[] = [
		"act",
		"nsw",
		"nt",
		"qld",
		"sa",
		"tas",
		"vic",
		"wa",
		"international",
		"nz",
	];
	return validStates.includes(value as NonNullable<User["state"]>);
}

export async function updateUserProfile(values: UserEditFormValues) {
	const payload = await getPayload({ config: configPromise });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		return {
			message: "You need to be logged in to edit your profile.",
			success: false,
		};
	}

	try {
		await payload.update({
			collection: "users",
			id: user.id,
			data: {
				name: emptyStringToNull(values.name),
				pronouns: emptyStringToNull(values.pronouns),
				state: isStringAValidState(values.state) ? values.state : null,
				socials: {
					Discord: emptyStringToNull(values.discord),
					Twitch: emptyStringToNull(values.twitch),
					Bluesky: emptyStringToNull(values.bluesky),
				},
			},
		});

		revalidatePath(`/user/${user.username}`);
		revalidatePath(`/user/${user.username}/edit`);

		return {
			message: "Profile updated.",
			success: true,
		};
	} catch (error) {
		console.error("Error updating user profile:", error);

		return {
			message: error instanceof Error ? error.message : "Unable to save your profile right now.",
			success: false,
		};
	}
}

// TODO: PayloadCMS doesn't include a native way to resend the verification email, so we need to implement it ourselves.
export async function resendVerificationEmail() {
	const payload = await getPayload({ config: configPromise });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		return {
			message: "You need to be logged in to resend the verification email.",
			success: false,
		};
	}

	const newToken = crypto.randomBytes(20).toString("hex");

	const result = await payload.update({
		collection: "users",
		id: user.id,
		data: {
			_verificationToken: newToken,
		},
	});

	if (result._verificationToken !== newToken) {
		return {
			message: "Failed to generate a new verification token. Please try again later.",
			success: false,
		};
	}

	// Send email
	await payload.sendEmail({
		to: user.email,
		subject: "AusSpeedruns - Email Verification",
		html: render(VerificationEmail({ token: newToken })),
	});
}
