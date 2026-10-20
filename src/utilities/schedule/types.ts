import type { Goal, War } from "./incentives.ts";
import type { RunType } from "./constants.ts";

export type DraftRowType = RunType;

/** A single entry in the schedule draft. Scheduled times are derived from row order, never stored. */
export interface DraftRow {
	key: string;
	type: DraftRowType;
	/** Linked submissions. The first is the "primary" one the row was imported from. */
	submissionIds: number[];
	gameName: string;
	category: string;
	platform: string;
	techPlatform: string;
	/** HH:MM:SS */
	estimate: string;
	/** Minutes of setup after this row. Falls back to the draft default for runs, and 0 otherwise. */
	setupMinutesOverride: number | null;
	runnerIds: string[];
	/** Comma-separated runners without accounts */
	otherRunners: string;
	isRace: boolean;
	isCoop: boolean;
	specialRequirements: string;
	/** True once the organiser has confirmed the race/co-op runners */
	pairingConfirmed: boolean;
	/** Free-text racer name(s) from the submission, used to suggest partners */
	racerHint: string;
	youtube?: string;
	twitch?: string;
	time?: string;
	/** Key of the medley row this game belongs to. Children always directly follow their medley. */
	parentKey?: string | null;
	/** Segment type ID for `segment` rows */
	segmentTypeId?: number | null;
}

export interface SegmentTypeSummary {
	id: number;
	name: string;
	slug: string;
	colour: string | null;
}

export type IncentiveStatus = "pending" | "configured" | "skipped";

export interface DraftIncentive {
	key: string;
	rowKey: string;
	/** Submission the incentive was suggested from (null for custom incentives) */
	sourceSubmissionId: number | null;
	status: IncentiveStatus;
	title: string;
	description: string;
	notes: string;
	type: "goal" | "war";
	data: Goal | War;
}

export interface AppliedMap {
	runs: Record<string, number>;
	incentives: Record<string, number>;
}

export interface DraftState {
	defaultSetupMinutes: number;
	rows: DraftRow[];
	incentives: DraftIncentive[];
}

export type SubmissionStatus = "pending" | "accepted" | "rejected" | "backup";

/** Submission info the client needs to render pairing/incentive/availability helpers. */
export interface SubmissionSummary {
	id: number;
	runnerId: string | null;
	runnerUsername: string;
	game: string;
	category: string;
	platform: string;
	techPlatform: string;
	estimate: string;
	raceType: "noRace" | "solo" | "only";
	racer: string;
	isCoop: boolean;
	canBackup: boolean;
	status: SubmissionStatus;
	specialRequirements: string;
	availability: boolean[];
	donationIncentives: { title: string; time?: string; description?: string }[];
}

export interface EventSummary {
	id: number;
	name: string;
	shortName: string;
	startTime: string | null;
	endTime: string | null;
	timezone: string;
}

export interface DraftMeta {
	id: number | null;
	status: "draft" | "applied";
	appliedAt: string | null;
	finalisedAt: string | null;
	updatedAt: string | null;
	/** True if live runs were modified after the last apply */
	liveRunsChanged: boolean;
	appliedRunCount: number;
}

export interface DraftResponse {
	event: EventSummary;
	draft: DraftMeta & DraftState;
	submissions: SubmissionSummary[];
	users: { id: string; username: string }[];
	games: { id: number; name: string }[];
	segmentTypes: SegmentTypeSummary[];
}

export interface ApplyResult {
	created: number;
	updated: number;
	deleted: number;
	incentives: { created: number; updated: number; deleted: number };
	gamesCreated: string[];
	endTime: string | null;
}

export type BackupRule = "all" | "acceptedRunnersOnly" | "none";

export interface FinaliseOptions {
	backupRule: BackupRule;
	/** Leave submissions that are no longer pending untouched */
	skipReviewed: boolean;
}
