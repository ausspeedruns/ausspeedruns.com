// @vitest-environment node
import { createLocalReq, getPayload, type Payload, type PayloadRequest } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { canRunJobs } from "#/access/runJobs";
import config from "#/payload.config";
import type { Event, Game, Run, User } from "#/payload-types";
import { getEventLiveData } from "#/utilities/events/liveData";
import { getSafeRedirectPath, toSafeRelativePath } from "#/utilities/safeRedirect";

describe("getSafeRedirectPath", () => {
	it("keeps same-origin relative paths", () => {
		expect(getSafeRedirectPath("/account?tab=1#orders")).toBe("/account?tab=1#orders");
		expect(getSafeRedirectPath("/schedule/ASM2026")).toBe("/schedule/ASM2026");
	});

	it.each([
		"//evil.com",
		"/\\evil.com",
		"/\\/evil.com",
		"/\t/evil.com",
		"/\n/evil.com",
		"https://evil.com",
		"javascript:alert(1)",
		"evil.com",
		"",
		null,
		undefined,
	])("rejects %j", (value) => {
		expect(toSafeRelativePath(value)).toBeNull();
		expect(getSafeRedirectPath(value, "/fallback")).toBe("/fallback");
	});
});

describe("access control", () => {
	let payload: Payload;
	const suffix = Date.now().toString(36);
	const roleIds: number[] = [];
	const eventIds: number[] = [];
	let game: Game;

	let admin: User;
	let manager: User;
	let member: User;
	let otherMember: User;
	let managerReq: PayloadRequest;
	let memberReq: PayloadRequest;
	let techReq: PayloadRequest;
	let anonReq: PayloadRequest;

	let hiddenEvent: Event;
	let publicEvent: Event;
	let hiddenRun: Run;
	let publicRun: Run;

	const createRole = async (name: string, data: Record<string, boolean>) => {
		const role = await payload.create({ collection: "roles", data: { name: `${name} ${suffix}`, ...data } });
		roleIds.push(role.id);
		return role.id;
	};

	const createUser = (name: string, roles: number[] = []) =>
		payload.create({
			collection: "users",
			disableVerificationEmail: true,
			data: {
				username: `sec_${name}_${suffix}`,
				email: `sec_${name}_${suffix}@example.com`,
				password: "password123",
				dateOfBirth: "1990-01-01T00:00:00.000Z",
				roles,
			},
		});

	const reqFor = (user: User) => createLocalReq({ user: { ...user, collection: "users" } as never }, payload);

	const createEvent = async (name: string, schedulePublished: boolean) => {
		const event = await payload.create({
			collection: "events",
			draft: false,
			data: {
				_status: "published",
				name,
				shortName: `${name}${suffix}`.toUpperCase(),
				timeSettings: {
					timezone: "Australia/Melbourne",
					startTime: "2026-07-04T00:00:00.000Z",
					endTime: "2026-07-05T00:00:00.000Z",
				},
				scheduleMetadata: { published: schedulePublished },
			},
		});
		eventIds.push(event.id);
		return event;
	};

	const createRun = (event: Event) =>
		payload.create({
			collection: "runs",
			data: {
				event: event.id,
				game: game.id,
				category: "Any%",
				platform: "PC",
				estimate: "00:30:00",
				scheduledTime: "2026-07-04T01:00:00.000Z",
				runners: [member.id],
				specialRequirements: "Needs a wheelchair-accessible stage",
			},
		});

	beforeAll(async () => {
		payload = await getPayload({ config: await config });

		admin = await createUser("admin", [await createRole("Sec Admin", { admin: true })]);
		manager = await createUser("manager", [await createRole("Sec Users", { canManageUsers: true })]);
		const tech = await createUser("tech", [await createRole("Sec Tech", { canAccessTechSchedule: true })]);
		member = await createUser("member");
		otherMember = await createUser("other");

		managerReq = await reqFor(manager);
		memberReq = await reqFor(member);
		techReq = await reqFor(tech);
		anonReq = await createLocalReq({}, payload);

		game = await payload.create({ collection: "games", data: { name: `Security Game ${suffix}` } });
		hiddenEvent = await createEvent("SecHidden", false);
		publicEvent = await createEvent("SecPublic", true);
		hiddenRun = await createRun(hiddenEvent);
		publicRun = await createRun(publicEvent);
		await payload.create({
			collection: "incentives",
			data: { title: `Hidden incentive ${suffix}`, type: "goal", run: hiddenRun.id, isActive: true } as never,
		});
	});

	afterAll(async () => {
		if (!payload) return;
		for (const id of eventIds) {
			await payload.delete({ collection: "incentives", where: { event: { equals: id } } });
			await payload.delete({ collection: "runs", where: { event: { equals: id } } });
			await payload.delete({ collection: "events", id });
		}
		if (game) await payload.delete({ collection: "games", id: game.id });
		await payload.delete({ collection: "users", where: { username: { like: `sec_%_${suffix}` } } });
		for (const id of roleIds) await payload.delete({ collection: "roles", id });
		await payload.destroy();
	});

	describe("job runner", () => {
		const schedulerReq = (authorization?: string) =>
			({ user: null, headers: new Headers(authorization ? { authorization } : {}) }) as unknown as PayloadRequest;

		it("only lets admins, content managers and the cron secret run jobs", async () => {
			const previous = process.env.CRON_SECRET;
			process.env.CRON_SECRET = "test-cron-secret";
			try {
				const contentReq = await reqFor(
					await createUser("content", [await createRole("Sec Content", { canManageContent: true })]),
				);

				expect(await canRunJobs({ req: await reqFor(admin) })).toBe(true);
				expect(await canRunJobs({ req: contentReq })).toBe(true);
				expect(await canRunJobs({ req: schedulerReq("Bearer test-cron-secret") })).toBe(true);

				expect(await canRunJobs({ req: memberReq })).toBe(false);
				expect(await canRunJobs({ req: managerReq })).toBe(false);
				expect(await canRunJobs({ req: anonReq })).toBe(false);
				expect(await canRunJobs({ req: schedulerReq("Bearer wrong") })).toBe(false);
			} finally {
				if (previous === undefined) delete process.env.CRON_SECRET;
				else process.env.CRON_SECRET = previous;
			}
		});

		it("fails closed when CRON_SECRET isn't set", async () => {
			const previous = process.env.CRON_SECRET;
			delete process.env.CRON_SECRET;
			try {
				expect(await canRunJobs({ req: schedulerReq("Bearer undefined") })).toBe(false);
				expect(await canRunJobs({ req: schedulerReq("Bearer ") })).toBe(false);
			} finally {
				if (previous === undefined) delete process.env.CRON_SECRET;
				else process.env.CRON_SECRET = previous;
			}
		});
	});

	describe("users", () => {
		it("stops user managers changing an admin's credentials", async () => {
			await expect(
				payload.update({
					collection: "users",
					id: admin.id,
					data: { password: "hijacked123" },
					overrideAccess: false,
					req: managerReq,
				}),
			).rejects.toThrow();
			await expect(
				payload.update({
					collection: "users",
					id: admin.id,
					data: { email: `hijacked_${suffix}@example.com` },
					overrideAccess: false,
					req: managerReq,
				}),
			).rejects.toThrow();
		});

		it("stops user managers deleting admins", async () => {
			await expect(
				payload.delete({ collection: "users", id: admin.id, overrideAccess: false, req: managerReq }),
			).rejects.toThrow();
		});

		it("still lets user managers edit normal users and themselves", async () => {
			const updated = await payload.update({
				collection: "users",
				id: member.id,
				data: { name: "Edited by manager" },
				overrideAccess: false,
				req: managerReq,
			});
			expect(updated.name).toBe("Edited by manager");

			const self = await payload.update({
				collection: "users",
				id: manager.id,
				data: { name: "Manager" },
				overrideAccess: false,
				req: managerReq,
			});
			expect(self.name).toBe("Manager");
		});

		it("lets admins edit user managers", async () => {
			const updated = await payload.update({
				collection: "users",
				id: manager.id,
				data: { name: "Edited by admin" },
				overrideAccess: false,
				req: await reqFor(admin),
			});
			expect(updated.name).toBe("Edited by admin");
		});

		it("stops members editing other users", async () => {
			await expect(
				payload.update({
					collection: "users",
					id: otherMember.id,
					data: { name: "Nope" },
					overrideAccess: false,
					req: memberReq,
				}),
			).rejects.toThrow();
		});

		// Public sign ups have to go through the bot-checked /signup server action
		it("doesn't let anonymous visitors or members create accounts through the API", async () => {
			const data = (name: string) => ({
				username: `sec_${name}_${suffix}`,
				email: `sec_${name}_${suffix}@example.com`,
				password: "password123",
				dateOfBirth: "1990-01-01T00:00:00.000Z",
				_verified: true,
			});

			await expect(
				payload.create({
					collection: "users",
					disableVerificationEmail: true,
					data: data("anon"),
					overrideAccess: false,
					req: anonReq,
				}),
			).rejects.toThrow();
			await expect(
				payload.create({
					collection: "users",
					disableVerificationEmail: true,
					data: data("fake"),
					overrideAccess: false,
					req: memberReq,
				}),
			).rejects.toThrow();
		});

		it("only allows password reset requests through the website's forgot password page", async () => {
			await expect(
				payload.forgotPassword({
					collection: "users",
					data: { email: member.email },
					disableEmail: true,
					req: { payloadAPI: "REST" },
				}),
			).rejects.toThrow();
			await expect(
				payload.forgotPassword({ collection: "users", data: { email: member.email }, disableEmail: true }),
			).resolves.toBeTruthy();
		});

		it("still lets user managers create accounts", async () => {
			const created = await payload.create({
				collection: "users",
				disableVerificationEmail: true,
				data: {
					username: `sec_managed_${suffix}`,
					email: `sec_managed_${suffix}@example.com`,
					password: "password123",
					dateOfBirth: "1990-01-01T00:00:00.000Z",
				},
				overrideAccess: false,
				req: managerReq,
			});
			expect(created.username).toBe(`sec_managed_${suffix}`);
		});
	});

	describe("schedule data", () => {
		const eventFilter = () => ({ event: { in: [hiddenEvent.id, publicEvent.id] } });

		it("hides runs from unpublished schedules and private run details from the public", async () => {
			const { docs } = await payload.find({
				collection: "runs",
				where: eventFilter(),
				depth: 0,
				overrideAccess: false,
				req: anonReq,
			});
			expect(docs.map((run) => run.id)).toEqual([publicRun.id]);
			expect(docs[0].specialRequirements).toBeUndefined();
		});

		it("gives tech schedule users every run including special requirements", async () => {
			const { docs } = await payload.find({
				collection: "runs",
				where: eventFilter(),
				depth: 0,
				sort: "id",
				overrideAccess: false,
				req: techReq,
			});
			expect(docs.map((run) => run.id)).toEqual([hiddenRun.id, publicRun.id].sort((a, b) => a - b));
			expect(docs.every((run) => run.specialRequirements === "Needs a wheelchair-accessible stage")).toBe(true);
		});

		it("hides incentives from unpublished schedules", async () => {
			const { docs } = await payload.find({
				collection: "incentives",
				where: { event: { equals: hiddenEvent.id } },
				depth: 0,
				overrideAccess: false,
				req: anonReq,
			});
			expect(docs).toHaveLength(0);
		});

		it("doesn't return live data for unpublished schedules", async () => {
			expect(await getEventLiveData(hiddenEvent.id)).toEqual({ runs: [], incentives: [] });
			const visible = await getEventLiveData(publicEvent.id);
			expect(visible.runs).toHaveLength(1);
		});
	});
});
