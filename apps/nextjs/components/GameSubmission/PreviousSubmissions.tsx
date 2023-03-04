import { Card, CardActionArea, CardContent } from "@mui/material";
import styles from "./PreviousSubmissions.module.scss";
import { AgeRatingLiterals } from './submissionTypes';

interface ObjectWithProperties {
	[key: string]: any;
}

function removeDuplicates<T extends ObjectWithProperties>(
	arr: T[],
	props: Array<keyof T>,
): T[] {
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
interface Submission {
	game: string;
	platform: string;
	// techPlatform: string;
	ageRating: AgeRatingLiterals;
}

interface PreviousSubmissionsProps {
	submissions?: Submission[];
	onGameClick: (submission: Submission) => void;
}

function PreviousSubmissions(props: PreviousSubmissionsProps) {
	if (!props.submissions || props.submissions.length === 0) return <></>;

	const collapseGames = removeDuplicates(props.submissions, ['game', 'platform']).slice(0, 3);

	return (
		<div className={styles.previousSubmissions}>
			{collapseGames.map((submission) => {
				return (
					<Card
						variant="outlined"
						onClick={() => props.onGameClick(submission)}>
						<CardActionArea
							style={{
								height: "100%",
							}}>
							<CardContent className={styles.card}>
								<span className={styles.gameName}>
									{submission.game}
								</span>
								<span className={styles.platform}>
									{submission.platform}
								</span>
							</CardContent>
						</CardActionArea>
					</Card>
				);
			})}
		</div>
	);
}

export default PreviousSubmissions;
