// @vitest-environment node
import { getPayload, type Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import config from "#/payload.config";
import type { Event, User } from "#/payload-types";
import { findCanonicalCase } from "#/utilities/caseInsensitive";

let payload: Payload;
let user: User;
let event: Event;

const suffix = Date.now().toString(36);
const mixedCaseEmail = `Mixed.Case_${suffix}@Example.COM`;
const shortName = `CaseTest${suffix}`;

describe("Case insensitivity", () => {
	beforeAll(async () => {
		payload = await getPayload({ config: await config });

		user = await payload.create({
			collection: "users",
			disableVerificationEmail: true,
			data: {
				username: `CaseUser_${suffix}`,
				email: mixedCaseEmail,
				password: "password123",
				dateOfBirth: "1990-01-01T00:00:00.000Z",
				_verified: true,
			},
		});

		event = await payload.create({
			collection: "events",
			draft: false,
			data: {
				_status: "published",
				name: "Case Test Event",
				shortName,
				timeSettings: { timezone: "Australia/Melbourne" },
			},
		});
	});

	afterAll(async () => {
		if (event) await payload.delete({ collection: "events", id: event.id });
		if (user) await payload.delete({ collection: "users", id: user.id });
		await payload?.destroy();
	});

	describe("Email auth", () => {
		it("stores emails lowercased", () => {
			expect(user.email).toBe(mixedCaseEmail.toLowerCase());
		});

		it("logs in regardless of email casing", async () => {
			for (const email of [mixedCaseEmail, mixedCaseEmail.toUpperCase(), ` ${mixedCaseEmail.toLowerCase()} `]) {
				const result = await payload.login({ collection: "users", data: { email, password: "password123" } });
				expect(result.user?.id).toBe(user.id);
			}
		});

		it("sends password resets regardless of email casing", async () => {
			const token = await payload.forgotPassword({
				collection: "users",
				data: { email: mixedCaseEmail.toUpperCase() },
				disableEmail: true,
			});
			expect(token).toBeTruthy();
		});

		it("rejects a new account whose email only differs by case", async () => {
			await expect(
				payload.create({
					collection: "users",
					disableVerificationEmail: true,
					data: {
						username: `CaseUser2_${suffix}`,
						email: mixedCaseEmail.toUpperCase(),
						password: "password123",
						dateOfBirth: "1990-01-01T00:00:00.000Z",
					},
				}),
			).rejects.toThrow();
		});
	});

	describe("findCanonicalCase", () => {
		it("returns the stored casing for a differently-cased value", async () => {
			const canonical = await findCanonicalCase({
				payload,
				collection: "events",
				field: "shortName",
				value: shortName.toLowerCase(),
			});
			expect(canonical).toBe(shortName);
		});

		it("returns the exact value when it matches", async () => {
			const canonical = await findCanonicalCase({
				payload,
				collection: "events",
				field: "shortName",
				value: shortName,
			});
			expect(canonical).toBe(shortName);
		});

		it("ignores partial matches", async () => {
			const canonical = await findCanonicalCase({
				payload,
				collection: "events",
				field: "shortName",
				value: shortName.slice(0, -1).toLowerCase(),
			});
			expect(canonical).toBeNull();
		});

		it("returns null when nothing matches", async () => {
			const canonical = await findCanonicalCase({
				payload,
				collection: "users",
				field: "username",
				value: `nobody_${suffix}`,
			});
			expect(canonical).toBeNull();
		});
	});

	describe("Event short names", () => {
		it("rejects a short name that only differs by case", async () => {
			await expect(
				payload.create({
					collection: "events",
					draft: false,
					data: {
						_status: "published",
						name: "Duplicate Case Event",
						shortName: shortName.toUpperCase(),
						timeSettings: { timezone: "Australia/Melbourne" },
					},
				}),
			).rejects.toThrow(/already exists/);
		});

		it("still allows saving the event with its own short name", async () => {
			const updated = await payload.update({
				collection: "events",
				id: event.id,
				data: { name: "Case Test Event (renamed)", shortName },
			});
			expect(updated.shortName).toBe(shortName);
		});
	});
});
