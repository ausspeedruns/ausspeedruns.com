// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const {
	checkForBots,
	getClientIp,
	getTurnstileSiteKey,
	TURNSTILE_TEST_SECRET_KEY,
	TURNSTILE_TEST_SITE_KEY,
	verifyTurnstileToken,
} = await import("#/utilities/botCheck/server");

const siteverify = (body: Record<string, unknown>, status = 200) =>
	vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(JSON.stringify(body), { status }));

describe("Turnstile bot check", () => {
	beforeEach(() => {
		vi.stubEnv("TURNSTILE_SITE_KEY", "");
		vi.stubEnv("TURNSTILE_SECRET_KEY", "");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	it("falls back to Cloudflare's test keys outside production", async () => {
		expect(getTurnstileSiteKey()).toBe(TURNSTILE_TEST_SITE_KEY);

		const fetchMock = siteverify({ success: true });
		vi.stubGlobal("fetch", fetchMock);
		await expect(verifyTurnstileToken("token", { remoteIp: "203.0.113.1" })).resolves.toEqual({ success: true });

		const body = fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams;
		expect(body.get("secret")).toBe(TURNSTILE_TEST_SECRET_KEY);
		expect(body.get("response")).toBe("token");
		expect(body.get("remoteip")).toBe("203.0.113.1");
	});

	it("fails closed in production when the keys aren't set", async () => {
		vi.stubEnv("NODE_ENV", "production");
		const fetchMock = siteverify({ success: true });
		vi.stubGlobal("fetch", fetchMock);
		vi.spyOn(console, "error").mockImplementation(() => {});

		expect(getTurnstileSiteKey()).toBeNull();
		await expect(verifyTurnstileToken("token")).resolves.toEqual({ success: false, reason: "not-configured" });
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("uses the configured keys", async () => {
		vi.stubEnv("TURNSTILE_SITE_KEY", "real-site-key");
		vi.stubEnv("TURNSTILE_SECRET_KEY", "real-secret");
		const fetchMock = siteverify({ success: true, action: "signup" });
		vi.stubGlobal("fetch", fetchMock);

		expect(getTurnstileSiteKey()).toBe("real-site-key");
		await expect(verifyTurnstileToken("token", { action: "signup" })).resolves.toEqual({ success: true });
		const body = fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams;
		expect(body.get("secret")).toBe("real-secret");
	});

	it("rejects tokens solved for a different form", async () => {
		vi.stubEnv("TURNSTILE_SECRET_KEY", "real-secret");
		vi.stubGlobal("fetch", siteverify({ success: true, action: "forgot-password" }));

		await expect(verifyTurnstileToken("token", { action: "signup" })).resolves.toEqual({
			success: false,
			reason: "rejected",
		});
	});

	it("rejects missing or failed tokens", async () => {
		const fetchMock = siteverify({ success: false, "error-codes": ["invalid-input-response"] });
		vi.stubGlobal("fetch", fetchMock);

		await expect(verifyTurnstileToken(null)).resolves.toEqual({ success: false, reason: "missing-token" });
		await expect(verifyTurnstileToken("x".repeat(2049))).resolves.toEqual({
			success: false,
			reason: "missing-token",
		});
		expect(fetchMock).not.toHaveBeenCalled();

		await expect(verifyTurnstileToken("token")).resolves.toEqual({ success: false, reason: "rejected" });
	});

	it("reports Cloudflare being unreachable", async () => {
		vi.stubGlobal("fetch", siteverify({}, 500));
		vi.spyOn(console, "error").mockImplementation(() => {});

		await expect(verifyTurnstileToken("token")).resolves.toEqual({ success: false, reason: "unavailable" });
	});

	it("rejects filled-in honeypots without calling Cloudflare", async () => {
		const fetchMock = siteverify({ success: true });
		vi.stubGlobal("fetch", fetchMock);

		const result = await checkForBots(
			{ turnstileToken: "token", honeypot: "https://spam.example" },
			{ action: "signup", requestHeaders: new Headers() },
		);
		expect(result).toMatchObject({ ok: false, isBot: true });
		expect(fetchMock).not.toHaveBeenCalled();

		await expect(
			checkForBots({ turnstileToken: "token", honeypot: "" }, { action: "signup", requestHeaders: new Headers() }),
		).resolves.toEqual({ ok: true });
	});

	it("asks people to complete the check when there's no token", async () => {
		await expect(
			checkForBots({ turnstileToken: null, honeypot: "" }, { action: "signup", requestHeaders: new Headers() }),
		).resolves.toEqual({ ok: false, isBot: false, message: "Please complete the verification check." });
	});

	it("reads the visitor IP from proxy headers", () => {
		expect(getClientIp(new Headers({ "cf-connecting-ip": "198.51.100.7", "x-forwarded-for": "10.0.0.1" }))).toBe(
			"198.51.100.7",
		);
		expect(getClientIp(new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }))).toBe("203.0.113.5");
		expect(getClientIp(new Headers())).toBeNull();
	});
});
