import { Card, UnstyledButton } from "@mantine/core";
import styles from "./PreviousSubmissions.module.css";
import type { Submission } from "#payload-types.ts";

interface ObjectWithProperties {
	[key: string]: any;
}

function removeDuplicates<T extends ObjectWithProperties>(arr: T[], props: Array<keyof T>): T[] {
	const seen = new Set<string>();
	return arr.filter((obj: T) => {
		const key = props.map((prop) => obj[prop]).join("|");
		if (seen.has(key)) {
			return false;
		} else {
			seen.add(key);
			return true;
		}
	});
}
export interface OldSubmission {
	game: string;
	platform: string;
	techPlatform?: string;
	ageRating: Submission["ageRating"];
}

interface PreviousSubmissionsProps {
	submissions?: OldSubmission[];
	onGameClick: (submission: OldSubmission) => void;
}

function PreviousSubmissions(props: PreviousSubmissionsProps) {
	if (!props.submissions || props.submissions.length === 0) return <></>;

	const collapseGames = removeDuplicates(props.submissions, ["game", "platform"]).slice(0, 3);

	return (
		<div className={styles.previousSubmissions}>
			<p className={styles.label}>Quick fill from previous submissions</p>
			{collapseGames.map((submission) => {
				return (
					<UnstyledButton
						key={`${submission.game}-${submission.platform}`}
						onClick={() => props.onGameClick(submission)}
						style={{ height: "100%" }}
					>
						<Card withBorder className={styles.card}>
							<span className={styles.gameName}>{submission.game}</span>
							<span className={styles.platform}>{submission.platform}</span>
						</Card>
					</UnstyledButton>
				);
			})}
		</div>
	);
}

export default PreviousSubmissions;
