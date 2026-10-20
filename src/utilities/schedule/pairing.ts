import { normaliseName } from "./csv.ts";
import type { DraftRow, SubmissionSummary } from "./types.ts";

/** Splits free text like "Alice, Bob & Carol" or "alice vs bob" into normalised names. */
export function splitRacerNames(text: string | null | undefined): string[] {
	return (text ?? "")
		.split(/,|&|\/|;|\+|\band\b|\bvs\.?(?=\s|$)|\n/i)
		.map((name) => normaliseName(name).replace(/^@/, ""))
		.filter(Boolean);
}

function mentions(text: string | null | undefined, username: string | null | undefined): boolean {
	const target = normaliseName(username);
	if (!target) return false;
	return splitRacerNames(text).some((name) => name === target);
}

function gamesMatch(a: string, b: string): boolean {
	const left = normaliseName(a);
	const right = normaliseName(b);
	if (!left || !right) return false;
	return left === right || left.includes(right) || right.includes(left);
}

export interface PartnerSuggestion {
	submission: SubmissionSummary;
	score: number;
	reasons: string[];
}

/** Ranks other race/co-op submissions that are likely the partner(s) for a row. */
export function suggestPartners(row: DraftRow, submissions: SubmissionSummary[]): PartnerSuggestion[] {
	const linked = submissions.filter((submission) => row.submissionIds.includes(submission.id));
	const linkedUsernames = linked.map((submission) => submission.runnerUsername);
	const linkedRunnerIds = new Set(row.runnerIds);
	const racerTexts = [row.racerHint, ...linked.map((submission) => submission.racer)];

	return submissions
		.filter(
			(submission) =>
				!row.submissionIds.includes(submission.id) &&
				submission.raceType !== "noRace" &&
				!(submission.runnerId !== null && linkedRunnerIds.has(submission.runnerId)) &&
				gamesMatch(submission.game, row.gameName),
		)
		.map((submission) => {
			const reasons: string[] = ["Same game, also a race/co-op submission"];
			let score = 1;

			if (racerTexts.some((text) => mentions(text, submission.runnerUsername))) {
				score += 3;
				reasons.push(`Listed as racer by ${linkedUsernames.join(", ") || "this run"}`);
			}
			if (linkedUsernames.some((username) => mentions(submission.racer, username))) {
				score += 3;
				reasons.push(`Lists ${linkedUsernames.join(", ")} as their racer`);
			}
			if (normaliseName(submission.category) === normaliseName(row.category)) {
				score += 1;
				reasons.push("Same category");
			}
			if (submission.isCoop === row.isCoop) score += 0.5;

			return { submission, score, reasons };
		})
		.sort((a, b) => b.score - a.score);
}

/** Users (without a matching submission) whose username appears in the racer text. */
export function matchRacerTextToUsers(
	row: DraftRow,
	users: { id: string; username: string }[],
): { id: string; username: string }[] {
	const names = new Set(splitRacerNames(row.racerHint));
	return users.filter((user) => names.has(normaliseName(user.username)) && !row.runnerIds.includes(user.id));
}

/** Combines special requirements from all linked submissions, labelled per runner when more than one. */
export function mergeSpecialRequirements(submissions: SubmissionSummary[]): string {
	const withReqs = submissions.filter((submission) => submission.specialRequirements.trim());
	if (withReqs.length === 0) return "";
	if (withReqs.length === 1 && submissions.length === 1) return withReqs[0].specialRequirements.trim();

	return withReqs
		.map((submission) => `${submission.runnerUsername}: ${submission.specialRequirements.trim()}`)
		.join("\n");
}

/** Submission IDs linked to more than one row (e.g. a partner's submission also imported as its own row). */
export function findDuplicateSubmissionLinks(rows: DraftRow[]): Map<number, string[]> {
	const usage = new Map<number, string[]>();
	for (const row of rows) {
		for (const id of row.submissionIds) usage.set(id, [...(usage.get(id) ?? []), row.key]);
	}
	return new Map([...usage].filter(([, keys]) => keys.length > 1));
}
