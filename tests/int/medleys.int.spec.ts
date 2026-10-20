// @vitest-environment node
import { createLocalReq, getPayload, type Payload, type PayloadRequest } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { Events } from "#/collections/Events";
import config from "#/payload.config";
import type { Event, Game, Incentive, Run, SegmentType, User } from "#/payload-types";
import { toLiveRuns } from "#/utilities/events/liveSchedule";
import { isCountedRun } from "#/utilities/runDisplay";
import { csvRowsToDraft } from "#/utilities/schedule/csv";
import { buildHoraroSchedule } from "#/utilities/schedule/horaro";
import { addToMedley, insertRowAfter, moveRowInTree, normaliseRows, removeFromMedley } from "#/utilities/schedule/medley";
import { applyDraft, loadDraftResponse, rebuildDraftFromRuns, saveDraft } from "#/utilities/schedule/server";
import { buildTechSchedule } from "#/utilities/schedule/techSchedule";
import { computeSchedule } from "#/utilities/schedule/timing";
import type { DraftRow, EventSummary } from "#/utilities/schedule/types";
import { validateDraft } from "#/utilities/schedule/validation";

const eventSummary: EventSummary = {
	id: 1,
	name: "Test Event",
	shortName: "TEST",
	startTime: "2026-07-04T00:00:00.000Z",
	endTime: "2026-07-05T12:00:00.000Z",
	timezone: "Australia/Melbourne",
};

function row(overrides: Partial<DraftRow>): DraftRow {
	return {
		key: "r",
		type: "run",
		parentKey: null,
		segmentTypeId: null,
		submissionIds: [],
		gameName: "Game",
		category: "Any%",
		platform: "PC",
		techPlatform: "",
		estimate: "01:00:00",
		setupMinutesOverride: null,
		runnerIds: ["u1"],
		otherRunners: "",
		isRace: false,
		isCoop: false,
		specialRequirements: "",
		pairingConfirmed: true,
		racerHint: "",
		...overrides,
	};
}

const medleyRows = () => [
	row({ key: "a", estimate: "00:30:00" }),
	row({ key: "m", type: "medley", gameName: "", category: "5 Minute Games", estimate: "00:20:00", runnerIds: [] }),
	row({ key: "m1", parentKey: "m", estimate: "00:05:00", gameName: "Game 1", runnerIds: ["u2"] }),
	row({ key: "m2", parentKey: "m", estimate: "00:07:00", gameName: "Game 2", runnerIds: ["u3"] }),
	row({ key: "b", estimate: "00:10:00" }),
];

const keys = (rows: Pick<DraftRow, "key" | "parentKey">[]) => rows.map((r) => (r.parentKey ? `${r.parentKey}>${r.key}` : r.key));

describe("medley timing and validation", () => {
	it("lays games out inside the medley without moving the schedule on", () => {
		const timed = computeSchedule(medleyRows(), eventSummary.startTime as string, 10);
		const starts = Object.fromEntries(timed.map((entry) => [entry.row.key, entry.start.toISOString()]));

		expect(starts).toEqual({
			a: "2026-07-04T00:00:00.000Z",
			m: "2026-07-04T00:40:00.000Z", // run + 10 min setup
			m1: "2026-07-04T00:40:00.000Z",
			m2: "2026-07-04T00:45:00.000Z",
			b: "2026-07-04T01:10:00.000Z", // medley slot (20) + default setup (10)
		});
	});

	it("warns when the games don't fit and errors on bad structure", () => {
		const rows = medleyRows();
		rows[2].estimate = "00:15:00";
		const segment = row({ key: "s", type: "segment", gameName: "", category: "News", segmentTypeId: null });
		const issues = validateDraft({ defaultSetupMinutes: 10, rows: [...rows, segment], incentives: [] }, eventSummary, []);

		expect(issues.some((issue) => issue.rowKey === "m" && issue.level === "warning" && /longer than/.test(issue.message))).toBe(true);
		expect(issues.some((issue) => issue.rowKey === "s" && issue.level === "error")).toBe(true);
		// Games inside a medley aren't flagged as back-to-back with each other
		expect(issues.some((issue) => /back-to-back/.test(issue.message))).toBe(false);
	});
});

