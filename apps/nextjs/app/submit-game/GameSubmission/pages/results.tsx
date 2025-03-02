import styles from '../GameSubmission.module.scss'

import { CircularProgress, Button } from "@mui/material";
import { GameSubmitPage } from "../components/GameSubmitPage";
import { MUTATION_SUBMISSION_RESULTS } from "../submissionTypes";
import { useFormStatus } from 'react-dom';
import { RefObject } from 'react';

type SubmissionResultsProps = {
	show: boolean;
	submissionResults?: MUTATION_SUBMISSION_RESULTS["createSubmission"];
	resetForm: () => void;
	results: any;
	formRef?: RefObject<HTMLFormElement | null>; // Temporary
};

export const SubmissionResults = (props: SubmissionResultsProps) => {
	const { pending } = useFormStatus();  

	if (pending) {
		return (
			<GameSubmitPage title="Submitting" show={props.show}>
				<CircularProgress />
			</GameSubmitPage>
		);
	}

	// if (!props.submissionResults) {
	// 	return (
	// 		<GameSubmitPage title="Error :(" show={props.show}>
	// 			<h3>Error</h3>
	// 		</GameSubmitPage>
	// 	);
	// }

	
	function getInputValue(name: string) {
		return (props.formRef?.current?.querySelector(`input[name="${name}"]`) as HTMLInputElement)?.value;
	}

	const game = getInputValue("game");
	const category = getInputValue("category");

	return (
		// <GameSubmitPage title={pending ? "Submitting" : !props.submissionResults ? "Error :(" : "Complete!"} show={props.show}>
		<GameSubmitPage title={pending ? "Submitting" : "Complete!"} show={props.show}>
			<div className={styles.finalGamePage}>
				<p className={styles.game}>{game} - {category}</p>
				<hr />
				{/* <table>
					<tbody>
						<tr>
							<td>Category</td>
							<td>{props.submissionResults.category}</td>
						</tr>
						<tr>
							<td>
								Estimate
								{props.submissionResults.possibleEstimate && " between"}
							</td>
							<td>
								{props.submissionResults.possibleEstimate &&
									`${props.submissionResults.possibleEstimate} – `}
								{props.submissionResults.estimate}
							</td>
						</tr>
						<tr>
							<td>Platform</td>
							<td>
								{props.submissionResults.platform}{" "}
								<span className={styles.techPlatform}>
									{props.submissionResults.platform !== props.submissionResults.techPlatform &&
										`(Running on ${props.submissionResults.techPlatform})`}
								</span>
							</td>
						</tr>
						{props.submissionResults.race !== "no" && (
							<tr>
								<td>
									{props.submissionResults.race === "solo" && "Solo or "}
									{props.submissionResults.coop ? "Co-op" : "Race"} with
								</td>
								<td>{props.submissionResults.racer}</td>
							</tr>
						)}
						{props.submissionResults.newDonationIncentives &&
							props.submissionResults.newDonationIncentives.length > 0 && (
								<tr>
									<td>
										Donation Incentive
										{props.submissionResults.newDonationIncentives?.length > 1 && "s"}
									</td>
									<td>
										{props.submissionResults.newDonationIncentives
											.map((incentive) => incentive.title)
											.join(", ")}
									</td>
								</tr>
							)}
					</tbody>
				</table> */}
			</div>

			<Button variant="contained" fullWidth onClick={props.resetForm}>
				Submit another game?
			</Button>
		</GameSubmitPage>
	);
};
