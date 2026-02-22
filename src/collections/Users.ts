import type { CollectionConfig } from "payload";
import { randomUUID } from "node:crypto";

import { authenticated } from "#access/authenticated.ts";

const usernameRegex = /^[a-zA-Z0-9_-~][\w-]{2,24}$/;

export const Users: CollectionConfig = {
	slug: "users",
	access: {
		admin: authenticated,
		create: authenticated,
		delete: authenticated,
		read: authenticated,
		update: authenticated,
	},
	admin: {
		useAsTitle: "username",
	},
	auth: true,
	timestamps: true,
	fields: [
		{
			name: "id",
			type: "text",
			unique: true,
			required: true,
			defaultValue: randomUUID,
			admin: {
				components: {
					Field: undefined,
				},
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
					on: "runner",
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
		},
		// Socials
		{
			name: "socials",
			type: "group",
			fields: [
				{
					name: "Discord",
					type: "text",
				},
				{
					name: "Twitch",
					type: "text",
				},
				{
					name: "Bluesky",
					type: "text",
				},
			],
		},
	],
};