describe("medley row operations", () => {
	it("normalises orphans and keeps children after their medley", () => {
		const rows = [
			row({ key: "c", parentKey: "m" }),
			row({ key: "m", type: "medley", category: "M" }),
			row({ key: "x", parentKey: "missing" }),
		];
		expect(keys(normaliseRows(rows))).toEqual(["m", "m>c", "x"]);
	});

	it("moves a medley together with its games", () => {
		const rows = medleyRows();
		// Drag the medley (index 1) down onto "b" (index 4)
		expect(keys(moveRowInTree(rows, 1, 4))).toEqual(["a", "b", "m", "m>m1", "m>m2"]);
	});

	it("joins and leaves medleys by dragging", () => {
		// Drag "a" down onto game m1: it joins the medley after m1
		expect(keys(moveRowInTree(medleyRows(), 0, 2))).toEqual(["m", "m>m1", "m>a", "m>m2", "b"]);
		// Drag game m2 down onto "b": it leaves the medley
		expect(keys(moveRowInTree(medleyRows(), 3, 4))).toEqual(["a", "m", "m>m1", "b", "m2"]);
	});

	it("adds, removes and inserts rows around medleys", () => {
		expect(keys(addToMedley(medleyRows(), "b", "m"))).toEqual(["a", "m", "m>m1", "m>m2", "m>b"]);
		expect(keys(removeFromMedley(medleyRows(), "m1"))).toEqual(["a", "m", "m>m2", "m1", "b"]);
		expect(keys(insertRowAfter(medleyRows(), "m1", row({ key: "n" })))).toEqual(["a", "m", "m>m1", "m>n", "m>m2", "b"]);
		expect(keys(insertRowAfter(medleyRows(), "m1", row({ key: "s", type: "sleep" })))).toEqual([
			"a",
			"m",
			"m>m1",
			"m>m2",
			"s",
			"b",
		]);
	});
});

describe("medley csv import", () => {
	it("links games to medleys and resolves segment types", () => {
		const draft = csvRowsToDraft(
			[
				{ type: "medley", game: "5 Minute Games", estimate: "00:20:00" },
				{ game: "Game 1", category: "Any%", estimate: "00:05:00", runner: "alice", medley: "5 minute games" },
				{ type: "news", category: "The AusSpeedruns Report", estimate: "00:05:00" },
				{ type: "segment", segmentType: "Unknown", category: "Mystery", estimate: "00:05:00" },
				{ game: "Game 2", estimate: "00:05:00", medley: "Nope" },
			],
			{
				submissions: [],
				users: [{ id: "u1", username: "alice" }],
				games: [],
				segmentTypes: [{ id: 3, name: "News", slug: "news", colour: null }],
			},
		);

		expect(draft.rows.map((r) => [r.type, r.category, Boolean(r.parentKey)])).toEqual([
			["medley", "5 Minute Games", false],
			["run", "Any%", true],
			["segment", "The AusSpeedruns Report", false],
			["segment", "Mystery", false],
			["run", "", false],
		]);
		expect(draft.rows[1].parentKey).toBe(draft.rows[0].key);
		expect(draft.rows[2].segmentTypeId).toBe(3);
		expect(draft.report.unknownSegmentTypes).toEqual(["Unknown"]);
		expect(draft.report.unknownMedleys).toEqual(["Nope"]);
	});
});

