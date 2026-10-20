import type { Game, Run } from "#/payload-types";

/** True for actual game runs, false for setup buffers, sleep blocks and other schedule entries. */
export function isGameRun(run: Pick<Run, "type">): boolean {
	return (run.type ?? "run") === "run";
}

/** Returns the game's display name from a (possibly unpopulated) game relationship. */
export function getGameName(game: number | Game | null | undefined): string {
	if (game && typeof game === "object") return game.name;
	return "Unknown game";
}

/** Extracts the YouTube video ID from any URL supported by getYouTubeEmbedUrl. */
export function getYouTubeVideoId(value: string | null | undefined): string | null {
	const embedUrl = getYouTubeEmbedUrl(value);
	return embedUrl ? (/\/embed\/([\w-]+)/.exec(embedUrl)?.[1] ?? null) : null;
}

/**
 * Converts a YouTube URL (watch, youtu.be, shorts, live or embed) or bare video ID into an embeddable URL.
 * Returns null if no video ID could be found.
 */
export function getYouTubeEmbedUrl(value: string | null | undefined): string | null {
	if (!value) return null;
	const trimmed = value.trim();

	if (/^[\w-]{11}$/.test(trimmed)) {
		return `https://www.youtube.com/embed/${trimmed}`;
	}

	try {
		const url = new URL(trimmed);
		const host = url.hostname.replace(/^www\.|^m\./, "");
		let id: string | null = null;
		let start = url.searchParams.get("t") ?? url.searchParams.get("start");

		if (host === "youtu.be") {
			id = url.pathname.slice(1).split("/")[0] || null;
		} else if (host === "youtube.com" || host === "youtube-nocookie.com") {
			id = url.searchParams.get("v");
			const match = /^\/(?:embed|shorts|live|v)\/([\w-]+)/.exec(url.pathname);
			if (!id && match) id = match[1];
		}

		if (!id) return null;
		start = start?.replace(/s$/, "") ?? null;
		return `https://www.youtube.com/embed/${id}${start && /^\d+$/.test(start) ? `?start=${start}` : ""}`;
	} catch {
		return null;
	}
}
