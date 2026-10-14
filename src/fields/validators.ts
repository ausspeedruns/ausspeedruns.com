const ESTIMATE_REGEX = /^\d{1,3}:[0-5]\d(:[0-5]\d)?$/;
const HEX_COLOUR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const CSS_COLOUR_REGEX = /^(?:[a-zA-Z]+|(?:rgb|rgba|hsl|hsla)\([\d\s.,%/]+\))$/;
const URL_SAFE_REGEX = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

function isEmpty(value: unknown): boolean {
	return value === null || value === undefined || value === "";
}

/** Validates a duration string in `HH:MM:SS` (or `HH:MM`) format. */
export const validateEstimate = (value: unknown): true | string => {
	if (isEmpty(value)) return true;
	if (typeof value !== "string" || !ESTIMATE_REGEX.test(value.trim())) {
		return "Must be a duration in the format HH:MM:SS.";
	}
	return true;
};

/** Validates an http(s) URL. */
export const validateUrl = (value: unknown): true | string => {
	if (isEmpty(value)) return true;
	if (typeof value !== "string") return "Must be a valid URL.";
	try {
		const url = new URL(value.trim());
		if (url.protocol !== "http:" && url.protocol !== "https:") {
			return "URL must start with http:// or https://";
		}
		return true;
	} catch {
		return "Must be a valid URL.";
	}
};

/** Validates a CSS colour: hex (`#ff0000`), a named colour (`white`) or rgb()/hsl(). */
export const validateColour = (value: unknown): true | string => {
	if (isEmpty(value)) return true;
	if (typeof value !== "string" || !(HEX_COLOUR_REGEX.test(value.trim()) || CSS_COLOUR_REGEX.test(value.trim()))) {
		return "Must be a CSS colour, e.g. #CC7722 or white.";
	}
	return true;
};

/** Validates a value that will be used as a URL segment. */
export const validateUrlSafe = (value: unknown): true | string => {
	if (isEmpty(value)) return true;
	if (typeof value !== "string" || !URL_SAFE_REGEX.test(value)) {
		return "May only contain letters, numbers, hyphens and underscores, and must start with a letter or number.";
	}
	return true;
};

/** Validates that an end date is not before a start date. */
export const validateDateAfter =
	(startField: string, startLabel: string) =>
	(value: unknown, { siblingData }: { siblingData: Record<string, unknown> }): true | string => {
		const start = siblingData?.[startField];
		if (isEmpty(value) || isEmpty(start)) return true;
		if (new Date(value as string).getTime() < new Date(start as string).getTime()) {
			return `Must be after ${startLabel}.`;
		}
		return true;
	};