describe("medley exports", () => {
	const segmentType = { id: 9, name: "News", slug: "news" } as SegmentType;
	const game = (id: number, name: string) => ({ id, name }) as Game;
	const runs = [
		{ id: 1, type: "medley", category: "5 Minute Games", estimate: "00:20:00", scheduledTime: "2026-07-04T00:00:00.000Z", runners: [{ id: "u2", username: "bob" }] },
		{ id: 3, type: "run", parent: 1, order: 2, game: game(12, "Game 2"), category: "Any%", estimate: "00:07:00", scheduledTime: "2026-07-04T00:05:00.000Z", runners: [{ id: "u3", username: "carol" }] },
		{ id: 2, type: "run", parent: 1, order: 1, game: game(11, "Game 1"), category: "Any%", estimate: "00:05:00", scheduledTime: "2026-07-04T00:00:00.000Z", runners: [{ id: "u2", username: "bob" }] },
		{ id: 4, type: "segment", segmentType, title: "News — Report", category: "Report", estimate: "00:05:00", scheduledTime: "2026-07-04T00:30:00.000Z", runners: [], otherRunners: "Anchor" },
	] as unknown as Run[];

	it("nests medley games in the tech schedule", () => {
		const schedule = buildTechSchedule(
			{ id: 1, name: "E", shortName: "E", timeSettings: { timezone: "Australia/Melbourne" } } as Event,
			runs,
			[{ id: 50, title: "Bonus", type: "goal", run: 2, isActive: true, data: { goal: 10, current: 0 } } as unknown as Incentive],
			new Date("2026-01-01T00:00:00.000Z"),
		);

		expect(schedule.version).toBe(1);
		expect(schedule.items.map((item) => [item.id, item.type, item.title])).toEqual([
			[1, "medley", "5 Minute Games"],
			[4, "segment", "News — Report"],
		]);
		expect(schedule.items[0].children.map((child) => [child.id, child.title, child.order])).toEqual([
			[2, "Game 1", 1],
			[3, "Game 2", 2],
		]);
		expect(schedule.items[0].children[0].incentives[0]).toMatchObject({ id: 50, title: "Bonus" });
		expect(schedule.items[1]).toMatchObject({ segmentType: { slug: "news" }, otherRunners: ["Anchor"] });
	});

	it("folds medley games into the live schedule", () => {
		const live = toLiveRuns(runs);
		expect(live.map((run) => [run.id, run.title, run.category])).toEqual([
			[1, "5 Minute Games", "Game 1, Game 2"],
			[4, "News — Report", null],
		]);
		expect(live[1].runners).toEqual([{ name: "Anchor" }]);
	});

	it("counts the medley but not its games", () => {
		expect(runs.filter(isCountedRun).map((run) => run.id)).toEqual([1]);
	});

	it("exports a medley as a single horaro item", () => {
		const horaro = buildHoraroSchedule({ name: "E", shortName: "E", timezone: "Australia/Melbourne" }, [
			{
				type: "medley",
				title: "5 Minute Games",
				game: "",
				category: "5 Minute Games",
				platform: "PC",
				estimate: "00:20:00",
				scheduledTime: "2026-07-04T00:00:00.000Z",
				isRace: false,
				isCoop: false,
				runners: [{ username: "bob" }],
				otherRunners: "",
				incentives: [],
				children: [{ game: "Game 1", category: "Any%", runners: ["bob"] }],
			},
		]);
		expect(horaro.schedule.items[0].data.slice(0, 3)).toEqual(["5 Minute Games", "Game 1 (Any% – bob)", "bob"]);
	});
});

