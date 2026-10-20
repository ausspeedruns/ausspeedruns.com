import type { PayloadRequest, Where } from "payload";
import { nanoid } from "nanoid";

import type { Event, Incentive, Run, ScheduleDraft, Submission, User } from "#/payload-types";
import type { Goal, War } from "./incentives.ts";
import { relationId } from "#access/helpers.ts";
import { DEFAULT_SETUP_MINUTES, type RunType } from "./constants.ts";
import { csvRowsToDraft, normaliseName, submissionsToCsv, type CsvRow, type ImportReport } from "./csv.ts";
import { planSubmissionStatuses, type FinalisePlan } from "./finalise.ts";
import { buildHoraroSchedule, type HoraroSchedule } from "./horaro.ts";
import { computeSchedule, estimateToMs, msToEstimate, normaliseEstimate, scheduleEnd } from "./timing.ts";
import type {
	ApplyResult,
	AppliedMap,
	DraftIncentive,
	DraftResponse,
	DraftRow,
	DraftState,
	EventSummary,
	FinaliseOptions,
	SubmissionSummary,
} from "./types.ts";
import { validateDraft, type ScheduleIssue } from "./validation.ts";

/** Thrown by schedule operations; converted to an HTTP response by the endpoints. */
export class ScheduleError extends Error {
	status: number;
	details?: unknown;

	constructor(message: string, status = 400, details?: unknown) {
		super(message);
		this.status = status;
		this.details = details;
	}
}

const RUN_TIMEZONES = [
	"Australia/Melbourne",
	"Australia/Sydney",
	"Australia/Adelaide",
	"Australia/Brisbane",
	"Australia/Perth",
	"Australia/Hobart",
	"Australia/Darwin",
	"Pacific/Auckland",
] as const;

type RunTimezone = (typeof RUN_TIMEZONES)[number];

function runTimezone(tz: string): RunTimezone {
	return (RUN_TIMEZONES as readonly string[]).includes(tz) ? (tz as RunTimezone) : "Australia/Melbourne";
}

const emptyMap = (): AppliedMap => ({ runs: {}, incentives: {} });

