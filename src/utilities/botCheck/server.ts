import "server-only";

import type { BotCheckInput, TurnstileAction } from "./shared.ts";

// Cloudflare's dummy keys: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
export const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
// Turnstile tokens are at most 2048 characters
const MAX_TOKEN_LENGTH = 2048;

const isProduction = () => process.env.NODE_ENV === "production";

/**
 * Site key for the Turnstile widget. Outside production this falls back to Cloudflare's always-pass test key;
 * in production it's null when unset, so the forms refuse to submit rather than silently skipping the check.
 */
export function getTurnstileSiteKey(): string | null {
	return process.env.TURNSTILE_SITE_KEY || (isProduction() ? null : TURNSTILE_TEST_SITE_KEY);
}

function getTurnstileSecretKey(): string | null {
	return process.env.TURNSTILE_SECRET_KEY || (isProduction() ? null : TURNSTILE_TEST_SECRET_KEY);
}

export type TurnstileFailure = "missing-token" | "not-configured" | "rejected" | "unavailable";

export type TurnstileResult = { success: true } | { success: false; reason: TurnstileFailure };

type SiteverifyResponse = {
	success?: boolean;
	action?: string;
	"error-codes"?: string[];
};

/** Checks a Turnstile token with Cloudflare. Tokens are single-use, so each form submission needs a fresh one. */
export async function verifyTurnstileToken(
	token: unknown,
	{ action, remoteIp }: { action?: TurnstileAction; remoteIp?: string | null } = {},
): Promise<TurnstileResult> {
	if (typeof token !== "string" || !token || token.length > MAX_TOKEN_LENGTH) {
		return { success: false, reason: "missing-token" };
	}

	const secret = getTurnstileSecretKey();
	if (!secret) {
		console.error("TURNSTILE_SECRET_KEY is not set; rejecting the request.");
		return { success: false, reason: "not-configured" };
	}

	const body = new URLSearchParams({ secret, response: token });
	if (remoteIp) body.set("remoteip", remoteIp);

	let result: SiteverifyResponse;
	try {
		const response = await fetch(SITEVERIFY_URL, {
			method: "POST",
			body,
			signal: AbortSignal.timeout(10_000),
		});
		if (!response.ok) throw new Error(`Turnstile siteverify returned ${response.status}`);
		result = (await response.json()) as SiteverifyResponse;
	} catch (error) {
		console.error("Unable to verify Turnstile token:", error);
		return { success: false, reason: "unavailable" };
	}

	if (!result.success) {
		return { success: false, reason: "rejected" };
	}

	// Stops a token solved on one form being replayed on another. The test secret doesn't echo real actions.
	if (action && secret !== TURNSTILE_TEST_SECRET_KEY && result.action !== action) {
		return { success: false, reason: "rejected" };
	}

	return { success: true };
}

/** Best-effort visitor IP for Turnstile, which uses it as an extra signal. */
export function getClientIp(requestHeaders: Headers): string | null {
	const cloudflareIp = requestHeaders.get("cf-connecting-ip");
	if (cloudflareIp) return cloudflareIp;
	const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
	return forwarded || requestHeaders.get("x-real-ip") || null;
}

export type BotCheckResult = { ok: true } | { ok: false; isBot: boolean; message: string };

/** Runs the honeypot and Turnstile checks for a public form submission. */
export async function checkForBots(
	input: BotCheckInput | null | undefined,
	{ action, requestHeaders }: { action: TurnstileAction; requestHeaders: Headers },
): Promise<BotCheckResult> {
	if (typeof input?.honeypot === "string" && input.honeypot.trim() !== "") {
		return { ok: false, isBot: true, message: "Unable to process your request. Please try again." };
	}

	const result = await verifyTurnstileToken(input?.turnstileToken, {
		action,
		remoteIp: getClientIp(requestHeaders),
	});
	if (result.success) return { ok: true };

	switch (result.reason) {
		case "missing-token":
			return { ok: false, isBot: false, message: "Please complete the verification check." };
		case "rejected":
			return { ok: false, isBot: false, message: "The verification check failed. Please try again." };
		default:
			return {
				ok: false,
				isBot: false,
				message: "We couldn't run the verification check right now. Please try again later.",
			};
	}
}