describe("medleys in the database", () => {
	let payload: Payload;
	let staffReq: PayloadRequest;
	let event: Event;
	let users: User[] = [];
	let games: Game[] = [];
	let segmentType: SegmentType;
	const suffix = Date.now().toString(36);

	const createUser = (username: string, roles: number[] = []) =>
		payload.create({
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

	beforeAll(async () => {
		payload = await getPayload({ config: await config });

		const staffRole = await payload.create({
			collection: "roles",
			data: { name: `Medley Staff ${suffix}`, canManageContent: true },
		});
		const staff = await createUser(`medley_staff_${suffix}`, [staffRole.id]);
		staffReq = await createLocalReq({ user: { ...staff, collection: "users" } as never }, payload);
		users = [await createUser(`medley_a_${suffix}`), await createUser(`medley_b_${suffix}`)];
		games = [
			await payload.create({ collection: "games", data: { name: `Medley Game A ${suffix}` } }),
			await payload.create({ collection: "games", data: { name: `Medley Game B ${suffix}` } }),
		];
		segmentType = await payload.create({
			collection: "segment-types",
			data: { name: `News ${suffix}`, slug: `news-${suffix}` },
		});
		event = await payload.create({
			collection: "events",
			draft: false,
			data: {
				_status: "published",
				name: "Medley Event",
				shortName: `MEDLEY${suffix}`,
				timeSettings: {
					timezone: "Australia/Melbourne",
					startTime: "2026-07-04T00:00:00.000Z",
					endTime: "2026-07-05T00:00:00.000Z",
				},
			},
		});
	});

	afterAll(async () => {
		if (payload) {
			await payload.delete({ collection: "runs", where: { event: { equals: event?.id } } });
			await payload.delete({ collection: "schedule-drafts", where: { event: { equals: event?.id } } });
			if (event) await payload.delete({ collection: "events", id: event.id });
			for (const game of games) await payload.delete({ collection: "games", id: game.id });
			if (segmentType) await payload.delete({ collection: "segment-types", id: segmentType.id });
			await payload.delete({ collection: "users", where: { username: { like: `medley_%_${suffix}` } } });
			await payload.destroy();
		}
	});

	it("syncs children with their medley and deletes them with it", async () => {
		const medley = await payload.create({
			collection: "runs",
			data: {
				type: "medley",
				event: event.id,
				category: "5 Minute Games",
				estimate: "00:20:00",
				scheduledTime: "2026-07-04T02:00:00.000Z",
			},
		});
		expect(medley.title).toBe("5 Minute Games");

		const first = await payload.create({
			collection: "runs",
			data: { game: games[0].id, parent: medley.id, order: 1, category: "Any%", platform: "PC", estimate: "00:05:00", runners: [users[0].id] },
		});
		await payload.create({
			collection: "runs",
			data: { game: games[1].id, parent: medley.id, order: 2, category: "Any%", platform: "PC", estimate: "00:07:00", runners: [users[1].id], otherRunners: "Guest" },
		});

		const children = await payload.find({ collection: "runs", where: { parent: { equals: medley.id } }, sort: "order", depth: 0 });
		expect(children.docs.map((child) => [child.event, new Date(child.scheduledTime as string).toISOString()])).toEqual([
			[event.id, "2026-07-04T02:00:00.000Z"],
			[event.id, "2026-07-04T02:05:00.000Z"],
		]);

		const synced = await payload.findByID({ collection: "runs", id: medley.id, depth: 0 });
		expect(synced.runners).toEqual([users[0].id, users[1].id]);
		expect(synced.otherRunners).toBe("Guest");

		// Moving the medley moves its games
		await payload.update({ collection: "runs", id: medley.id, data: { scheduledTime: "2026-07-04T03:00:00.000Z" } });
		const moved = await payload.findByID({ collection: "runs", id: first.id, depth: 0 });
		expect(new Date(moved.scheduledTime as string).toISOString()).toBe("2026-07-04T03:00:00.000Z");

		await expect(
			payload.create({
				collection: "runs",
				data: { game: games[0].id, parent: first.id, category: "Any%", platform: "PC", estimate: "00:05:00" },
			}),
		).rejects.toThrow(/medley/);

		await payload.delete({ collection: "runs", id: medley.id });
		const remaining = await payload.count({ collection: "runs", where: { id: { in: children.docs.map((child) => child.id) } } });
		expect(remaining.totalDocs).toBe(0);
	});

	it("applies and rebuilds a draft with medleys and segments", async () => {
		const rows: DraftRow[] = [
			row({ key: "seg", type: "segment", gameName: "", category: "Opening", estimate: "00:10:00", segmentTypeId: segmentType.id, runnerIds: [users[0].id], platform: "" }),
			row({ key: "med", type: "medley", gameName: "", category: "Showcase", estimate: "00:20:00", runnerIds: [], platform: "" }),
			row({ key: "g1", parentKey: "med", gameName: games[0].name, estimate: "00:05:00", runnerIds: [users[0].id] }),
			row({ key: "g2", parentKey: "med", gameName: games[1].name, estimate: "00:06:00", runnerIds: [users[1].id] }),
		];
		await saveDraft(staffReq, event.id, { defaultSetupMinutes: 10, rows, incentives: [] }, undefined);
		const result = await applyDraft(staffReq, event.id, { replaceUntracked: true });
		expect(result.created).toBe(4);

		const runs = await payload.find({ collection: "runs", where: { event: { equals: event.id } }, depth: 0, pagination: false, sort: "scheduledTime" });
		const medley = runs.docs.find((run) => run.type === "medley") as Run;
		const segment = runs.docs.find((run) => run.type === "segment") as Run;
		const kids = runs.docs.filter((run) => run.parent === medley.id);

		expect(segment.segmentType).toBe(segmentType.id);
		expect(segment.title).toBe(`News ${suffix} — Opening`);
		expect(new Date(medley.scheduledTime as string).toISOString()).toBe("2026-07-04T00:10:00.000Z");
		expect(kids.map((kid) => new Date(kid.scheduledTime as string).toISOString()).sort()).toEqual([
			"2026-07-04T00:10:00.000Z",
			"2026-07-04T00:15:00.000Z",
		]);
		expect(medley.runners).toEqual([users[0].id, users[1].id]);

		await rebuildDraftFromRuns(staffReq, event.id);
		const draft = await loadDraftResponse(staffReq, event.id);
		const rebuilt = draft.draft.rows;
		const medleyRow = rebuilt.find((candidate) => candidate.type === "medley");
		expect(rebuilt.filter((candidate) => candidate.parentKey === medleyRow?.key)).toHaveLength(2);
		expect(rebuilt.find((candidate) => candidate.type === "segment")?.segmentTypeId).toBe(segmentType.id);
		expect(draft.segmentTypes.some((type) => type.id === segmentType.id)).toBe(true);
	});

	it("serves the tech schedule only to permitted users", async () => {
		const endpoint = (Events.endpoints as { path: string; handler: (req: PayloadRequest) => Promise<Response> }[]).find(
			(candidate) => candidate.path === "/:shortName/tech-schedule",
		);
		expect(endpoint).toBeDefined();

		const anonReq = await createLocalReq({}, payload);
		anonReq.routeParams = { shortName: event.shortName };
		expect((await endpoint!.handler(anonReq)).status).toBe(403);

		const runnerReq = await createLocalReq({ user: { ...users[0], collection: "users" } as never }, payload);
		runnerReq.routeParams = { shortName: event.shortName };
		expect((await endpoint!.handler(runnerReq)).status).toBe(403);

		const techRole = await payload.create({ collection: "roles", data: { name: `Tech ${suffix}`, canAccessTechSchedule: true } });
		const tech = await createUser(`medley_tech_${suffix}`, [techRole.id]);
		const techReq = await createLocalReq({ user: { ...tech, collection: "users" } as never }, payload);
		techReq.routeParams = { shortName: event.shortName };
		const response = await endpoint!.handler(techReq);
		expect(response.status).toBe(200);

		const body = await response.json();
		const medley = body.items.find((item: { type: string }) => item.type === "medley");
		expect(medley.children.map((child: { game: { name: string } }) => child.game.name)).toEqual([games[0].name, games[1].name]);
		expect(medley.runners.map((runner: { username: string }) => runner.username)).toEqual([users[0].username, users[1].username]);

		techReq.routeParams = { shortName: "does-not-exist" };
		expect((await endpoint!.handler(techReq)).status).toBe(404);
		await payload.delete({ collection: "roles", id: techRole.id });
	});
});
