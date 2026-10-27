// @vitest-environment node
import { getPayload, type Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import config from "#/payload.config";
import type { Event, Product, User } from "#/payload-types";

let payload: Payload;
let runnerA: User;
let runnerB: User;
let staffUser: User;
let openEvent: Event;
let closedEvent: Event;

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

function submissionData(event: number) {
	return {
		event,
		game: "Super Mario 64",
		category: "16 Star",
		platform: "N64",
		estimate: "00:20:00",
		status: "pending" as const,
	};
}

describe("Collections", () => {
	beforeAll(async () => {
		payload = await getPayload({ config: await config });

		const staffRole = await payload.create({
			collection: "roles",
			data: { name: `Staff ${suffix}`, canManageContent: true, canManageUsers: true },
		});

		runnerA = await createUser(`runnerA_${suffix}`);
		runnerB = await createUser(`runnerB_${suffix}`);
		staffUser = await createUser(`staff_${suffix}`, [staffRole.id]);

		openEvent = await payload.create({
			collection: "events",
			draft: false,
			data: {
				_status: "published",
				name: "Open Event",
				shortName: `OPEN${suffix}`,
				settings: { isAcceptingSubmissions: true, isAcceptingVolunteers: true },
				timeSettings: { timezone: "Australia/Melbourne" },
			},
		});

		closedEvent = await payload.create({
			collection: "events",
			draft: false,
			data: {
				_status: "published",
				name: "Closed Event",
				shortName: `CLOSED${suffix}`,
				settings: { isAcceptingSubmissions: false, isAcceptingVolunteers: false },
				timeSettings: { timezone: "Australia/Melbourne" },
			},
		});
	});

	afterAll(async () => {
		await payload?.destroy();
	});

	describe("Submissions", () => {
		it("forces the runner and pending status for non-staff", async () => {
			const submission = await payload.create({
				collection: "submissions",
				overrideAccess: false,
				user: runnerA,
				data: { ...submissionData(openEvent.id), runner: runnerB.id, status: "accepted" as never },
			});

			expect(typeof submission.runner === "object" ? submission.runner.id : submission.runner).toBe(runnerA.id);
			expect(submission.status).toBe("pending");
		});

		it("rejects submissions to events that are not accepting them", async () => {
			await expect(
				payload.create({
					collection: "submissions",
					overrideAccess: false,
					user: runnerA,
					data: { ...submissionData(closedEvent.id), runner: runnerA.id },
				}),
			).rejects.toThrow(/not accepting submissions/);
		});

		it("only lets runners see and edit their own submissions", async () => {
			const own = await payload.find({ collection: "submissions", overrideAccess: false, user: runnerA });
			const other = await payload.find({ collection: "submissions", overrideAccess: false, user: runnerB });
			expect(own.totalDocs).toBeGreaterThan(0);
			expect(other.totalDocs).toBe(0);

			await expect(
				payload.update({
					collection: "submissions",
					id: own.docs[0].id,
					overrideAccess: false,
					user: runnerB,
					data: { category: "Hacked" },
				}),
			).rejects.toThrow();
		});

		it("locks submissions once staff have reviewed them", async () => {
			const submission = await payload.create({
				collection: "submissions",
				overrideAccess: false,
				user: runnerA,
				data: { ...submissionData(openEvent.id), runner: runnerA.id },
			});

			const edited = await payload.update({
				collection: "submissions",
				id: submission.id,
				overrideAccess: false,
				user: runnerA,
				data: { category: "120 Star", status: "accepted" },
			});
			expect(edited.category).toBe("120 Star");
			expect(edited.status).toBe("pending");

			await payload.update({
				collection: "submissions",
				id: submission.id,
				overrideAccess: false,
				user: staffUser,
				data: { status: "accepted" },
			});

			await expect(
				payload.update({
					collection: "submissions",
					id: submission.id,
					overrideAccess: false,
					user: runnerA,
					data: { category: "70 Star" },
				}),
			).rejects.toThrow(/already been reviewed/);
		});

		it("validates the estimate format", async () => {
			await expect(
				payload.create({
					collection: "submissions",
					overrideAccess: false,
					user: runnerA,
					data: { ...submissionData(openEvent.id), runner: runnerA.id, estimate: "twenty minutes" },
				}),
			).rejects.toThrow();
		});
	});

	describe("Volunteers", () => {
		it("prevents duplicate applications for the same event", async () => {
			const data = {
				event: openEvent.id,
				volunteer: runnerA.id,
				role: ["host" as const],
				status: "pending" as const,
			};
			const application = await payload.create({
				collection: "volunteers",
				overrideAccess: false,
				user: runnerA,
				data,
			});
			expect(application.title).toContain(runnerA.username);

			await expect(
				payload.create({ collection: "volunteers", overrideAccess: false, user: runnerA, data }),
			).rejects.toThrow(/already applied/);
		});

		it("rejects applications to events that are not accepting volunteers", async () => {
			await expect(
				payload.create({
					collection: "volunteers",
					overrideAccess: false,
					user: runnerB,
					data: { event: closedEvent.id, volunteer: runnerB.id, role: ["tech"], status: "pending" },
				}),
			).rejects.toThrow(/not accepting volunteers/);
		});
	});

	describe("Users", () => {
		it("rejects usernames with invalid characters", async () => {
			await expect(createUser(`bad\`name${suffix}`)).rejects.toThrow();
			await expect(createUser(`bad{name}${suffix}`)).rejects.toThrow();
		});

		it("allows tildes and hyphens anywhere", async () => {
			const user = await createUser(`ok~na-me${suffix}`);
			expect(user.username).toBe(`ok~na-me${suffix}`);
		});

		it("rejects usernames that only differ by case", async () => {
			await expect(createUser(`RUNNERA_${suffix}`.toUpperCase())).rejects.toThrow(/already taken/);
		});

		it("only populates public fields through relationships", async () => {
			const game = await payload.create({ collection: "games", data: { name: `Populate Game ${suffix}` } });
			const run = await payload.create({
				collection: "runs",
				data: {
					game: game.id,
					event: openEvent.id,
					category: "Any%",
					platform: "PC",
					estimate: "00:10:00",
					runners: [runnerA.id],
				},
				depth: 1,
			});
			const runner = run.runners?.[0] as User;
			expect(runner.username).toBe(runnerA.username);
			expect(runner.email).toBeUndefined();
			expect(runner.dateOfBirth).toBeUndefined();
		});
	});

	describe("Runs and incentives", () => {
		it("generates run titles and keeps them in sync with the game name", async () => {
			const game = await payload.create({ collection: "games", data: { name: `Title Game ${suffix}` } });
			const run = await payload.create({
				collection: "runs",
				data: { game: game.id, category: "Any%", platform: "PC", estimate: "00:30:00" },
			});
			expect(run.title).toBe(`Title Game ${suffix} — Any%`);

			await payload.update({ collection: "games", id: game.id, data: { name: `Renamed Game ${suffix}` } });
			const updated = await payload.findByID({ collection: "runs", id: run.id });
			expect(updated.title).toBe(`Renamed Game ${suffix} — Any%`);
		});

		it("derives the incentive event from the run and validates its data", async () => {
			const game = await payload.create({ collection: "games", data: { name: `Incentive Game ${suffix}` } });
			const run = await payload.create({
				collection: "runs",
				data: { game: game.id, event: openEvent.id, category: "Any%", platform: "PC", estimate: "00:30:00" },
			});

			const incentive = await payload.create({
				collection: "incentives",
				data: { title: "Name the file", type: "war", run: run.id },
			});
			expect(typeof incentive.event === "object" ? incentive.event?.id : incentive.event).toBe(openEvent.id);
			expect(incentive.data).toEqual({ options: [] });

			await expect(
				payload.create({
					collection: "incentives",
					data: { title: "Bad goal", type: "goal", run: run.id, data: { goal: "lots" } },
				}),
			).rejects.toThrow();
		});
	});

	describe("Orders", () => {
		let product: Product;

		beforeAll(async () => {
			product = await payload.create({
				collection: "products",
				data: {
					name: `Shirt ${suffix}`,
					slug: `shirt-${suffix}`,
					type: "merchandise",
					variants: [{ label: "Large", priceInCents: 3000, stock: 5 }],
				},
			});
		});

		it("snapshots product data, calculates totals and tracks stock", async () => {
			const order = await payload.create({
				collection: "orders",
				data: {
					user: runnerA.id,
					purchaseType: "bankTransfer",
					status: "pending",
					totalInCents: -1,
					items: [{ product: product.id, variantLabel: "Large", quantity: 2 }],
				},
			});

			expect(order.items[0].productName).toBe(product.name);
			expect(order.items[0].unitPriceInCents).toBe(3000);
			expect(order.totalInCents).toBe(6000);
			expect(order.reference).toMatch(/^ORD-/);

			const stockOf = async () =>
				(await payload.findByID({ collection: "products", id: product.id })).variants[0].stock;

			expect(await stockOf()).toBe(5);
			await payload.update({ collection: "orders", id: order.id, data: { status: "completed" } });
			expect(await stockOf()).toBe(3);
			await payload.update({ collection: "orders", id: order.id, data: { status: "collected" } });
			expect(await stockOf()).toBe(3);
			await payload.update({ collection: "orders", id: order.id, data: { status: "cancelled" } });
			expect(await stockOf()).toBe(5);
		});

		it("only lets users read their own orders", async () => {
			const own = await payload.find({ collection: "orders", overrideAccess: false, user: runnerA });
			const other = await payload.find({ collection: "orders", overrideAccess: false, user: runnerB });
			expect(own.totalDocs).toBeGreaterThan(0);
			expect(other.totalDocs).toBe(0);
		});
	});

	describe("Plugin collections and globals", () => {
		it("prevents regular users from editing site content", async () => {
			await expect(
				payload.create({
					collection: "redirects",
					overrideAccess: false,
					user: runnerA,
					data: { from: "/evil", to: { type: "custom", url: "https://example.com" } },
				}),
			).rejects.toThrow();

			await expect(
				payload.updateGlobal({ slug: "header", overrideAccess: false, user: runnerA, data: { navItems: [] } }),
			).rejects.toThrow();

			await expect(
				payload.find({ collection: "form-submissions", overrideAccess: false, user: runnerA }),
			).rejects.toThrow();
		});
	});
});
