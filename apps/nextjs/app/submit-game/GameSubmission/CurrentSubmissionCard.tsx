import { Paper } from "@mui/material";
import styles from "./CurrentSubmissionCard.module.scss";
import { DonationIncentive, RaceLiterals } from "./submissionTypes";

type CurrentSubmissionCardProps = {
	currentStep: number;
	submissionData: {
		game: string;
		platform: string;
		techPlatform: string;
		category: string;
		estimate: string;
		lowerEstimate: string;
		race: RaceLiterals;
		racer: string;
		coop: boolean;
		donationIncentives?: DonationIncentive[];
	};
};

export default function CurrentSubmissionCard(
	props: CurrentSubmissionCardProps,
) {
	return (
		<Paper variant="outlined" className={styles.data}>
			<h2 className={styles.header}>Current Submission</h2>
			<hr />
			<h3>Game</h3>
			<p>{props.currentStep > 0 ? props.submissionData.game : <br />}</p>
			<h3>Console</h3>
			<p>
				{props.currentStep > 0 ? props.submissionData.platform : <br />}
			</p>
			{props.submissionData.platform !==
				props.submissionData.techPlatform &&
				props.currentStep > 0 && (
					<>
						<h3>Running on</h3>
						<p>
							{props.currentStep > 0 ? (
								props.submissionData.techPlatform
							) : (
								<br />
							)}
						</p>
					</>
				)}
			<h3>Category</h3>
			<p>
				{props.currentStep > 1 ? props.submissionData.category : <br />}
			</p>
			<h3>Estimate</h3>
			<p>
				{props.currentStep > 1 ? (
					props.submissionData.lowerEstimate ? (
						`${props.submissionData.lowerEstimate} – ${props.submissionData.estimate}`
					) : (
						props.submissionData.estimate
					)
				) : (
					<br />
				)}
			</p>
			{props.submissionData.race !== "no" && props.currentStep > 3 && (
				<>
					<h3>
						{props.submissionData.race ===
							"solo" && "Solo or "}
						{props.submissionData.coop ? "Co-op" : "Race"} with
					</h3>
					<p>
						{props.submissionData.racer}
						<br />
					</p>
				</>
			)}
			{props.submissionData.donationIncentives &&
				props.currentStep > 1 && (
					<>
						<h3>
							Donation Incentive
							{props.submissionData.donationIncentives.length > 1
								? "s"
								: ""}
						</h3>
						{props.currentStep > 1 ? (
							props.submissionData.donationIncentives.map(
								(incentive) => {
									return <p>{incentive.title}</p>;
								},
							)
						) : (
							<br />
						)}
					</>
				)}
		</Paper>
	);
}
