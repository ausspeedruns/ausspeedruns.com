import {
	APIError,
	type CollectionAfterChangeHook,
	type CollectionAfterDeleteHook,
	type CollectionBeforeChangeHook,
	type CollectionBeforeDeleteHook,
	type CollectionConfig,
	type PayloadRequest,
	type Where,
} from "payload";

import type { Run } from "#/payload-types";
import { anyone } from "#access/anyone.ts";
import { relationId } from "#access/helpers.ts";
import { manageContent } from "#access/manageContent.ts";
import { validateEstimate, validateUrl } from "#fields/validators.ts";
import { SKIP_MEDLEY_SYNC, syncMedley } from "#utilities/runs/medley.ts";
import { RUN_TYPES, runTypeLabel } from "#utilities/schedule/constants.ts";

const requiredForRuns = (value: unknown, { siblingData }: { siblingData: Partial<Run> }): true | string => {
	const type = siblingData?.type ?? "run";
	if (type === "run" && (value === null || value === undefined || value === "")) return "This field is required.";
	return true;
};

const requiredForRunsAndMedleys = (value: unknown, { siblingData }: { siblingData: Partial<Run> }): true | string => {
	const type = siblingData?.type ?? "run";
	if ((type === "run" || type === "medley") && (value === null || value === undefined || value === "")) {
		return "This field is required.";
	}
	return true;
};

const requiredForSegments = (value: unknown, { siblingData }: { siblingData: Partial<Run> }): true | string => {
	if (siblingData?.type === "segment" && (value === null || value === undefined)) return "Choose a segment type.";
	return true;
};

export async function buildRunTitle(
	req: PayloadRequest,
	gameValue: Run["game"] | null | undefined,
	category: string | null | undefined,
	type: Run["type"] = "run",
	segmentTypeValue?: Run["segmentType"] | null,
): Promise<string> {
	if (type === "medley") return category || "Medley";

	if (type === "segment") {
		let segmentName: string | undefined;
		if (segmentTypeValue && typeof segmentTypeValue === "object") {
			segmentName = segmentTypeValue.name;
		} else if (typeof segmentTypeValue === "number") {
			const segmentType = await req.payload
				.findByID({ collection: "segment-types", id: segmentTypeValue, depth: 0, overrideAccess: true, req })
				.catch(() => null);
			segmentName = segmentType?.name;
		}
		return [segmentName ?? "Segment", category].filter(Boolean).join(" — ");
	}

	if (type && type !== "run") {
		return [runTypeLabel(type), category].filter(Boolean).join(" — ");
	}

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
	const type = data.type ?? originalDoc?.type ?? "run";
	const segmentType = data.segmentType !== undefined ? data.segmentType : originalDoc?.segmentType;
	data.title = await buildRunTitle(req, game, category, type, segmentType);
	return data;
};

/** Only game runs can be children, only of a medley, and medleys can't be nested. */
const validateParent: CollectionBeforeChangeHook<Run> = async ({ data, req, originalDoc }) => {
	const type = data.type ?? originalDoc?.type ?? "run";
	const parentId = relationId(data.parent !== undefined ? data.parent : originalDoc?.parent);

	if (originalDoc?.type === "medley" && type !== "medley") {
		const children = await req.payload.count({
			collection: "runs",
			where: { parent: { equals: originalDoc.id } },
			overrideAccess: true,
			req,
		});
		if (children.totalDocs > 0) throw new APIError("Remove this medley's games before changing its type.", 400, null, true);
	}

	if (parentId === null) return data;
	if (type !== "run") throw new APIError("Only game runs can be part of a medley.", 400, null, true);
	if (originalDoc && parentId === originalDoc.id) throw new APIError("A run can't be part of itself.", 400, null, true);

	const parent = await req.payload
		.findByID({ collection: "runs", id: parentId, depth: 0, overrideAccess: true, req, joins: false })
		.catch(() => null);
	if (!parent || parent.type !== "medley") throw new APIError("The parent must be a medley.", 400, null, true);

	data.event = relationId(parent.event);
	return data;
};

