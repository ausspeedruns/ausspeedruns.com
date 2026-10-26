import styles from "../GameSubmission.module.css";

import { Loader, Button, Alert } from "@mantine/core";
import type { Submission } from "#payload-types.ts";

type SubmissionResultsProps = {
	resetForm: () => void;
	results: Submission | null;
	loading?: boolean;
};

export function SubmissionResults(props: SubmissionResultsProps) {
	if (props.loading) {
		return (
			<div
				style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem", gap: "1rem" }}
			>
				<Loader size="lg" />
				<p style={{ color: "var(--mantine-color-dimmed)" }}>Submitting your run...</p>
			</div>
		);
	}

	if (!props.results) {
		return (
			<Alert color="red" variant="light" title="Submission Error">
				Something went wrong. Please try again.
			</Alert>
		);
	}

	return (
		<div className={styles.pageContent}>
			<Alert color="green" variant="light" title="Submission Received">
				Your run has been submitted successfully!
			</Alert>

			<div className={styles.finalGamePage}>
				<p className={styles.game}>{props.results.game}</p>
				<p className={styles.category}>{props.results.category}</p>
				<table>
					<tbody>
						<tr>
							<td>Estimate</td>
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
					</tbody>
				</table>
			</div>

			<Button variant="light" fullWidth onClick={props.resetForm}>
				Submit another game
			</Button>
		</div>
	);
}
