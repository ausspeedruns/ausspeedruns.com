import { useMemo } from "react";
import { Card, UnstyledButton } from "@mantine/core";
import styles from "./PreviousSubmissions.module.css";
import type { Submission } from "#payload-types.ts";

export interface OldSubmission {
	game: string;
	platform: string;
	techPlatform?: string;
	ageRating: Submission["ageRating"];
}

interface PreviousSubmissionsProps {
	submissions?: OldSubmission[];
	selected?: { game: string; platform: string };
	onGameClick: (submission: OldSubmission) => void;
}

function submissionKey(submission: { game: string; platform: string }) {
	return `${submission.game.trim().toLowerCase()}|${submission.platform.trim().toLowerCase()}`;
}

/** Keeps the first (newest) submission of each game + platform combination. */
function uniqueGames(submissions: OldSubmission[]): OldSubmission[] {
	const seen = new Set<string>();
	return submissions.filter((submission) => {
		const key = submissionKey(submission);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function PreviousSubmissions(props: PreviousSubmissionsProps) {
	const games = useMemo(() => uniqueGames(props.submissions ?? []), [props.submissions]);

	if (games.length === 0) return null;

	const selectedKey = props.selected ? submissionKey(props.selected) : null;

	return (
		<div className={styles.previousSubmissions}>
			<p className={styles.label}>Quick fill from previous submissions ({games.length})</p>
			<div className={styles.row}>
				{games.map((submission) => {
					const key = submissionKey(submission);
					const isSelected = key === selectedKey;
					const showTechPlatform = submission.techPlatform && submission.techPlatform !== submission.platform;

					return (
						<UnstyledButton
							key={key}
							className={styles.item}
							aria-pressed={isSelected}
							onClick={() => props.onGameClick(submission)}
						>
							<Card withBorder className={styles.card} data-selected={isSelected || undefined}>
								<span className={styles.gameName} title={submission.game}>
									{submission.game}
								</span>
								<span className={styles.platform}>
									{submission.platform}
									{showTechPlatform && ` (on ${submission.techPlatform})`}
								</span>
							</Card>
						</UnstyledButton>
					);
				})}
			</div>
		</div>
	);
}

export default PreviousSubmissions;
