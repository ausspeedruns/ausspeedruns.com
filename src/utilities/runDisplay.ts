import type { Where } from "payload";

import type { Game, Run } from "#/payload-types";

/** True for actual game runs, false for medleys, segments, setup buffers, sleep blocks and other entries. */
export function isGameRun(run: Pick<Run, "type">): boolean {
	return (run.type ?? "run") === "run";
}

/** True for entries that sit inside a medley rather than on the main schedule. */
export function isMedleyChild(run: Pick<Run, "parent">): boolean {
	return run.parent !== null && run.parent !== undefined;
}

/**
 * True for entries that count as "a run" for stats, profiles, game pages and VODs:
 * top-level game runs and medleys (a medley counts once; its games don't).
 */
export function isCountedRun(run: Pick<Run, "type" | "parent">): boolean {
	const type = run.type ?? "run";
	return (type === "run" || type === "medley") && !isMedleyChild(run);
}

/** Entries on the main schedule (excludes games inside a medley). */
export const topLevelRunsWhere: Where = { parent: { exists: false } };

/** Database equivalent of `isCountedRun`. */
export const countedRunsWhere: Where = {
	and: [topLevelRunsWhere, { or: [{ type: { in: ["run", "medley"] } }, { type: { exists: false } }] }],
};

/** Returns the game's display name from a (possibly unpopulated) game relationship. */
export function getGameName(game: number | Game | null | undefined): string {
	if (game && typeof game === "object") return game.name;
	return "Unknown game";
}

/** Game name for runs, the medley name for medleys, and the title for everything else. */
export function getRunDisplayName(run: Pick<Run, "type" | "game" | "category" | "title">): string {
	const type = run.type ?? "run";
	if (type === "run") return getGameName(run.game);
	if (type === "medley") return run.category || run.title || "Medley";
	return run.title || run.category || "Intermission";
}

/** Category for runs; medleys use their category as the name, so they're labelled "Medley" instead. */
export function getRunCategoryLabel(run: Pick<Run, "type" | "category">): string {
	return run.type === "medley" ? "Medley" : (run.category ?? "");
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
