import Stripe from "stripe";

export const STRIPE_API_VERSION = "2026-09-30.endive" as const;
export const STRIPE_CURRENCY = "aud";

/** Stripe requires `expires_at` to be at least 30 minutes away; the extra minute covers clock skew. */
export const STRIPE_SESSION_TTL_SECONDS = 31 * 60;

let client: Stripe | null = null;

/** Shared Stripe client. Created lazily so builds without Stripe keys don't crash on import. */
export function getStripe(): Stripe {
	if (client) return client;

	const secretKey = process.env.STRIPE_SECRET_KEY;
	if (!secretKey) {
		throw new Error("STRIPE_SECRET_KEY is not set.");
	}

	client = new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
	return client;
}
