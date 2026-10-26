import {
	commitTransaction,
	initTransaction,
	killTransaction,
	type CollectionConfig,
	type Endpoint,
	type PayloadRequest,
} from "payload";
import { z } from "zod";

import { isContentManager } from "#access/helpers.ts";
import { manageContent } from "#access/manageContent.ts";
import { RUN_TYPES } from "#utilities/schedule/constants.ts";
import {
	applyDraft,
	exportHoraro,
	exportSubmissionsCsv,
	finaliseSubmissions,
	importCsv,
	loadDraftResponse,
	rebuildDraftFromRuns,
	resetSchedule,
	saveDraft,
	ScheduleError,
	searchUsers,
} from "#utilities/schedule/server.ts";

const runTypeValues = RUN_TYPES.map((type) => type.value) as [string, ...string[]];

const draftRowSchema = z.object({
	key: z.string().min(1),
	type: z.enum(runTypeValues),
	submissionIds: z.array(z.number().int()),
	gameName: z.string(),
	category: z.string(),
	platform: z.string(),
	techPlatform: z.string(),
	estimate: z.string(),
	setupMinutesOverride: z.number().min(0).max(24 * 60).nullable(),
	runnerIds: z.array(z.string()),
	otherRunners: z.string(),
	isRace: z.boolean(),
	isCoop: z.boolean(),
	specialRequirements: z.string(),
	pairingConfirmed: z.boolean(),
	racerHint: z.string(),
	youtube: z.string().optional(),
	twitch: z.string().optional(),
	time: z.string().optional(),
	parentKey: z.string().nullable().optional(),
	segmentTypeId: z.number().int().nullable().optional(),
});

const draftIncentiveSchema = z.object({
	key: z.string().min(1),
	rowKey: z.string().min(1),
	sourceSubmissionId: z.number().int().nullable(),
	status: z.enum(["pending", "configured", "skipped"]),
	title: z.string(),
	description: z.string(),
	notes: z.string(),
	type: z.enum(["goal", "war"]),
	data: z.union([
		z.object({ goal: z.number(), current: z.number() }),
		z.object({ options: z.array(z.object({ name: z.string(), total: z.number() })) }),
	]),
});

const draftBlockSchema = z.object({
	key: z.string().min(1),
	name: z.string().max(1000),
	colour: z.string().max(100),
	textColour: z.string().max(100),
	startRowKey: z.string().nullable(),
	endRowKey: z.string().nullable(),
});

const saveSchema = z.object({
	expectedUpdatedAt: z.string().nullable().optional(),
	defaultSetupMinutes: z.number().min(0).max(240),
	rows: z.array(draftRowSchema),
	incentives: z.array(draftIncentiveSchema),
	blocks: z.array(draftBlockSchema).max(500).optional(),
});

const importSchema = z.object({
	csvRows: z.array(z.record(z.string(), z.string().optional())).max(5000),
	defaultSetupMinutes: z.number().min(0).max(240).optional(),
});

const applySchema = z.object({ replaceUntracked: z.boolean().optional() });
const resetSchema = z.object({ resetSubmissions: z.boolean().optional() });
const finaliseSchema = z.object({
	backupRule: z.enum(["all", "acceptedRunnersOnly", "none"]),
	skipReviewed: z.boolean(),
	dryRun: z.boolean().optional(),
});

async function readBody<T>(req: PayloadRequest, schema: z.ZodType<T>): Promise<T> {
	let body: unknown = {};
	try {
		body = req.json ? await req.json() : {};
	} catch {
		throw new ScheduleError("Invalid JSON body.");
	}
	const parsed = schema.safeParse(body ?? {});
	if (!parsed.success) throw new ScheduleError("Invalid request.", 400, z.treeifyError(parsed.error));
	return parsed.data;
}

function eventIdParam(req: PayloadRequest): number {
	const id = Number(req.routeParams?.eventId);
	if (!Number.isInteger(id) || id <= 0) throw new ScheduleError("Invalid event ID.");
	return id;
}

/** Wraps an endpoint with the content-manager check, optional transaction and error handling. */
function handler(
	fn: (req: PayloadRequest, eventId: number) => Promise<Response>,
	{ transaction = false } = {},
): Endpoint["handler"] {
	return async (req) => {
		if (!req.user || !(await isContentManager(req))) {
			return Response.json({ error: "You need content management access to use the schedule importer." }, { status: 403 });
		}

		const shouldCommit = transaction ? await initTransaction(req) : false;
		try {
			const response = await fn(req, eventIdParam(req));
			if (shouldCommit) await commitTransaction(req);
			return response;
		} catch (error) {
			if (transaction) await killTransaction(req);
			if (error instanceof ScheduleError) {
				return Response.json({ error: error.message, details: error.details }, { status: error.status });
			}
			req.payload.logger.error({ err: error, msg: "Schedule importer request failed" });
			return Response.json({ error: "Something went wrong. Check the server logs." }, { status: 500 });
		}
	};
}

