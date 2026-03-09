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
			<p className={styles.header}>Current Submission</p>
			<hr />
			<p className={styles.label}>Game</p>
			<p className={styles.value}>{props.currentStep > 0 ? props.form.values.game : "\u00A0"}</p>
			<p className={styles.label}>Console</p>
			<p className={styles.value}>{props.currentStep > 0 ? props.form.values.platform : "\u00A0"}</p>
			{props.form.values.platform !== props.form.values.techPlatform && props.currentStep > 0 && (
				<>
					<p className={styles.label}>Running on</p>
					<p className={styles.value}>{props.form.values.techPlatform}</p>
				</>
			)}
			<p className={styles.label}>Category</p>
			<p className={styles.value}>{props.currentStep > 1 ? props.form.values.category : "\u00A0"}</p>
			<p className={styles.label}>Estimate</p>
			<p className={styles.value}>
				{props.currentStep > 1
					? props.form.values.possibleEstimate
						? `${props.form.values.possibleEstimate} – ${props.form.values.estimate}`
						: props.form.values.estimate
					: "\u00A0"}
			</p>
		</Paper>
	);
}
