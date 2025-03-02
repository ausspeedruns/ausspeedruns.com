"use client";

import { Paper } from "@mui/material";
import styles from "./CurrentSubmissionCard.module.scss";
import { DonationIncentive, RaceLiterals } from "./submissionTypes";
import { type RefObject } from "react";

type CurrentSubmissionCardProps = {
	currentStep: number;
	formRef?: RefObject<HTMLFormElement | null>;
};

export default function CurrentSubmissionCard(props: CurrentSubmissionCardProps) {
	function getInputValue(name: string) {
		return (props.formRef?.current?.querySelector(`input[name="${name}"]`) as HTMLInputElement)?.value;
	}

	const game = getInputValue("game");
	const platform = getInputValue("platform");
	const techPlatform = getInputValue("techPlatform");
	const category = getInputValue("category");
	const estimate = getInputValue("estimate");
	const possibleEstimate = getInputValue("possibleEstimate");
	const race = getInputValue("race");
	const racer = getInputValue("racer");
	const coop = getInputValue("coop") === "true";

	const donationIncentivesRaw = getInputValue("donationIncentives");
	const donationIncentives: DonationIncentive[] = donationIncentivesRaw ? JSON.parse(donationIncentivesRaw) : [];

	return (
		<Paper variant="outlined" className={styles.data}>
			<h2 className={styles.header}>Current Submission</h2>
			<hr />
			<h3>Game</h3>
			<p>{props.currentStep > 0 ? game : <br />}</p>
			<h3>Console</h3>
			<p>{props.currentStep > 0 ? platform : <br />}</p>
			{platform !== techPlatform && props.currentStep > 0 && (
				<>
					<h3>Running on</h3>
					<p>{props.currentStep > 0 ? techPlatform : <br />}</p>
				</>
			)}
			<h3>Category</h3>
			<p>{props.currentStep > 1 ? category : <br />}</p>
			<h3>Estimate</h3>
			<p>{props.currentStep > 1 ? possibleEstimate ? `${possibleEstimate} – ${estimate}` : estimate : <br />}</p>
			{race !== "no" && props.currentStep > 3 && (
				<>
					<h3>
						{race === "solo" && "Solo or "}
						{coop ? "Co-op" : "Race"} with
					</h3>
					<p>
						{racer}
						<br />
					</p>
				</>
			)}
			{donationIncentives && props.currentStep > 1 && (
				<>
					<h3>
						Donation Incentive
						{donationIncentives.length > 1 ? "s" : ""}
					</h3>
					{props.currentStep > 1 ? (
						donationIncentives.map((incentive) => {
							return <p>{incentive.title}</p>;
						})
					) : (
						<br />
					)}
				</>
			)}
		</Paper>
	);
}
