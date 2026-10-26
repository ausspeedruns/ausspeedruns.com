import type { CollectionConfig } from "payload";
import { randomUUID } from "node:crypto";

import { staff } from "#access/staff.ts";
import { manageUsers } from "#access/manageUsers.ts";
import { sameUserOrManageUsers } from "#access/sameUserOrManageUsers.ts";
import { anyone } from "#access/anyone.ts";
import { isAdminField } from "#access/field/isAdmin.ts";
import { render } from "@react-email/components";
import { clearLegacyPasswordOnChange, upgradeLegacyPassword } from "./hooks/legacyPassword.ts";
import { getServerSideURL } from "#utilities/getURL.ts";
import { preventCaseInsensitiveDuplicate } from "#hooks/preventCaseInsensitiveDuplicate.ts";

const usernameRegex = /^[\w~-]{3,25}$/;

export const Users: CollectionConfig<"users"> = {
	slug: "users",
	access: {
		admin: staff,
		create: anyone, // Allow anyone to create an account
		delete: manageUsers,
		read: sameUserOrManageUsers,
		update: sameUserOrManageUsers,
	},
	admin: {
		useAsTitle: "username",
		defaultColumns: ["username", "name", "email", "roles", "createdAt"],
		listSearchableFields: ["username", "name", "email"],
		group: "Users",
	},
	// Only public profile fields are included when users are populated through relationships
	defaultPopulate: {
		username: true,
		name: true,
		pronouns: true,
		socials: true,
	},
	hooks: {
		beforeOperation: [upgradeLegacyPassword],
		// Usernames are used in public URLs (/user/<username>), which are matched case-insensitively
		beforeValidate: [preventCaseInsensitiveDuplicate("username", "That username is already taken.")],
		beforeChange: [clearLegacyPasswordOnChange],
	},
	auth: {
		// When served over HTTPS (production), never send the auth cookie over plain HTTP
		cookies: {
			secure: getServerSideURL().startsWith("https://"),
			sameSite: "Lax",
		},
		// Lock an account for 10 minutes after 5 failed logins
		maxLoginAttempts: 5,
		lockTime: 10 * 60 * 1000,
		// Lets service accounts (e.g. the stream graphics) authenticate with `Authorization: users API-Key <key>`
		useAPIKey: true,
		verify: {
			generateEmailSubject: () => "AusSpeedruns - Email Verification",
			generateEmailHTML: async ({ token }) => {
				if (!token) throw new Error("Verification token was not provided.");
				// Lazy-loaded so the config can be imported by plain `node` scripts (no JSX support)
				const { VerificationEmail } = await import("./emails/verification.tsx");
				return await render(VerificationEmail({ token }));
			},
		},
		forgotPassword: {
			generateEmailSubject: () => "AusSpeedruns - Password Reset",
			generateEmailHTML: async (data) => {
				if (!data?.token || !data.user?.email) {
					throw new Error("Invalid data provided for forgot password email.");
				}

				const { ResetPasswordEmail } = await import("./emails/reset-password.tsx");
				return await render(ResetPasswordEmail({ token: data.token }));
			},
		},
	},
	timestamps: true,
	fields: [
		{
			name: "id",
			type: "text",
			unique: true,
			required: true,
			defaultValue: randomUUID,
			admin: {
				readOnly: true,
				position: "sidebar",
			},
		},
		{
			name: "username",
			type: "text",
			required: true,
			unique: true,
			validate: (value: unknown) => {
				if (typeof value !== "string" || !usernameRegex.test(value)) {
					return "Username must be 3-25 characters long and can only contain letters, numbers, underscores, tildes, and hyphens.";
				}

				return true;
			},
		},
		{
			name: "name",
			type: "text",
		},
		{
			name: "dateOfBirth",
			type: "date",
			required: true,
			validate: (value: unknown) => {
				// The user has to be at least 13 years old
				if (typeof value !== "string") {
					return "Date of birth must be a valid date string.";
				}
				const date = new Date(value);
				if (Number.isNaN(date.getTime())) {
					return "Date of birth must be a valid date.";
				}
				const today = new Date();
				let age = today.getFullYear() - date.getFullYear();
				const monthDiff = today.getMonth() - date.getMonth();
				const dayDiff = today.getDate() - date.getDate();
				if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
					age--;
				}
				if (age < 13) {
					return "You must be at least 13 years old to create an account.";
				}
				return true;
			},
		},
		{
			name: "pronouns",
			type: "text",
			maxLength: 128, // 128 characters to nerd-snipe nerd
		},
		{
			name: "state",
			type: "select",
			options: [
				{
					label: "Victoria",
					value: "vic",
				},
				{
					label: "New South Wales",
					value: "nsw",
				},
				{
					label: "Queensland",
					value: "qld",
				},
				{
					label: "Western Australia",
					value: "wa",
				},
				{
					label: "South Australia",
					value: "sa",
				},
				{
					label: "Tasmania",
					value: "tas",
				},
				{
					label: "Northern Territory",
					value: "nt",
				},
				{
					label: "Australian Capital Territory",
					value: "act",
				},
				{
					label: "New Zealand",
					value: "nz",
				},
				{
					label: "International",
					value: "international",
				},
			],
		},
		{
			name: "speedrunData",
			type: "group",
			fields: [
				{
					name: "runs",
					type: "join",
					collection: "runs",
					on: "runners",
					defaultSort: "-scheduledTime",
				},
				{
					name: "submissions",
					type: "join",
					collection: "submissions",
					on: "runner",
				},
				{
					name: "orders",
					type: "join",
					collection: "orders",
					on: "user",
				},
				{
					name: "volunteers",
					type: "join",
					collection: "volunteers",
					on: "volunteer",
				},
			],
		},
		{
			name: "roles",
			type: "relationship",
			relationTo: "roles",
			hasMany: true,
			access: {
				update: isAdminField,
				create: isAdminField,
			},
		},
		{
			name: "socials",
			type: "group",
			fields: [
				{
					name: "discord",
					type: "text",
				},
				{
					name: "twitch",
					type: "text",
				},
				{
					name: "bluesky",
					type: "text",
				},
			],
		},
		{
			name: "stripeCustomerId",
			type: "text",
			admin: { readOnly: true, position: "sidebar" },
			access: { create: () => false, update: () => false }, // only set programmatically
		},
		{
			// Keystone bcrypt hash for users who haven't logged in since the migration (see hooks/legacyPassword.ts)
			name: "legacyPasswordHash",
			type: "text",
			hidden: true,
			access: { read: () => false, create: () => false, update: () => false },
		},
	],
};
