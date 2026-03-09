"use client";

import { Paper } from "@mantine/core";
import styles from "./CurrentSubmissionCard.module.css";
import type { GameSubmissionResults } from "../submissionTypes";
import type { UseFormReturnType } from "@mantine/form";

type CurrentSubmissionCardProps = {
	currentStep: number;
	form: UseFormReturnType<GameSubmissionResults>;
};

export default function CurrentSubmissionCard(props: CurrentSubmissionCardProps) {
	return (
		<Paper withBorder className={styles.data}>
			<h2 className={styles.header}>Current Submission</h2>
			<hr />
			<h3>Game</h3>
			<p>{props.currentStep > 0 ? props.form.values.game : <br />}</p>
			<h3>Console</h3>
			<p>{props.currentStep > 0 ? props.form.values.platform : <br />}</p>
			{props.form.values.platform !== props.form.values.techPlatform && props.currentStep > 0 && (
				<>
					<h3>Running on</h3>
					<p>{props.currentStep > 0 ? props.form.values.techPlatform : <br />}</p>
				</>
			)}
			<h3>Category</h3>
			<p>{props.currentStep > 1 ? props.form.values.category : <br />}</p>
			<h3>Estimate</h3>
			<p>
				{props.currentStep > 1 ? (
					props.form.values.possibleEstimate ? (
						`${props.form.values.possibleEstimate} – ${props.form.values.estimate}`
					) : (
						`${props.form.values.estimate}`
					)
				) : (
					<br />
				)}
			</p>
			{/* {props.form.values.race !== "no" && props.currentStep > 3 && (
				<>
					<h3>
						{props.form.values.race === "solo" && "Solo or "}
						{props.form.values.coop ? "Co-op" : "Race"} with
					</h3>
					<p>
						{props.form.values.racer}
						<br />
					</p>
				</>
			)}
			{props.form.values.donationIncentives && props.currentStep > 1 && (
				<>
					<h3>
						Donation Incentive
						{props.form.values.donationIncentives.length > 1 ? "s" : ""}
					</h3>
					{props.currentStep > 1 ? (
						props.form.values.donationIncentives.map((incentive) => {
							return <p>{incentive.title}</p>;
						})
					) : (
						<br />
					)}
				</>
			)} */}
		</Paper>
	);
}
