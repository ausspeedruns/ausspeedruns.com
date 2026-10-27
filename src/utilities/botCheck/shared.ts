/** Name of the hidden honeypot input. Humans never see it, so any value means a bot filled in the form. */
export const HONEYPOT_FIELD = "website";

/** What public forms send to their server action alongside the form values. */
export type BotCheckInput = {
	turnstileToken: string | null;
	honeypot: string;
};

/** Turnstile `action` names, shown in Cloudflare analytics and checked when verifying tokens. */
export const TURNSTILE_ACTIONS = {
	signup: "signup",
	forgotPassword: "forgot-password",
} as const;

export type TurnstileAction = (typeof TURNSTILE_ACTIONS)[keyof typeof TURNSTILE_ACTIONS];

/** Reads the honeypot value out of a submitted form element. */
export function readHoneypot(form: HTMLFormElement | null | undefined): string {
	if (!form) return "";
	const value = new FormData(form).get(HONEYPOT_FIELD);
	return typeof value === "string" ? value : "";
}
