// @vitest-environment node
import { createLocalReq, getPayload, type Payload, type PayloadRequest } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ScheduleDrafts } from "#/collections/ScheduleDrafts";
import { linkSubmission, updateIncentive, updateRow } from "#/components/ScheduleImport/draftOps";
import config from "#/payload.config";
import type { Event, Submission, User } from "#/payload-types";
import {
	applyDraft,
	finaliseSubmissions,
	importCsv,
	loadDraftResponse,
	rebuildDraftFromRuns,
	resetSchedule,
	saveDraft,
} from "#/utilities/schedule/server";

let payload: Payload;
let staffReq: PayloadRequest;
let runner: User;
let alice: User;
let bob: User;
let carol: User;
let staffUser: User;
let event: Event;
const submissions: Record<string, Submission> = {};

const suffix = Date.now().toString(36);

async function createUser(username: string, roles: number[] = []) {
	return payload.create({
		collection: "users",
		disableVerificationEmail: true,
		data: {
			username,
			email: `${username}@example.com`,
			password: "password123",
			dateOfBirth: "1990-01-01T00:00:00.000Z",
			roles,
		},
	});
}

async function createSubmission(runnerId: string, data: Partial<Submission>) {
	return payload.create({
		collection: "submissions",
		data: {
			event: event.id,
			runner: runnerId,
			game: `Import Game ${suffix}`,
			category: "Any%",
			platform: "PC",
			estimate: "01:00:00",
			status: "pending",
			availability: [true, true],
			...data,
		},
	});
}

async function getDraft() {
	return loadDraftResponse(staffReq, event.id);
}

