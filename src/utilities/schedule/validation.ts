import { validateIncentiveData } from "./incentives.ts";
import { findDuplicateSubmissionLinks } from "./pairing.ts";
import { computeSchedule, eventDayIndex, estimateToMs, msToEstimate, scheduleEnd } from "./timing.ts";
import type { DraftState, EventSummary, SubmissionSummary } from "./types.ts";

export type IssueLevel = "error" | "warning";

export interface ScheduleIssue {
	level: IssueLevel;
	message: string;
	rowKey?: string;
	incentiveKey?: string;
	step: "import" | "timing" | "incentives" | "pairing" | "apply";
}

/** Errors block applying the schedule; warnings are shown but can be ignored. */
export function validateDraft(
	draft: DraftState,
	event: EventSummary,
	submissions: SubmissionSummary[],
): ScheduleIssue[] {
	const issues: ScheduleIssue[] = [];
	const submissionsById = new Map(submissions.map((submission) => [submission.id, submission]));

	if (!event.startTime) {
		issues.push({ level: "error", step: "timing", message: "The event has no start time set." });
	}

	if (draft.rows.length === 0) {
		issues.push({ level: "error", step: "import", message: "The schedule is empty. Import a CSV first." });
	}

	const timed = event.startTime ? computeSchedule(draft.rows, event.startTime, draft.defaultSetupMinutes) : [];

	const rowsByKey = new Map(draft.rows.map((row) => [row.key, row]));
	const topLevelRows = draft.rows.filter((row) => !row.parentKey);

	draft.rows.forEach((row, index) => {
		const label =
			row.type === "run"
				? `${row.gameName || "Untitled"} (row ${index + 1})`
				: row.type === "medley"
					? `${row.category || "Untitled medley"} (row ${index + 1})`
					: `Row ${index + 1}`;

		if (estimateToMs(row.estimate) === null) {
			issues.push({
				level: "error",
				step: "timing",
				rowKey: row.key,
				message: `${label}: estimate "${row.estimate}" is not HH:MM:SS.`,
			});
		}

		if (row.parentKey) {
			const parent = rowsByKey.get(row.parentKey);
			if (row.type !== "run" || parent?.type !== "medley" || parent.parentKey) {
				issues.push({
					level: "error",
					step: "timing",
					rowKey: row.key,
					message: `${label}: only game runs can be inside a medley.`,
				});
			}
		}

		if (row.type === "segment" && !row.segmentTypeId) {
			issues.push({ level: "error", step: "timing", rowKey: row.key, message: `${label}: choose a segment type.` });
		}

		if (row.type === "medley") {
			if (!row.category.trim()) {
				issues.push({ level: "error", step: "timing", rowKey: row.key, message: `${label}: missing medley name.` });
			}
			const children = draft.rows.filter((candidate) => candidate.parentKey === row.key);
			if (children.length === 0) {
				issues.push({ level: "warning", step: "timing", rowKey: row.key, message: `${label}: has no games.` });
			}
			const slotMs = estimateToMs(row.estimate);
			const childrenMs = children.reduce((total, child) => total + (estimateToMs(child.estimate) ?? 0), 0);
			if (slotMs !== null && childrenMs > slotMs) {
				issues.push({
					level: "warning",
					step: "timing",
					rowKey: row.key,
					message: `${label}: its games' estimates (${msToEstimate(childrenMs)}) are longer than the medley (${msToEstimate(slotMs)}).`,
				});
			}
		}

		if (row.type !== "run") return;

		if (!row.gameName.trim()) {
			issues.push({ level: "error", step: "timing", rowKey: row.key, message: `${label}: missing game.` });
		}
		if (!row.category.trim()) {
			issues.push({ level: "error", step: "timing", rowKey: row.key, message: `${label}: missing category.` });
		}
		if (!row.platform.trim()) {
			issues.push({ level: "error", step: "timing", rowKey: row.key, message: `${label}: missing platform.` });
		}
		if (row.runnerIds.length === 0 && !row.otherRunners.trim()) {
			issues.push({ level: "warning", step: "timing", rowKey: row.key, message: `${label}: has no runners.` });
		}
		if (row.submissionIds.length === 0) {
			issues.push({
				level: "warning",
				step: "import",
				rowKey: row.key,
				message: `${label}: not linked to a submission, so no submission will be accepted for it.`,
			});
		}
		if (row.isRace && !row.pairingConfirmed) {
			issues.push({
				level: "warning",
				step: "pairing",
				rowKey: row.key,
				message: `${label}: race/co-op runners have not been confirmed.`,
			});
		}

		// Availability: every linked submission's runner must be available on the run's day
		const time = timed[index];
		if (time && event.startTime) {
			const day = eventDayIndex(time.start, event.startTime, event.timezone);
			for (const submissionId of row.submissionIds) {
				const submission = submissionsById.get(submissionId);
				if (!submission || submission.availability.length === 0) continue;
				if (submission.availability[day] === false || submission.availability[day] === undefined) {
					issues.push({
						level: "warning",
						step: "timing",
						rowKey: row.key,
						message: `${label}: ${submission.runnerUsername} did not mark themselves available on day ${day + 1}.`,
					});
				}
			}
		}

		// Same runner in consecutive runs (medley games share a slot, so they're skipped)
		if (row.parentKey) return;
		const topIndex = topLevelRows.indexOf(row);
		const previous = topIndex > 0 ? topLevelRows[topIndex - 1] : undefined;
		const repeated = previous?.type === "run" ? previous.runnerIds.filter((id) => row.runnerIds.includes(id)) : [];
		if (previous && repeated.length > 0) {
			issues.push({
				level: "warning",
				step: "timing",
				rowKey: row.key,
				message: `${label}: same runner as the previous run (back-to-back).`,
			});
		}
	});

	for (const [submissionId] of findDuplicateSubmissionLinks(draft.rows)) {
		const submission = submissionsById.get(submissionId);
		issues.push({
			level: "warning",
			step: "pairing",
			message: `Submission ${submission ? `${submission.game} by ${submission.runnerUsername}` : submissionId} is linked to more than one row.`,
		});
	}

	const rowKeys = new Set(draft.rows.map((row) => row.key));
	for (const incentive of draft.incentives) {
		if (!rowKeys.has(incentive.rowKey)) continue;
		if (incentive.status === "pending") {
			issues.push({
				level: "warning",
				step: "incentives",
				incentiveKey: incentive.key,
				message: `Incentive "${incentive.title || "Untitled"}" has not been configured or skipped.`,
			});
		}
		if (incentive.status === "configured") {
			const result = validateIncentiveData(incentive.data, incentive.type);
			if (!incentive.title.trim()) {
				issues.push({
					level: "error",
					step: "incentives",
					incentiveKey: incentive.key,
					message: "An incentive is missing a title.",
				});
			}
			if (result !== true) {
				issues.push({
					level: "error",
					step: "incentives",
					incentiveKey: incentive.key,
					message: `Incentive "${incentive.title}": ${result}`,
				});
			}
		}
	}

	const end = scheduleEnd(timed);
	if (end && event.endTime && end.getTime() > new Date(event.endTime).getTime()) {
		issues.push({
			level: "warning",
			step: "timing",
			message: "The schedule ends after the event's current end time (it will be updated on apply).",
		});
	}

	return issues;
}
