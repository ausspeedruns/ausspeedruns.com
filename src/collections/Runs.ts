import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

import type { Run } from "#/payload-types";
import { anyone } from "#access/anyone.ts";
import { relationId } from "#access/helpers.ts";
import { manageContent } from "#access/manageContent.ts";
import { validateEstimate, validateUrl } from "#fields/validators.ts";

export async function buildRunTitle(
	req: Parameters<CollectionBeforeChangeHook>[0]["req"],
	gameValue: Run["game"] | null | undefined,
	category: string | null | undefined,
): Promise<string> {
	const gameId = relationId(gameValue);
	let gameName: string | undefined;

	if (gameValue && typeof gameValue === "object") {
		gameName = gameValue.name;
	} else if (gameId !== null) {
		const game = await req.payload
			.findByID({ collection: "games", id: gameId, depth: 0, overrideAccess: true, req, select: { name: true } })
			.catch(() => null);
		gameName = game?.name;
	}

	return [gameName, category].filter(Boolean).join(" — ") || "Untitled run";
}

const populateTitle: CollectionBeforeChangeHook<Run> = async ({ data, req, originalDoc }) => {
	const game = data.game ?? originalDoc?.game;
	const category = data.category ?? originalDoc?.category;
	data.title = await buildRunTitle(req, game, category);
	return data;
};

export const Runs: CollectionConfig<"runs"> = {
	slug: "runs",
	admin: {
		useAsTitle: "title",
		defaultColumns: ["title", "runners", "event", "scheduledTime", "estimate"],
		listSearchableFields: ["title", "category", "platform"],
		group: "Event Management",
	},
	access: {
		create: manageContent,
		delete: manageContent,
		read: anyone,
		update: manageContent,
	},
	hooks: {
		beforeChange: [populateTitle],
	},
	fields: [
		{
			name: "title",
			type: "text",
			index: true,
			admin: {
				readOnly: true,
				description: "Generated from the game and category.",
			},
		},
		{
			name: "game",
			type: "relationship",
			relationTo: "games",
			required: true,
			index: true,
		},
		{
			name: "event",
			type: "relationship",
			relationTo: "events",
			index: true,
		},
		{
			type: "row",
			fields: [
				{
					name: "category",
					type: "text",
					required: true,
				},
				{
					name: "platform",
					type: "text",
					required: true,
				},
				{
					name: "techPlatform",
					type: "text",
				},
			],
		},
		{
			name: "runners",
			type: "relationship",
			relationTo: "users",
			hasMany: true,
			index: true,
		},
		{
			name: "otherRunners",
			type: "text",
			admin: {
				description: "Comma-separated list of other runners who do not have a user account in the system.",
			},
		},
		{
			type: "row",
			fields: [
				{
					name: "estimate",
					type: "text",
					required: true,
					validate: validateEstimate,
					admin: { placeholder: "HH:MM:SS" },
				},
				{
					name: "time",
					type: "text",
					admin: { description: "Final time achieved at the event." },
				},
			],
		},
		{
			name: "scheduledTime",
			type: "date",
			index: true,
			admin: {
				date: {
					pickerAppearance: "dayAndTime",
					timeIntervals: 5,
				},
			},
			timezone: {
				defaultTimezone: "Australia/Melbourne",
				supportedTimezones: [
					{ label: "Melbourne", value: "Australia/Melbourne" },
					{ label: "Sydney", value: "Australia/Sydney" },
					{ label: "Adelaide", value: "Australia/Adelaide" },
					{ label: "Brisbane", value: "Australia/Brisbane" },
					{ label: "Perth", value: "Australia/Perth" },
					{ label: "Hobart", value: "Australia/Hobart" },
					{ label: "Darwin", value: "Australia/Darwin" },
					{ label: "New Zealand", value: "Pacific/Auckland" },
				],
			},
		},
		{
			type: "row",
			fields: [
				{
					name: "isRace",
					type: "checkbox",
				},
				{
					name: "isCoop",
					type: "checkbox",
				},
			],
		},
		{
			name: "specialRequirements",
			type: "textarea",
		},
		{
			type: "row",
			fields: [
				{
					name: "youtube",
					type: "text",
					label: "YouTube VOD",
					validate: validateUrl,
				},
				{
					name: "twitch",
					type: "text",
					label: "Twitch VOD",
					validate: validateUrl,
				},
			],
		},
		{
			name: "submission",
			type: "relationship",
			relationTo: "submissions",
			admin: { position: "sidebar" },
		},
		{
			name: "incentives",
			type: "join",
			collection: "incentives",
			on: "run",
			admin: { defaultColumns: ["title", "type", "isActive"] },
		},
		// TODO: Remove this field after migration is complete
		{
			name: "legacyKeystoneId",
			type: "text",
			unique: true,
			admin: { readOnly: true, position: "sidebar" },
		},
	],
};