describe("Schedule importer", () => {
	beforeAll(async () => {
		payload = await getPayload({ config: await config });

		const staffRole = await payload.create({
			collection: "roles",
			data: { name: `Schedule Staff ${suffix}`, canManageContent: true },
		});
		staffUser = await createUser(`sched_staff_${suffix}`, [staffRole.id]);
		runner = await createUser(`sched_runner_${suffix}`);
		alice = await createUser(`alice_${suffix}`);
		bob = await createUser(`bob_${suffix}`);
		carol = await createUser(`carol_${suffix}`);
		staffReq = await createLocalReq({ user: { ...staffUser, collection: "users" } as never }, payload);

		event = await payload.create({
			collection: "events",
			draft: false,
			data: {
				_status: "published",
				name: "Schedule Import Event",
				shortName: `SCHED${suffix}`,
				timeSettings: {
					timezone: "Australia/Melbourne",
					startTime: "2026-07-04T00:00:00.000Z",
					endTime: "2026-07-05T00:00:00.000Z",
				},
			},
		});

		submissions.solo = await createSubmission(runner.id, {
			donationIncentives: [{ title: "Bonus level" }],
			specialRequirements: "Needs a CRT",
		});
		submissions.raceA = await createSubmission(alice.id, {
			game: `Race Game ${suffix}`,
			raceType: "only",
			racer: bob.username,
			specialRequirements: "Left-handed controller",
		});
		submissions.raceB = await createSubmission(bob.id, {
			game: `Race Game ${suffix}`,
			raceType: "only",
			racer: alice.username,
			specialRequirements: "Bring own capture card",
			donationIncentives: [{ title: "Race bonus" }],
		});
		submissions.backupAccepted = await createSubmission(runner.id, { game: "Other game", canBackup: true });
		submissions.backupOther = await createSubmission(carol.id, { game: "Carol game", canBackup: true });
		submissions.rejected = await createSubmission(carol.id, { game: "Rejected game" });
	});

	afterAll(async () => {
		await payload?.destroy();
	});

	it("denies the endpoints to users without content management", async () => {
		const endpoint = ScheduleDrafts.endpoints
			? (ScheduleDrafts.endpoints as { path: string; method: string; handler: (req: PayloadRequest) => Promise<Response> }[]).find(
					(candidate) => candidate.path === "/event/:eventId" && candidate.method === "get",
				)
			: undefined;
		expect(endpoint).toBeDefined();

		const runnerReq = await createLocalReq({ user: { ...runner, collection: "users" } as never }, payload);
		runnerReq.routeParams = { eventId: String(event.id) };
		const denied = await endpoint!.handler(runnerReq);
		expect(denied.status).toBe(403);

		staffReq.routeParams = { eventId: String(event.id) };
		const allowed = await endpoint!.handler(staffReq);
		expect(allowed.status).toBe(200);
	});

	it("imports a CSV into a draft", async () => {
		const report = await importCsv(
			staffReq,
			event.id,
			[
				{ id: String(submissions.solo.id), estimate: "0:50" },
				{ game: "Setup Buffer", estimate: "0:15" },
				{ id: String(submissions.raceA.id) },
				{ game: "Sleep", category: "Overnight", estimate: "8:00" },
			],
			10,
		);

		expect(report.rowCount).toBe(4);
		expect(report.runCount).toBe(2);
		expect(report.newGames).toEqual(expect.arrayContaining([`Import Game ${suffix}`, `Race Game ${suffix}`]));

		const draft = await getDraft();
		expect(draft.draft.rows.map((row) => row.type)).toEqual(["run", "setupBuffer", "run", "sleep"]);
		expect(draft.draft.rows[0].estimate).toBe("00:50:00");
		expect(draft.draft.rows[2]).toMatchObject({ isRace: true, pairingConfirmed: false });
		expect(draft.draft.incentives).toHaveLength(1);
	});

	it("applies the draft, creating games, runs, incentives and the event end time", async () => {
		const draft = await getDraft();
		let state = { defaultSetupMinutes: 10, rows: draft.draft.rows, incentives: draft.draft.incentives };

		const raceRow = state.rows[2];
		state = linkSubmission(
			state,
			raceRow.key,
			draft.submissions.find((submission) => submission.id === submissions.raceB.id)!,
			draft.submissions,
		);
		state = updateRow(state, raceRow.key, { pairingConfirmed: true });
		for (const incentive of state.incentives) {
			state = updateIncentive(state, incentive.key, { status: "configured", data: { goal: 100, current: 0 } });
		}
		await saveDraft(staffReq, event.id, state, draft.draft.updatedAt);

		const result = await applyDraft(staffReq, event.id);
		expect(result).toMatchObject({ created: 4, updated: 0, deleted: 0 });
		expect(result.incentives.created).toBe(2);
		expect(result.gamesCreated).toEqual(expect.arrayContaining([`Import Game ${suffix}`, `Race Game ${suffix}`]));

		const runs = await payload.find({
			collection: "runs",
			where: { event: { equals: event.id } },
			sort: "scheduledTime",
			depth: 0,
		});
		expect(runs.docs.map((run) => run.type)).toEqual(["run", "setupBuffer", "run", "sleep"]);
		expect(runs.docs.map((run) => run.scheduledTime)).toEqual([
			"2026-07-04T00:00:00.000Z",
			"2026-07-04T01:00:00.000Z", // 50 min + 10 setup
			"2026-07-04T01:15:00.000Z", // buffer has no setup
			"2026-07-04T02:25:00.000Z",
		]);

		const race = runs.docs[2];
		expect(race.submissions).toEqual([submissions.raceA.id, submissions.raceB.id]);
		expect(race.runners).toEqual([alice.id, bob.id]);
		expect(race.specialRequirements).toContain("Left-handed controller");
		expect(race.specialRequirements).toContain("Bring own capture card");

		const updatedEvent = await payload.findByID({ collection: "events", id: event.id, depth: 0 });
		expect(updatedEvent.timeSettings?.endTime).toBe("2026-07-04T10:25:00.000Z");
	});

	it("re-applies edits in place and keeps donation totals", async () => {
		const incentives = await payload.find({ collection: "incentives", where: { event: { equals: event.id } }, depth: 0 });
		const raceIncentive = incentives.docs.find((incentive) => incentive.title === "Race bonus")!;
		await payload.update({ collection: "incentives", id: raceIncentive.id, data: { data: { goal: 100, current: 42 } } });

		const draft = await getDraft();
		let state = { defaultSetupMinutes: 10, rows: draft.draft.rows, incentives: draft.draft.incentives };
		state = updateRow(state, state.rows[0].key, { estimate: "01:30:00" });
		state = { ...state, rows: state.rows.filter((row) => row.type !== "setupBuffer") };
		await saveDraft(staffReq, event.id, state, draft.draft.updatedAt);

		const result = await applyDraft(staffReq, event.id);
		expect(result).toMatchObject({ created: 0, updated: 3, deleted: 1 });

		const updated = await payload.findByID({ collection: "incentives", id: raceIncentive.id, depth: 0 });
		expect(updated.data).toEqual({ goal: 100, current: 42 });
	});

	it("rejects stale saves from another staff member", async () => {
		const draft = await getDraft();
		await saveDraft(staffReq, event.id, draft.draft, draft.draft.updatedAt);
		await expect(saveDraft(staffReq, event.id, draft.draft, draft.draft.updatedAt)).rejects.toThrow(/Someone else/);
	});

	it("finalises submissions with the accepted-runners backup rule", async () => {
		const preview = await finaliseSubmissions(staffReq, event.id, {
			backupRule: "acceptedRunnersOnly",
			skipReviewed: false,
			dryRun: true,
		});
		expect(preview.counts).toEqual({ pending: 0, accepted: 3, backup: 1, rejected: 2 });

		const unchanged = await payload.findByID({ collection: "submissions", id: submissions.solo.id });
		expect(unchanged.status).toBe("pending");

		await finaliseSubmissions(staffReq, event.id, { backupRule: "acceptedRunnersOnly", skipReviewed: false });
		const statuses = Object.fromEntries(
			await Promise.all(
				Object.entries(submissions).map(async ([name, submission]) => [
					name,
					(await payload.findByID({ collection: "submissions", id: submission.id })).status,
				]),
			),
		);
		expect(statuses).toEqual({
			solo: "accepted",
			raceA: "accepted",
			raceB: "accepted",
			backupAccepted: "backup",
			backupOther: "rejected",
			rejected: "rejected",
		});
	});

	it("rebuilds the draft from live runs", async () => {
		const result = await rebuildDraftFromRuns(staffReq, event.id);
		expect(result.rows).toBe(3);
		const draft = await getDraft();
		expect(draft.draft.status).toBe("applied");
		expect(draft.draft.incentives.every((incentive) => incentive.status === "configured")).toBe(true);

		// Re-applying the rebuilt draft must not duplicate anything
		const applied = await applyDraft(staffReq, event.id);
		expect(applied).toMatchObject({ created: 0, updated: 3, deleted: 0 });
	});

	it("resets the schedule and submissions", async () => {
		const result = await resetSchedule(staffReq, event.id, { resetSubmissions: true });
		expect(result.runs).toBe(3);
		expect(result.incentives).toBe(2);

		const runs = await payload.count({ collection: "runs", where: { event: { equals: event.id } } });
		expect(runs.totalDocs).toBe(0);
		const pending = await payload.count({
			collection: "submissions",
			where: { and: [{ event: { equals: event.id } }, { status: { equals: "pending" } }] },
		});
		expect(pending.totalDocs).toBe(Object.keys(submissions).length);

		const draft = await getDraft();
		expect(draft.draft.status).toBe("draft");
		expect(draft.draft.rows).toHaveLength(3);
	});
});
