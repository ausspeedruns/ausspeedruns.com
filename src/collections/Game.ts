import type { CollectionAfterChangeHook, CollectionConfig } from "payload";

import type { Game } from "#/payload-types";
import { anyone } from "#access/anyone.ts";
import { manageContent } from "#access/manageContent.ts";
import { buildRunTitle } from "#collections/Runs.ts";

/** Keep denormalised run titles in sync when a game is renamed. */
const syncRunTitles: CollectionAfterChangeHook<Game> = async ({ doc, previousDoc, operation, req }) => {
	if (operation !== "update" || previousDoc?.name === doc.name) return doc;

	const runs = await req.payload.find({
		collection: "runs",
		where: { game: { equals: doc.id } },
		depth: 0,
		pagination: false,
		overrideAccess: true,
		select: { category: true },
		req,
	});

	for (const run of runs.docs) {
		await req.payload.update({
			collection: "runs",
			id: run.id,
			data: { title: await buildRunTitle(req, doc, run.category) },
			depth: 0,
			overrideAccess: true,
			req,
		});
	}

	return doc;
};

export const Games: CollectionConfig<"games"> = {
	slug: "games",
	admin: {
		useAsTitle: "name",
		defaultColumns: ["name", "year", "platform"],
		group: "Event Management",
	},
	defaultPopulate: {
		name: true,
		year: true,
		platform: true,
		stream: true,
	},
	access: {
		create: manageContent,
		delete: manageContent,
		read: anyone,
		update: manageContent,
	},
	hooks: {
		afterChange: [syncRunTitles],
	},
	fields: [
		{
			name: "name",
			type: "text",
			required: true,
			unique: true,
			index: true,
		},
		{
			name: "year",
			type: "number",
			min: 1950,
			max: 2100,
			admin: { description: "Release year." },
		},
		{
			name: "platform",
			type: "text",
			hasMany: true,
		},
		{
			name: "techPlatform",
			type: "text",
			hasMany: true,
		},
		{
			name: "stream",
			type: "group",
			fields: [
				{
					name: "displayName",
					type: "textarea",
					admin: { description: "Name shown on stream layouts, if different (supports line breaks)." },
				},
				{
					name: "aspectRatio",
					type: "text",
					admin: { placeholder: "16:9" },
				},
			],
		},
		{
			name: "runs",
			type: "join",
			collection: "runs",
			on: "game",
			admin: { defaultColumns: ["title", "event", "runners"] },
		},
	],
};