const endpoints: Endpoint[] = [
	{
		path: "/event/:eventId",
		method: "get",
		handler: handler(async (req, eventId) => Response.json(await loadDraftResponse(req, eventId))),
	},
	{
		path: "/event/:eventId",
		method: "patch",
		handler: handler(async (req, eventId) => {
			const { expectedUpdatedAt, ...state } = await readBody(req, saveSchema);
			return Response.json(await saveDraft(req, eventId, state as never, expectedUpdatedAt));
		}),
	},
	{
		path: "/event/:eventId/users",
		method: "get",
		handler: handler(async (req) => Response.json(await searchUsers(req, String(req.searchParams.get("q") ?? "")))),
	},
	{
		path: "/event/:eventId/submissions.csv",
		method: "get",
		handler: handler(async (req, eventId) => {
			const { csv, filename } = await exportSubmissionsCsv(req, eventId);
			return new Response(csv, {
				headers: {
					"Content-Type": "text/csv; charset=utf-8",
					"Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
				},
			});
		}),
	},
	{
		path: "/event/:eventId/import",
		method: "post",
		handler: handler(
			async (req, eventId) => {
				const { csvRows, defaultSetupMinutes } = await readBody(req, importSchema);
				return Response.json(await importCsv(req, eventId, csvRows, defaultSetupMinutes));
			},
			{ transaction: true },
		),
	},
	{
		path: "/event/:eventId/apply",
		method: "post",
		handler: handler(
			async (req, eventId) => Response.json(await applyDraft(req, eventId, await readBody(req, applySchema))),
			{ transaction: true },
		),
	},
	{
		path: "/event/:eventId/reset",
		method: "post",
		handler: handler(
			async (req, eventId) => Response.json(await resetSchedule(req, eventId, await readBody(req, resetSchema))),
			{ transaction: true },
		),
	},
	{
		path: "/event/:eventId/rebuild",
		method: "post",
		handler: handler(async (req, eventId) => Response.json(await rebuildDraftFromRuns(req, eventId)), {
			transaction: true,
		}),
	},
	{
		path: "/event/:eventId/finalise",
		method: "post",
		handler: handler(
			async (req, eventId) =>
				Response.json(await finaliseSubmissions(req, eventId, await readBody(req, finaliseSchema))),
			{ transaction: true },
		),
	},
	{
		path: "/event/:eventId/horaro.json",
		method: "get",
		handler: handler(async (req, eventId) => {
			const schedule = await exportHoraro(req, eventId);
			return new Response(JSON.stringify(schedule, null, "\t"), {
				headers: {
					"Content-Type": "application/json; charset=utf-8",
					"Content-Disposition": `attachment; filename="${schedule.schedule.event.slug.replace(/"/g, "")}-horaro.json"`,
				},
			});
		}),
	},
];

/** Work-in-progress schedules for the Schedule Import admin view (one per event). */
export const ScheduleDrafts: CollectionConfig<"schedule-drafts"> = {
	slug: "schedule-drafts",
	admin: {
		hidden: true,
		useAsTitle: "id",
		group: "Event Management",
	},
	access: {
		create: manageContent,
		delete: manageContent,
		read: manageContent,
		update: manageContent,
	},
	endpoints,
	fields: [
		{
			name: "event",
			type: "relationship",
			relationTo: "events",
			required: true,
			unique: true,
			index: true,
		},
		{
			name: "defaultSetupMinutes",
			type: "number",
			min: 0,
			defaultValue: 10,
		},
		{
			name: "status",
			type: "select",
			options: [
				{ label: "Draft", value: "draft" },
				{ label: "Applied", value: "applied" },
			],
			defaultValue: "draft",
			required: true,
		},
		{ name: "rows", type: "json" },
		{ name: "incentives", type: "json" },
		{ name: "blocks", type: "json" },
		{
			name: "appliedMap",
			type: "json",
			admin: { description: "Maps draft rows/incentives to the runs/incentives created from them." },
		},
		{ name: "lastImportReport", type: "json" },
		{ name: "appliedAt", type: "date" },
		{ name: "appliedBy", type: "relationship", relationTo: "users" },
		{ name: "finalisedAt", type: "date" },
	],
};
