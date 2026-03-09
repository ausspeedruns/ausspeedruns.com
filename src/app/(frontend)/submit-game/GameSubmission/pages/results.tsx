import styles from "../GameSubmission.module.css";

import { Loader, Button } from "@mantine/core";
import type { Submission } from "#payload-types.ts";

type SubmissionResultsProps = {
	resetForm: () => void;
	results: Submission | null;
	loading?: boolean;
};

export function SubmissionResults(props: SubmissionResultsProps) {
	if (props.loading) {
		return <Loader />;
	}

	if (!props.results) {
		return <h3>Error</h3>;
	}

	return (
		<>
			<div className={styles.finalGamePage}>
				<p className={styles.game}>
					{props.results.game} - {props.results.category}
				</p>
				<hr />
				<table>
					<tbody>
						<tr>
							<td>Category</td>
							<td>{props.results.category}</td>
						</tr>
						<tr>
							<td>
								Estimate
								{props.results.possibleEstimate && " between"}
							</td>
							<td>
								{props.results.possibleEstimate && `${props.results.possibleEstimate} – `}
								{props.results.estimate}
							</td>
						</tr>
						<tr>
							<td>Platform</td>
							<td>
								{props.results.platform}{" "}
								<span className={styles.techPlatform}>
									{props.results.platform !== props.results.techPlatform &&
										`(Running on ${props.results.techPlatform})`}
								</span>
							</td>
						</tr>
						{props.results.raceType !== "noRace" && (
							<tr>
								<td>
									{props.results.raceType === "solo" && "Solo or "}
									{props.results.isCoop ? "Co-op" : "Race"} with
								</td>
								<td>{props.results.racer}</td>
							</tr>
						)}
						{/* {props.results.donationIncentives && props.results.donationIncentives.length > 0 && (
							<tr>
								<td>
									Donation Incentive
									{props.results.donationIncentives?.length > 1 && "s"}
								</td>
								<td>
									{props.results.donationIncentives.map((incentive) => incentive.title).join(", ")}
								</td>
							</tr>
						)} */}
					</tbody>
				</table>
			</div>

			<Button variant="filled" fullWidth onClick={props.resetForm}>
				Submit another game?
			</Button>
		</>
	);
}
