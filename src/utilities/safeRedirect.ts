const INTERNAL_ORIGIN = "http://internal.invalid";

// Browsers treat `\` as `/` and strip tabs/newlines, so `/\evil.com` or `/\t/evil.com` become `//evil.com`
// oxlint-disable-next-line no-control-regex
const UNSAFE_CHARACTERS = /[\\\u0000-\u001F\u007F]/;

/** Returns `value` if it is a same-origin relative path (e.g. `/account?tab=1`), otherwise `null`. */
export function toSafeRelativePath(value: string | null | undefined): string | null {
	if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
	if (UNSAFE_CHARACTERS.test(value)) return null;

	try {
		const url = new URL(value, INTERNAL_ORIGIN);
		if (url.origin !== INTERNAL_ORIGIN) return null;
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return null;
	}
}

/** Same-origin redirect target from user input, falling back to `fallback` when unsafe or missing. */
export function getSafeRedirectPath(value: string | null | undefined, fallback = "/"): string {
	return toSafeRelativePath(value) ?? fallback;
}
