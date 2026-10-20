import type { DraftRow, FinaliseOptions, SubmissionStatus, SubmissionSummary } from "./types.ts";

export interface StatusChange {
	id: number;
	game: string;
	category: string;
	runnerUsername: string;
	from: SubmissionStatus;
	to: SubmissionStatus;
}

export interface FinalisePlan {
	changes: StatusChange[];
	counts: Record<SubmissionStatus, number>;
	unchanged: number;
}

/**
 * Works out the new status for every submission:
 * - linked to a scheduled run → accepted
 * - willing to backup → backup (subject to the backup rule)
 * - everything else → rejected
 */
export function planSubmissionStatuses(
	rows: DraftRow[],
	submissions: SubmissionSummary[],
	options: FinaliseOptions,
): FinalisePlan {
	const acceptedIds = new Set(rows.filter((row) => row.type === "run").flatMap((row) => row.submissionIds));
	const acceptedRunners = new Set(
		submissions
			.filter((submission) => acceptedIds.has(submission.id) && submission.runnerId)
			.map((submission) => submission.runnerId as string),
	);

	const counts: Record<SubmissionStatus, number> = { pending: 0, accepted: 0, rejected: 0, backup: 0 };
	const changes: StatusChange[] = [];
	let unchanged = 0;

	for (const submission of submissions) {
		let to: SubmissionStatus;

		if (options.skipReviewed && submission.status !== "pending" && !acceptedIds.has(submission.id)) {
			to = submission.status;
		} else if (acceptedIds.has(submission.id)) {
			to = "accepted";
		} else if (
			submission.canBackup &&
			(options.backupRule === "all" ||
				(options.backupRule === "acceptedRunnersOnly" &&
					submission.runnerId !== null &&
					acceptedRunners.has(submission.runnerId)))
		) {
			to = "backup";
		} else {
			to = "rejected";
		}

		counts[to]++;
		if (to === submission.status) {
			unchanged++;
			continue;
		}

		changes.push({
			id: submission.id,
			game: submission.game,
			category: submission.category,
			runnerUsername: submission.runnerUsername,
			from: submission.status,
			to,
		});
	}

	return { changes, counts, unchanged };
}
