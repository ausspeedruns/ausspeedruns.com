import { tz } from "@date-fns/tz";
import { addDays, differenceInCalendarDays, format, startOfDay } from "date-fns";
import { nanoid } from "nanoid";
import Papa from "papaparse";

import { DEFAULT_SETUP_MINUTES, type RunType } from "./constants.ts";
import { estimateToMs, normaliseEstimate } from "./timing.ts";
import { normaliseRows } from "./medley.ts";
import type {
	DraftIncentive,
	DraftRow,
	DraftState,
	EventSummary,
	SegmentTypeSummary,
	SubmissionSummary,
} from "./types.ts";

export function normaliseName(value: string | null | undefined): string {
	return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function isTruthy(value: string | undefined): boolean {
	return ["true", "yes", "y", "1", "x"].includes(normaliseName(value));
}

/** Column headers for the per-day availability columns, e.g. "Sat 05 Jul". */
export function availabilityColumns(event: Pick<EventSummary, "startTime" | "endTime" | "timezone">): string[] {
	if (!event.startTime) return [];
	const options = { in: tz(event.timezone) };
	const start = startOfDay(event.startTime, options);
	const end = event.endTime ? startOfDay(event.endTime, options) : start;
	const days = Math.max(1, differenceInCalendarDays(end, start, options) + 1);
	return Array.from(
		{ length: days },
		(_, i) => `Available ${format(addDays(start, i, options), "EEE dd MMM", options)}`,
	);
}

/** Columns the importer understands. Everything else in the CSV is ignored. */
export const IMPORT_COLUMNS = {
	type: "Optional. run, medley, segment, setupBuffer, sleep or other (a segment type name/slug such as 'news' also works). Rows with the game 'Setup Buffer' or 'Sleep' are detected automatically.",
	medley: "Optional. For game runs inside a medley: the name of the medley row (its game/category) this game belongs to.",
	segmentType: "Optional. Segment type name or slug for segment rows, e.g. 'news'.",
	id: "Submission ID. Links the row to a submission (keep it from the export).",
	game: "Game name, or the label for non-run rows.",
	category: "Category, or a label for non-run rows (e.g. 'Overnight break').",
	estimate: "HH:MM:SS. For non-run rows this is the length of the block.",
	setup: "Optional. Setup minutes after this row (defaults to the event setup time for runs, 0 otherwise).",
	runner: "Runner username (only used if the row has no submission ID).",
	runnerId: "Runner user ID (only used if the row has no submission ID).",
	platform: "Platform",
	techPlatform: "Tech platform",
	raceType: "noRace, solo or only. Set to noRace to schedule a possible race as a solo run.",
	racer: "Free-text partner name(s) from the submission.",
	coop: "true/false",
	specialRequirements: "Special requirements",
	donationIncentives: 'JSON list from the export, e.g. [{"title":"..."}]',
} as const;

export function submissionsToCsv(event: EventSummary, submissions: SubmissionSummary[]): string {
	const dayColumns = availabilityColumns(event);

	const rows = submissions.map((submission) => {
		const availability = Object.fromEntries(
			dayColumns.map((column, i) => [column, submission.availability[i] ? "TRUE" : "FALSE"]),
		);

		return {
			type: "run",
			id: submission.id,
			game: submission.game,
			category: submission.category,
			estimate: submission.estimate,
			setup: "",
			medley: "",
			segmentType: "",
			runner: submission.runnerUsername,
			runnerId: submission.runnerId ?? "",
			platform: submission.platform,
			techPlatform: submission.techPlatform,
			raceType: submission.raceType,
			racer: submission.racer,
			coop: submission.isCoop ? "TRUE" : "FALSE",
			canBackup: submission.canBackup ? "TRUE" : "FALSE",
			status: submission.status,
			specialRequirements: submission.specialRequirements,
			donationIncentives:
				submission.donationIncentives.length > 0 ? JSON.stringify(submission.donationIncentives) : "",
			...availability,
		};
	});

	return Papa.unparse(rows, {
		// Submissions are user-supplied, so stop spreadsheets running values like =HYPERLINK(...) as formulas
		escapeFormulae: true,
		columns: [
			"type",
			"id",
			"game",
			"category",
			"estimate",
			"setup",
			"medley",
			"segmentType",
			"runner",
			"runnerId",
			"platform",
			"techPlatform",
			"raceType",
			"racer",
			"coop",
			"canBackup",
			"status",
			"specialRequirements",
			"donationIncentives",
			...dayColumns,
		],
	});
}

export type CsvRow = Record<string, string | undefined>;

const ESCAPED_FORMULA = /^'[=+\-@\t\r]/;

export function parseCsv(text: string): CsvRow[] {
	const result = Papa.parse<CsvRow>(text, {
		header: true,
		skipEmptyLines: "greedy",
		transformHeader: (header) => header.trim(),
		// Undo the formula escaping added by submissionsToCsv so exports round-trip
		transform: (value) => (ESCAPED_FORMULA.test(value) ? value.slice(1) : value),
	});
	return result.data;
}

const TYPE_ALIASES: Record<string, RunType> = {
	run: "run",
	setupbuffer: "setupBuffer",
	"setup buffer": "setupBuffer",
	buffer: "setupBuffer",
	setup: "setupBuffer",
	sleep: "sleep",
	overnight: "sleep",
	"sleep block": "sleep",
	other: "other",
	break: "other",
	medley: "medley",
	segment: "segment",
};

export function detectRowType(row: CsvRow): RunType {
	const explicit = TYPE_ALIASES[normaliseName(row.type)];
	if (explicit && explicit !== "run") return explicit;

	// Only infer from the game name when the row is not linked to a submission
	if (!row.id?.trim()) {
		const fromGame = TYPE_ALIASES[normaliseName(row.game)];
		if (fromGame && fromGame !== "run") return fromGame;
	}

	return explicit ?? "run";
}

function parseIncentives(value: string | undefined): SubmissionSummary["donationIncentives"] | null {
	if (!value?.trim()) return null;
	try {
		const parsed: unknown = JSON.parse(value);
		if (!Array.isArray(parsed)) return null;
		return parsed
			.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
			.map((item) => ({
				title: String(item.title ?? ""),
				description: item.description ? String(item.description) : undefined,
				time: item.time ? String(item.time) : undefined,
			}))
			.filter((item) => item.title);
	} catch {
		return null;
	}
}

export interface ImportReport {
	rowCount: number;
	runCount: number;
	unknownSubmissionIds: string[];
	duplicateSubmissionIds: number[];
	unmatchedRunners: string[];
	newGames: string[];
	invalidEstimates: { line: number; game: string; estimate: string }[];
	invalidIncentiveJson: number[];
	unknownSegmentTypes: string[];
	unknownMedleys: string[];
}

export interface ImportContext {
	submissions: SubmissionSummary[];
	users: { id: string; username: string }[];
	games: { id: number; name: string }[];
	segmentTypes?: SegmentTypeSummary[];
	defaultSetupMinutes?: number;
	/** Injectable for deterministic tests */
	makeKey?: () => string;
}

export function incentivesFromSubmission(
	submission: Pick<SubmissionSummary, "id" | "donationIncentives">,
	rowKey: string,
	makeKey: () => string = nanoid,
): DraftIncentive[] {
	return submission.donationIncentives.map((incentive) => ({
		key: makeKey(),
		rowKey,
		sourceSubmissionId: submission.id,
		status: "pending",
		title: incentive.title,
		description: [incentive.description, incentive.time ? `Time: ${incentive.time}` : ""]
			.filter(Boolean)
			.join("\n"),
		notes: "",
		type: "goal",
		data: { goal: 0, current: 0 },
	}));
}

/** Converts the organiser's CSV into draft rows, linking submissions, runners and incentives. */
export function csvRowsToDraft(csvRows: CsvRow[], context: ImportContext): DraftState & { report: ImportReport } {
	const makeKey = context.makeKey ?? nanoid;
	const submissionsById = new Map(context.submissions.map((submission) => [submission.id, submission]));
	const usersById = new Map(context.users.map((user) => [user.id, user]));
	const usersByName = new Map(context.users.map((user) => [normaliseName(user.username), user]));
	const knownGames = new Set(context.games.map((game) => normaliseName(game.name)));

	const report: ImportReport = {
		rowCount: 0,
		runCount: 0,
		unknownSubmissionIds: [],
		duplicateSubmissionIds: [],
		unmatchedRunners: [],
		newGames: [],
		invalidEstimates: [],
		invalidIncentiveJson: [],
		unknownSegmentTypes: [],
		unknownMedleys: [],
	};
	const segmentTypes = context.segmentTypes ?? [];
	const findSegmentType = (value: string | undefined) =>
		value?.trim()
			? segmentTypes.find(
					(segmentType) =>
						normaliseName(segmentType.slug) === normaliseName(value) ||
						normaliseName(segmentType.name) === normaliseName(value),
				)
			: undefined;
	const medleyKeys = new Map<string, string>();
	const seenSubmissions = new Set<number>();
	const newGames = new Set<string>();

	const rows: DraftRow[] = [];
	const incentives: DraftIncentive[] = [];

	csvRows.forEach((csv, index) => {
		const line = index + 2; // header is line 1
		if (Object.values(csv).every((value) => !value?.trim())) return;
		report.rowCount++;

		const typeSegment = TYPE_ALIASES[normaliseName(csv.type)] ? undefined : findSegmentType(csv.type);
		const type = typeSegment ? "segment" : detectRowType(csv);
		const rawId = csv.id?.trim() ?? "";
		const submissionId = rawId && /^\d+$/.test(rawId) ? Number(rawId) : null;
		const submission = submissionId !== null ? submissionsById.get(submissionId) : undefined;

		if (rawId && !submission) report.unknownSubmissionIds.push(rawId);
		if (submission) {
			if (seenSubmissions.has(submission.id)) report.duplicateSubmissionIds.push(submission.id);
			seenSubmissions.add(submission.id);
		}

		const pick = (column: string, fallback: string | undefined) => {
			const value = csv[column]?.trim();
			return value ? value : (fallback ?? "");
		};

		const key = makeKey();
		const estimate = normaliseEstimate(pick("estimate", submission?.estimate) || "00:00:00");
		const gameName = pick("game", submission?.game);

		if (estimateToMs(estimate) === null) report.invalidEstimates.push({ line, game: gameName, estimate });

		const setupRaw = csv.setup?.trim();
		const setupMinutesOverride = setupRaw && !Number.isNaN(Number(setupRaw)) ? Number(setupRaw) : null;

		if (type !== "run") {
			const isMarker = TYPE_ALIASES[normaliseName(gameName)] !== undefined;
			const category = pick("category", isMarker ? "" : gameName);
			let segmentTypeId: number | null = null;
			if (type === "segment") {
				const segmentType = typeSegment ?? findSegmentType(csv.segmentType);
				segmentTypeId = segmentType?.id ?? null;
				if (!segmentType) report.unknownSegmentTypes.push(csv.segmentType?.trim() || `line ${line}`);
			}
			if (type === "medley") {
				medleyKeys.set(normaliseName(category), key);
				if (gameName && !isMarker) medleyKeys.set(normaliseName(gameName), key);
			}
			rows.push({
				key,
				type,
				parentKey: null,
				segmentTypeId,
				submissionIds: [],
				gameName: "",
				category,
				platform: "",
				techPlatform: "",
				estimate,
				setupMinutesOverride,
				runnerIds: [],
				otherRunners: "",
				isRace: false,
				isCoop: false,
				specialRequirements: pick("specialRequirements", ""),
				pairingConfirmed: true,
				racerHint: "",
			});
			return;
		}

		report.runCount++;

		// Resolve the runner: submission > runnerId column > username column > free text
		const runnerIds: string[] = [];
		let otherRunners = "";
		if (submission?.runnerId) {
			runnerIds.push(submission.runnerId);
		} else {
			const byId = csv.runnerId?.trim() ? usersById.get(csv.runnerId.trim()) : undefined;
			const byName = usersByName.get(normaliseName(csv.runner));
			const user = byId ?? byName;
			if (user) runnerIds.push(user.id);
			else if (csv.runner?.trim()) {
				otherRunners = csv.runner.trim();
				report.unmatchedRunners.push(otherRunners);
			}
		}

		if (gameName && !knownGames.has(normaliseName(gameName))) newGames.add(gameName);

		const raceType = (pick("raceType", submission?.raceType) || "noRace") as SubmissionSummary["raceType"];
		const isRace = raceType === "solo" || raceType === "only";
		const isCoop =
			isRace && (csv.coop !== undefined && csv.coop.trim() ? isTruthy(csv.coop) : Boolean(submission?.isCoop));

		const medleyName = csv.medley?.trim();
		const parentKey = medleyName ? (medleyKeys.get(normaliseName(medleyName)) ?? null) : null;
		if (medleyName && !parentKey) report.unknownMedleys.push(medleyName);

		rows.push({
			key,
			type,
			parentKey,
			segmentTypeId: null,
			submissionIds: submission ? [submission.id] : [],
			gameName,
			category: pick("category", submission?.category),
			platform: pick("platform", submission?.platform),
			techPlatform: pick("techPlatform", submission?.techPlatform),
			estimate,
			setupMinutesOverride,
			runnerIds,
			otherRunners,
			isRace,
			isCoop,
			specialRequirements: pick("specialRequirements", submission?.specialRequirements),
			pairingConfirmed: !isRace,
			racerHint: pick("racer", submission?.racer),
			...(csv.youtube?.trim() ? { youtube: csv.youtube.trim() } : {}),
			...(csv.twitch?.trim() ? { twitch: csv.twitch.trim() } : {}),
			...(csv.time?.trim() ? { time: csv.time.trim() } : {}),
		});

		const csvIncentives = parseIncentives(csv.donationIncentives);
		if (csv.donationIncentives?.trim() && csvIncentives === null) report.invalidIncentiveJson.push(line);
		const incentiveSource = csvIncentives ?? submission?.donationIncentives ?? [];
		incentives.push(
			...incentivesFromSubmission(
				{ id: submission?.id ?? 0, donationIncentives: incentiveSource },
				key,
				makeKey,
			).map((incentive) => ({ ...incentive, sourceSubmissionId: submission?.id ?? null })),
		);
	});

	report.newGames = [...newGames];

	return {
		defaultSetupMinutes: context.defaultSetupMinutes ?? DEFAULT_SETUP_MINUTES,
		rows: normaliseRows(rows),
		incentives,
		blocks: [],
		report,
	};
}