function asAppliedMap(value: unknown): AppliedMap {
	if (!value || typeof value !== "object") return emptyMap();
	const map = value as Partial<AppliedMap>;
	return { runs: { ...map.runs }, incentives: { ...map.incentives } };
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

export async function loadEvent(req: PayloadRequest, eventId: number): Promise<Event> {
	const event = await req.payload
		.findByID({ collection: "events", id: eventId, depth: 0, draft: true, overrideAccess: true, req })
		.catch(() => null);
	if (!event) throw new ScheduleError("Event not found.", 404);
	return event;
}

export function toEventSummary(event: Event): EventSummary {
	return {
		id: event.id,
		name: event.name,
		shortName: event.shortName,
		startTime: event.timeSettings?.startTime ?? null,
		endTime: event.timeSettings?.endTime ?? null,
		timezone: event.timeSettings?.timezone ?? "Australia/Melbourne",
	};
}

function parseAvailability(value: unknown): boolean[] {
	let parsed = value;
	if (typeof parsed === "string") {
		try {
			parsed = JSON.parse(parsed);
		} catch {
			return [];
		}
	}
	if (!Array.isArray(parsed)) return [];
	return parsed.map((day) => day === true || day === "true" || day === "TRUE");
}

function parseSubmissionIncentives(value: unknown): SubmissionSummary["donationIncentives"] {
	if (!Array.isArray(value)) return [];
	return value
		.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
		.map((item) => ({
			title: String(item.title ?? ""),
			...(item.description ? { description: String(item.description) } : {}),
			...(item.time ? { time: String(item.time) } : {}),
		}))
		.filter((item) => item.title);
}

export function toSubmissionSummary(submission: Submission): SubmissionSummary {
	const runner = typeof submission.runner === "object" ? submission.runner : null;
	return {
		id: submission.id,
		runnerId: relationId(submission.runner),
		runnerUsername: runner?.username ?? "Unknown runner",
		game: submission.game,
		category: submission.category,
		platform: submission.platform,
		techPlatform: submission.techPlatform ?? "",
		estimate: normaliseEstimate(submission.estimate),
		raceType: submission.raceType ?? "noRace",
		racer: submission.racer ?? "",
		isCoop: Boolean(submission.isCoop),
		canBackup: Boolean(submission.canBackup),
		status: submission.status,
		specialRequirements: submission.specialRequirements ?? "",
		availability: parseAvailability(submission.availability),
		donationIncentives: parseSubmissionIncentives(submission.donationIncentives),
	};
}

export async function loadSubmissions(req: PayloadRequest, eventId: number): Promise<SubmissionSummary[]> {
	const result = await req.payload.find({
		collection: "submissions",
		where: { event: { equals: eventId } },
		depth: 1,
		pagination: false,
		sort: "createdAt",
		overrideAccess: true,
		populate: { users: { username: true } },
		req,
	});
	return result.docs.map(toSubmissionSummary);
}

async function findDraft(req: PayloadRequest, eventId: number): Promise<ScheduleDraft | null> {
	const result = await req.payload.find({
		collection: "schedule-drafts",
		where: { event: { equals: eventId } },
		limit: 1,
		depth: 0,
		overrideAccess: true,
		req,
	});
	return result.docs[0] ?? null;
}

function draftState(draft: ScheduleDraft | null): DraftState {
	return {
		defaultSetupMinutes: draft?.defaultSetupMinutes ?? DEFAULT_SETUP_MINUTES,
		rows: (Array.isArray(draft?.rows) ? draft.rows : []) as unknown as DraftRow[],
		incentives: (Array.isArray(draft?.incentives) ? draft.incentives : []) as unknown as DraftIncentive[],
	};
}

async function findUsers(req: PayloadRequest, where: Where, limit = 0): Promise<{ id: string; username: string }[]> {
	const result = await req.payload.find({
		collection: "users",
		where,
		depth: 0,
		limit,
		pagination: limit > 0,
		overrideAccess: true,
		select: { username: true },
		req,
	});
	return result.docs.map((user) => ({ id: user.id, username: user.username }));
}

export async function searchUsers(req: PayloadRequest, query: string) {
	if (query.trim().length < 2) return [];
	return findUsers(req, { username: { like: query.trim() } }, 20);
}

async function loadGames(req: PayloadRequest): Promise<{ id: number; name: string }[]> {
	const result = await req.payload.find({
		collection: "games",
		depth: 0,
		pagination: false,
		overrideAccess: true,
		select: { name: true },
		req,
	});
	return result.docs.map((game) => ({ id: game.id, name: game.name }));
}

export async function loadDraftResponse(req: PayloadRequest, eventId: number): Promise<DraftResponse> {
	const event = await loadEvent(req, eventId);
	const [submissions, draft, games] = await Promise.all([
		loadSubmissions(req, eventId),
		findDraft(req, eventId),
		loadGames(req),
	]);
	const state = draftState(draft);
	const map = asAppliedMap(draft?.appliedMap);

	// Users referenced by the draft or submissions, so the client can show names
	const userIds = new Set<string>();
	for (const submission of submissions) if (submission.runnerId) userIds.add(submission.runnerId);
	for (const row of state.rows) for (const id of row.runnerIds) userIds.add(id);
	const users = userIds.size > 0 ? await findUsers(req, { id: { in: [...userIds] } }) : [];

	let liveRunsChanged = false;
	if (draft?.status === "applied" && draft.appliedAt) {
		const changed = await req.payload.count({
			collection: "runs",
			where: { and: [{ event: { equals: eventId } }, { updatedAt: { greater_than: draft.appliedAt } }] },
			overrideAccess: true,
			req,
		});
		liveRunsChanged = changed.totalDocs > 0;
	}

	return {
		event: toEventSummary(event),
		draft: {
			id: draft?.id ?? null,
			status: draft?.status ?? "draft",
			appliedAt: draft?.appliedAt ?? null,
			finalisedAt: draft?.finalisedAt ?? null,
			updatedAt: draft?.updatedAt ?? null,
			liveRunsChanged,
			appliedRunCount: Object.keys(map.runs).length,
			...state,
		},
		submissions,
		users,
		games,
	};
}

// ---------------------------------------------------------------------------
// Saving / importing
// ---------------------------------------------------------------------------

async function upsertDraft(
	req: PayloadRequest,
	eventId: number,
	data: Partial<Omit<ScheduleDraft, "id" | "event" | "updatedAt" | "createdAt">>,
	expectedUpdatedAt?: string | null,
): Promise<ScheduleDraft> {
	const existing = await findDraft(req, eventId);

	if (existing) {
		if (expectedUpdatedAt !== undefined && expectedUpdatedAt !== existing.updatedAt) {
			throw new ScheduleError(
				"Someone else has changed this schedule since you loaded it. Reload to get the latest version.",
				409,
			);
		}
		return req.payload.update({
			collection: "schedule-drafts",
			id: existing.id,
			data,
			depth: 0,
			overrideAccess: true,
			req,
		});
	}

	return req.payload.create({
		collection: "schedule-drafts",
		data: { event: eventId, status: "draft", ...data },
		depth: 0,
		overrideAccess: true,
		req,
	});
}

export async function saveDraft(
	req: PayloadRequest,
	eventId: number,
	state: DraftState,
	expectedUpdatedAt: string | null | undefined,
): Promise<{ updatedAt: string }> {
	await loadEvent(req, eventId);
	const saved = await upsertDraft(
		req,
		eventId,
		{
			defaultSetupMinutes: state.defaultSetupMinutes,
			rows: state.rows as unknown as ScheduleDraft["rows"],
			incentives: state.incentives as unknown as ScheduleDraft["incentives"],
		},
		expectedUpdatedAt,
	);
	return { updatedAt: saved.updatedAt };
}

export async function importCsv(
	req: PayloadRequest,
	eventId: number,
	csvRows: CsvRow[],
	defaultSetupMinutes: number | undefined,
): Promise<ImportReport> {
	await loadEvent(req, eventId);
	const [submissions, games, existing] = await Promise.all([
		loadSubmissions(req, eventId),
		loadGames(req),
		findDraft(req, eventId),
	]);

	// Only look up the users the CSV actually mentions
	const usernames = csvRows.map((row) => row.runner?.trim()).filter((name): name is string => Boolean(name));
	const ids = csvRows.map((row) => row.runnerId?.trim()).filter((id): id is string => Boolean(id));
	const or: Where[] = [];
	if (usernames.length > 0) or.push({ username: { in: usernames } });
	if (ids.length > 0) or.push({ id: { in: ids } });
	const users = or.length > 0 ? await findUsers(req, { or }) : [];

	const { report, ...state } = csvRowsToDraft(csvRows, {
		submissions,
		users,
		games,
		defaultSetupMinutes: defaultSetupMinutes ?? existing?.defaultSetupMinutes ?? DEFAULT_SETUP_MINUTES,
	});

	await upsertDraft(req, eventId, {
		defaultSetupMinutes: state.defaultSetupMinutes,
		rows: state.rows as unknown as ScheduleDraft["rows"],
		incentives: state.incentives as unknown as ScheduleDraft["incentives"],
		lastImportReport: report as unknown as ScheduleDraft["lastImportReport"],
	});

	return report;
}

export async function exportSubmissionsCsv(req: PayloadRequest, eventId: number) {
	const event = await loadEvent(req, eventId);
	const submissions = await loadSubmissions(req, eventId);
	return { filename: `${event.shortName}-submissions.csv`, csv: submissionsToCsv(toEventSummary(event), submissions) };
}

// ---------------------------------------------------------------------------
// Applying
// ---------------------------------------------------------------------------

/** Keeps donation totals when an incentive is re-applied with the same type. */
export function mergeIncentiveData(
	type: DraftIncentive["type"],
	data: Goal | War,
	existing: Pick<Incentive, "type" | "data"> | null | undefined,
): Goal | War {
	if (!existing || existing.type !== type || !existing.data || typeof existing.data !== "object") return data;

	if (type === "goal") {
		const previous = existing.data as Partial<Goal>;
		return { ...(data as Goal), current: typeof previous.current === "number" ? previous.current : 0 };
	}

	const previous = (existing.data as Partial<War>).options ?? [];
	return {
		options: (data as War).options.map((option) => ({
			...option,
			total:
				previous.find((candidate) => normaliseName(candidate.name) === normaliseName(option.name))?.total ??
				option.total ??
				0,
		})),
	};
}

export async function applyDraft(
	req: PayloadRequest,
	eventId: number,
	options: { replaceUntracked?: boolean } = {},
): Promise<ApplyResult> {
	const event = await loadEvent(req, eventId);
	const eventSummary = toEventSummary(event);
	const draft = await findDraft(req, eventId);
	if (!draft) throw new ScheduleError("There is no schedule draft for this event yet.");

	const state = draftState(draft);
	const submissions = await loadSubmissions(req, eventId);
	const issues = validateDraft(state, eventSummary, submissions).filter((issue) => issue.level === "error");
	if (issues.length > 0) throw new ScheduleError("The schedule has errors that must be fixed first.", 400, issues);

	const map = asAppliedMap(draft.appliedMap);
	const trackedRunIds = new Set(Object.values(map.runs));

	// Runs on the event that this tool didn't create (manual entry or migrated data)
	const untracked = (
		await req.payload.find({
			collection: "runs",
			where: { event: { equals: eventId } },
			depth: 0,
			pagination: false,
			overrideAccess: true,
			select: { title: true },
			req,
		})
	).docs.filter((run) => !trackedRunIds.has(run.id));

	if (untracked.length > 0 && !options.replaceUntracked) {
		throw new ScheduleError(
			`This event already has ${untracked.length} run(s) that were not created by the schedule importer.`,
			409,
			{ untrackedRuns: untracked.length },
		);
	}

	// Resolve or create games
	const games = await loadGames(req);
	const gameIds = new Map(games.map((game) => [normaliseName(game.name), game.id]));
	const gamesCreated: string[] = [];
	for (const row of state.rows) {
		if (row.type !== "run" || gameIds.has(normaliseName(row.gameName))) continue;
		const created = await req.payload.create({
			collection: "games",
			data: { name: row.gameName.trim() },
			depth: 0,
			overrideAccess: true,
			req,
		});
		gameIds.set(normaliseName(row.gameName), created.id);
		gamesCreated.push(created.name);
	}

	const timed = computeSchedule(state.rows, eventSummary.startTime as string, state.defaultSetupMinutes);
	const tz = runTimezone(eventSummary.timezone);
	const newMap = emptyMap();
	const result: ApplyResult = {
		created: 0,
		updated: 0,
		deleted: 0,
		incentives: { created: 0, updated: 0, deleted: 0 },
		gamesCreated,
		endTime: null,
	};

	for (const { row, start } of timed) {
		const isRun = row.type === "run";
		const data = {
			type: row.type,
			event: eventId,
			game: isRun ? (gameIds.get(normaliseName(row.gameName)) ?? null) : null,
			category: row.category,
			platform: isRun ? row.platform : row.platform || null,
			techPlatform: row.techPlatform || null,
			runners: row.runnerIds,
			otherRunners: row.otherRunners || null,
			estimate: normaliseEstimate(row.estimate),
			scheduledTime: start.toISOString(),
			scheduledTime_tz: tz,
			isRace: isRun && row.isRace,
			isCoop: isRun && row.isRace && row.isCoop,
			specialRequirements: row.specialRequirements || null,
			submissions: isRun ? row.submissionIds : [],
			...(row.youtube !== undefined ? { youtube: row.youtube || null } : {}),
			...(row.twitch !== undefined ? { twitch: row.twitch || null } : {}),
			...(row.time !== undefined ? { time: row.time || null } : {}),
		} as Omit<Run, "id" | "updatedAt" | "createdAt" | "incentives">;

		const existingId = map.runs[row.key];
		const existing =
			existingId !== undefined
				? await req.payload
						.findByID({ collection: "runs", id: existingId, depth: 0, overrideAccess: true, req })
						.catch(() => null)
				: null;

		if (existing) {
			await req.payload.update({ collection: "runs", id: existing.id, data, depth: 0, overrideAccess: true, req });
			newMap.runs[row.key] = existing.id;
			result.updated++;
		} else {
			const created = await req.payload.create({ collection: "runs", data, depth: 0, overrideAccess: true, req });
			newMap.runs[row.key] = created.id;
			result.created++;
		}
	}

	// Incentives
	const keptIncentiveKeys = new Set<string>();
	for (const incentive of state.incentives) {
		const runId = newMap.runs[incentive.rowKey];
		if (incentive.status !== "configured" || runId === undefined) continue;
		keptIncentiveKeys.add(incentive.key);

		const existingId = map.incentives[incentive.key];
		const existing =
			existingId !== undefined
				? await req.payload
						.findByID({ collection: "incentives", id: existingId, depth: 0, overrideAccess: true, req })
						.catch(() => null)
				: null;

		const data = {
			title: incentive.title.trim(),
			description: incentive.description || null,
			notes: incentive.notes || null,
			type: incentive.type,
			run: runId,
			event: eventId,
			data: mergeIncentiveData(incentive.type, incentive.data, existing) as unknown as Incentive["data"],
		};

		if (existing) {
			await req.payload.update({ collection: "incentives", id: existing.id, data, depth: 0, overrideAccess: true, req });
			newMap.incentives[incentive.key] = existing.id;
			result.incentives.updated++;
		} else {
			const created = await req.payload.create({
				collection: "incentives",
				data: { ...data, isActive: true },
				depth: 0,
				overrideAccess: true,
				req,
			});
			newMap.incentives[incentive.key] = created.id;
			result.incentives.created++;
		}
	}

	// Remove incentives and runs that are no longer in the draft
	const staleIncentives = Object.entries(map.incentives)
		.filter(([key]) => !keptIncentiveKeys.has(key))
		.map(([, id]) => id);
	result.incentives.deleted += await deleteByIds(req, "incentives", staleIncentives);

	const keptRunIds = new Set(Object.values(newMap.runs));
	const staleRunIds = [
		...Object.values(map.runs).filter((id) => !keptRunIds.has(id)),
		...untracked.map((run) => run.id),
	];
	if (staleRunIds.length > 0) {
		// Incentives attached to removed runs would otherwise be orphaned
		const orphaned = await req.payload.find({
			collection: "incentives",
			where: { run: { in: staleRunIds } },
			depth: 0,
			pagination: false,
			overrideAccess: true,
			select: { title: true },
			req,
		});
		result.incentives.deleted += await deleteByIds(
			req,
			"incentives",
			orphaned.docs.map((doc) => doc.id),
		);
	}
	result.deleted = await deleteByIds(req, "runs", staleRunIds);

	// Event end time
	const end = scheduleEnd(timed);
	if (end) {
		const published = await req.payload.findByID({
			collection: "events",
			id: eventId,
			depth: 0,
			overrideAccess: true,
			req,
		});
		await req.payload.update({
			collection: "events",
			id: eventId,
			data: { timeSettings: { ...published.timeSettings, timezone: eventSummary.timezone as never, endTime: end.toISOString() } },
			depth: 0,
			overrideAccess: true,
			req,
		});
		result.endTime = end.toISOString();
	}

	await req.payload.update({
		collection: "schedule-drafts",
		id: draft.id,
		data: {
			status: "applied",
			appliedAt: new Date().toISOString(),
			appliedBy: req.user?.id ?? null,
			appliedMap: newMap as unknown as ScheduleDraft["appliedMap"],
		},
		depth: 0,
		overrideAccess: true,
		req,
	});

	return result;
}

async function deleteByIds(req: PayloadRequest, collection: "runs" | "incentives", ids: number[]): Promise<number> {
	if (ids.length === 0) return 0;
	const result = await req.payload.delete({
		collection,
		where: { id: { in: ids } },
		depth: 0,
		overrideAccess: true,
		req,
	});
	return result.docs.length;
}

// ---------------------------------------------------------------------------
// Reset / rebuild
// ---------------------------------------------------------------------------

export async function resetSchedule(
	req: PayloadRequest,
	eventId: number,
	options: { resetSubmissions?: boolean } = {},
): Promise<{ runs: number; incentives: number; submissions: number }> {
	await loadEvent(req, eventId);
	const draft = await findDraft(req, eventId);
	const map = asAppliedMap(draft?.appliedMap);
	const runIds = Object.values(map.runs);

	const attached =
		runIds.length > 0
			? (
					await req.payload.find({
						collection: "incentives",
						where: { run: { in: runIds } },
						depth: 0,
						pagination: false,
						overrideAccess: true,
						select: { title: true },
						req,
					})
				).docs.map((doc) => doc.id)
			: [];
	const incentiveIds = [...new Set([...Object.values(map.incentives), ...attached])];

	const incentives = await deleteByIds(req, "incentives", incentiveIds);
	const runs = await deleteByIds(req, "runs", runIds);

	let submissions = 0;
	if (options.resetSubmissions) {
		const updated = await req.payload.update({
			collection: "submissions",
			where: { and: [{ event: { equals: eventId } }, { status: { not_equals: "pending" } }] },
			data: { status: "pending" },
			depth: 0,
			overrideAccess: true,
			req,
		});
		submissions = updated.docs.length;
	}

	if (draft) {
		await req.payload.update({
			collection: "schedule-drafts",
			id: draft.id,
			data: {
				status: "draft",
				appliedAt: null,
				appliedBy: null,
				appliedMap: emptyMap() as unknown as ScheduleDraft["appliedMap"],
				...(options.resetSubmissions ? { finalisedAt: null } : {}),
			},
			depth: 0,
			overrideAccess: true,
			req,
		});
	}

	return { runs, incentives, submissions };
}

/** Rebuilds the draft from the event's live runs (e.g. after runs were edited directly, or for migrated events). */
export async function rebuildDraftFromRuns(req: PayloadRequest, eventId: number): Promise<{ rows: number }> {
	const event = await loadEvent(req, eventId);
	const existing = await findDraft(req, eventId);
	const defaultSetupMinutes = existing?.defaultSetupMinutes ?? DEFAULT_SETUP_MINUTES;

	const runs = (
		await req.payload.find({
			collection: "runs",
			where: { event: { equals: eventId } },
			sort: "scheduledTime",
			depth: 1,
			pagination: false,
			overrideAccess: true,
			populate: { games: { name: true }, users: { username: true } },
			req,
		})
	).docs.filter((run) => run.scheduledTime);

	if (runs.length === 0) throw new ScheduleError("This event has no scheduled runs to rebuild from.");

	const incentives = (
		await req.payload.find({
			collection: "incentives",
			where: { run: { in: runs.map((run) => run.id) } },
			depth: 0,
			pagination: false,
			overrideAccess: true,
			req,
		})
	).docs;

	const map = emptyMap();
	const rows: DraftRow[] = runs.map((run, i) => {
		const key = nanoid();
		map.runs[key] = run.id;

		const next = runs[i + 1];
		const end = new Date(run.scheduledTime as string).getTime() + (estimateToMs(run.estimate) ?? 0);
		const gapMinutes = next ? Math.round((new Date(next.scheduledTime as string).getTime() - end) / 60000) : null;
		const type = (run.type ?? "run") as RunType;
		const naturalSetup = type === "run" ? defaultSetupMinutes : 0;

		return {
			key,
			type,
			submissionIds: (run.submissions ?? []).map((submission) => relationId(submission) as number),
			gameName: typeof run.game === "object" && run.game ? run.game.name : "",
			category: run.category ?? "",
			platform: run.platform ?? "",
			techPlatform: run.techPlatform ?? "",
			estimate: normaliseEstimate(run.estimate),
			setupMinutesOverride: gapMinutes !== null && gapMinutes !== naturalSetup ? Math.max(0, gapMinutes) : null,
			runnerIds: (run.runners ?? []).map((runner) => relationId(runner) as string),
			otherRunners: run.otherRunners ?? "",
			isRace: Boolean(run.isRace),
			isCoop: Boolean(run.isCoop),
			specialRequirements: run.specialRequirements ?? "",
			pairingConfirmed: true,
			racerHint: "",
			youtube: run.youtube ?? "",
			twitch: run.twitch ?? "",
			time: run.time ?? "",
		};
	});

	const runKeyById = new Map(Object.entries(map.runs).map(([key, id]) => [id, key]));
	const draftIncentives: DraftIncentive[] = incentives.flatMap((incentive) => {
		const rowKey = runKeyById.get(relationId(incentive.run) as number);
		if (!rowKey) return [];
		const key = nanoid();
		map.incentives[key] = incentive.id;
		return [
			{
				key,
				rowKey,
				sourceSubmissionId: null,
				status: "configured" as const,
				title: incentive.title,
				description: incentive.description ?? "",
				notes: incentive.notes ?? "",
				type: incentive.type,
				data: (incentive.data ?? (incentive.type === "goal" ? { goal: 0, current: 0 } : { options: [] })) as unknown as
					| Goal
					| War,
			},
		];
	});

	// The first run's time becomes the event start so times don't shift
	const firstStart = runs[0].scheduledTime as string;
	if (event.timeSettings?.startTime !== firstStart) {
		rows.unshift({
			key: nanoid(),
			type: "other",
			submissionIds: [],
			gameName: "",
			category: "Pre-show",
			platform: "",
			techPlatform: "",
			estimate: msToEstimate(Math.max(0, new Date(firstStart).getTime() - new Date(event.timeSettings?.startTime ?? firstStart).getTime())),
			setupMinutesOverride: 0,
			runnerIds: [],
			otherRunners: "",
			isRace: false,
			isCoop: false,
			specialRequirements: "",
			pairingConfirmed: true,
			racerHint: "",
		});
		if (rows[0].estimate === "00:00:00") rows.shift();
	}

	await upsertDraft(req, eventId, {
		defaultSetupMinutes,
		rows: rows as unknown as ScheduleDraft["rows"],
		incentives: draftIncentives as unknown as ScheduleDraft["incentives"],
		status: "applied",
		appliedAt: new Date().toISOString(),
		appliedBy: req.user?.id ?? null,
		appliedMap: map as unknown as ScheduleDraft["appliedMap"],
	});

	return { rows: rows.length };
}

// ---------------------------------------------------------------------------
// Finalising submissions
// ---------------------------------------------------------------------------

/** Submissions linked to the event's live runs are the source of truth for acceptance. */
async function liveRunRows(req: PayloadRequest, eventId: number): Promise<DraftRow[]> {
	const runs = await req.payload.find({
		collection: "runs",
		where: { event: { equals: eventId } },
		depth: 0,
		pagination: false,
		overrideAccess: true,
		select: { type: true, submissions: true },
		req,
	});
	return runs.docs.map(
		(run) =>
			({
				type: (run.type ?? "run") as RunType,
				submissionIds: (run.submissions ?? []).map((submission) => relationId(submission) as number),
			}) as DraftRow,
	);
}

export async function finaliseSubmissions(
	req: PayloadRequest,
	eventId: number,
	options: FinaliseOptions & { dryRun?: boolean },
): Promise<FinalisePlan> {
	await loadEvent(req, eventId);
	const rows = await liveRunRows(req, eventId);
	if (rows.length === 0) throw new ScheduleError("Apply the schedule before finalising submissions.");

	const submissions = await loadSubmissions(req, eventId);
	const plan = planSubmissionStatuses(rows, submissions, options);
	if (options.dryRun) return plan;

	for (const change of plan.changes) {
		await req.payload.update({
			collection: "submissions",
			id: change.id,
			data: { status: change.to },
			depth: 0,
			overrideAccess: true,
			req,
		});
	}

	const draft = await findDraft(req, eventId);
	if (draft) {
		await req.payload.update({
			collection: "schedule-drafts",
			id: draft.id,
			data: { finalisedAt: new Date().toISOString() },
			depth: 0,
			overrideAccess: true,
			req,
		});
	}

	return plan;
}

// ---------------------------------------------------------------------------
// Horaro
// ---------------------------------------------------------------------------

export async function exportHoraro(req: PayloadRequest, eventId: number): Promise<HoraroSchedule> {
	const event = await loadEvent(req, eventId);
	const runs = (
		await req.payload.find({
			collection: "runs",
			where: { event: { equals: eventId } },
			sort: "scheduledTime",
			depth: 1,
			pagination: false,
			overrideAccess: true,
			populate: { games: { name: true }, users: { username: true, socials: true } },
			joins: false,
			req,
		})
	).docs.filter((run) => run.scheduledTime);

	if (runs.length === 0) throw new ScheduleError("This event has no scheduled runs to export.");

	const incentives = await req.payload.find({
		collection: "incentives",
		where: { run: { in: runs.map((run) => run.id) } },
		depth: 0,
		pagination: false,
		overrideAccess: true,
		select: { title: true, run: true },
		req,
	});

	return buildHoraroSchedule(
		{ name: event.name, shortName: event.shortName, timezone: toEventSummary(event).timezone },
		runs.map((run) => ({
			type: (run.type ?? "run") as RunType,
			title: run.title ?? "",
			game: typeof run.game === "object" && run.game ? run.game.name : "",
			category: run.category ?? "",
			platform: run.platform ?? "",
			estimate: run.estimate,
			scheduledTime: run.scheduledTime as string,
			isRace: Boolean(run.isRace),
			isCoop: Boolean(run.isCoop),
			runners: (run.runners ?? [])
				.filter((runner): runner is User => typeof runner === "object")
				.map((runner) => ({
					username: runner.username,
					twitch: runner.socials?.twitch,
					bluesky: runner.socials?.bluesky,
				})),
			otherRunners: run.otherRunners ?? "",
			incentives: incentives.docs
				.filter((incentive) => relationId(incentive.run) === run.id)
				.map((incentive) => incentive.title),
		})),
	);
}

export type { ScheduleIssue };