const syncMedleys: CollectionAfterChangeHook<Run> = async ({ doc, previousDoc, req, context }) => {
	if (context?.[SKIP_MEDLEY_SYNC]) return doc;

	const parents = new Set<number>();
	if (doc.type === "medley") parents.add(doc.id);
	const parentId = relationId(doc.parent);
	if (parentId !== null) parents.add(parentId);
	const previousParentId = relationId(previousDoc?.parent);
	if (previousParentId !== null) parents.add(previousParentId);

	for (const id of parents) await syncMedley(req, id);
	return doc;
};

const deleteMedleyChildren: CollectionBeforeDeleteHook = async ({ id, req, context }) => {
	if (context?.[SKIP_MEDLEY_SYNC]) return;
	await req.payload.delete({
		collection: "runs",
		where: { parent: { equals: id } },
		depth: 0,
		overrideAccess: true,
		req,
	});
};

const resyncParentAfterDelete: CollectionAfterDeleteHook<Run> = async ({ doc, req, context }) => {
	if (context?.[SKIP_MEDLEY_SYNC]) return doc;
	const parentId = relationId(doc.parent);
	if (parentId !== null) await syncMedley(req, parentId);
	return doc;
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
		beforeChange: [validateParent, populateTitle],
		afterChange: [syncMedleys],
		beforeDelete: [deleteMedleyChildren],
		afterDelete: [resyncParentAfterDelete],
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
			name: "type",
			type: "select",
			options: [...RUN_TYPES],
			defaultValue: "run",
			index: true,
			admin: {
				description:
					"Medleys are a single schedule slot containing several game runs. Segments are speeches, news, ceremonies etc. Setup buffers and sleep are shown as blocks on the schedule.",
			},
		},
		{
			name: "segmentType",
			type: "relationship",
			relationTo: "segment-types",
			index: true,
			validate: requiredForSegments,
			admin: {
				condition: (_, siblingData) => siblingData?.type === "segment",
			},
		},
		{
			name: "game",
			type: "relationship",
			relationTo: "games",
			index: true,
			validate: requiredForRuns,
			admin: {
				condition: (_, siblingData) => (siblingData?.type ?? "run") === "run",
			},
		},
		{
			type: "row",
			admin: {
				condition: (_, siblingData) => (siblingData?.type ?? "run") === "run",
			},
			fields: [
				{
					name: "parent",
					type: "relationship",
					relationTo: "runs",
					index: true,
					label: "Part of medley",
					filterOptions: ({ siblingData, id }) => {
						const event = relationId((siblingData as Partial<Run>)?.event);
						const and: Where[] = [{ type: { equals: "medley" } }];
						if (id) and.push({ id: { not_equals: id } });
						if (event !== null) and.push({ event: { equals: event } });
						return { and };
					},
					admin: {
						description: "Set to make this game part of a medley. Its event and scheduled time are taken from the medley.",
					},
				},
				{
					name: "order",
					type: "number",
					admin: {
						description: "Position within the medley (lowest first).",
						condition: (_, siblingData) => Boolean(siblingData?.parent),
					},
				},
			],
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
					validate: requiredForRunsAndMedleys,
					admin: {
						description:
							"For medleys this is the medley name (e.g. '5 Minute Games Showcase'). For other entries it is the label (e.g. 'Overnight break').",
					},
				},
				{
					name: "platform",
					type: "text",
					validate: requiredForRuns,
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
			admin: {
				description:
					"Presenters for segments. For medleys with games this is kept in sync with the games' runners automatically.",
			},
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
			name: "submissions",
			type: "relationship",
			relationTo: "submissions",
			hasMany: true,
			index: true,
			admin: {
				position: "sidebar",
				description: "Submission(s) this run was scheduled from. Races/co-ops link every runner's submission.",
			},
		},
		{
			name: "incentives",
			type: "join",
			collection: "incentives",
			on: "run",
			admin: { defaultColumns: ["title", "type", "isActive"] },
		},
		{
			name: "children",
			type: "join",
			collection: "runs",
			on: "parent",
			label: "Medley games",
			defaultSort: "order",
			admin: {
				defaultColumns: ["title", "order", "runners", "estimate"],
				condition: (_, siblingData) => siblingData?.type === "medley",
			},
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
