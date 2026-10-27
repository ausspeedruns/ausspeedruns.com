"use client";

import { Button, Checkbox } from "@mantine/core";
import { raceSummary } from "../components/CurrentSubmissionCard";
import styles from "../GameSubmission.module.css";
import RichText from "#components/RichText/RichText.tsx";
import type { UseFormReturnType } from "@mantine/form";
import type { GameSubmissionResults } from "../submissionTypes";
import type { Event } from "#payload-types.ts";

interface AcknowledgementProps {
	acceptingBackups: boolean;
	acceptingSubmissions: boolean;
	submissionInstructions?: Event["submissionInstructions"];
	eventDays: number;
	onEditStep: (step: number) => void;
	form: UseFormReturnType<GameSubmissionResults>;
}

export function Acknowledgement(props: AcknowledgementProps) {
	const values = props.form.values;
	const daysAvailable = values.availability.slice(0, props.eventDays).filter(Boolean).length;
	const incentives = values.donationIncentives?.length ?? 0;

	const estimate = values.possibleEstimate
		? `${values.estimate} (could be ${values.possibleEstimate})`
		: values.estimate;

	const review = [
		{
			step: 0,
			label: "Game",
			value: `${values.game} on ${values.platform}${values.techPlatform !== values.platform ? ` (running on ${values.techPlatform})` : ""}`,
		},
		{
			step: 1,
			label: "Speedrun",
			value: `${values.category} · ${estimate}${incentives > 0 ? ` · ${incentives} incentive${incentives === 1 ? "" : "s"}` : ""}`,
		},
		{
			step: 2,
			label: "Availability",
			value: props.eventDays === 0 ? "Event dates TBA" : `${daysAvailable} of ${props.eventDays} days`,
		},
		{
			step: 3,
			label: "Race/Co-op",
			value: values.race === "noRace" ? "No" : `${raceSummary(values)} with ${values.racer}`,
		},
	];

	return (
		<div className={styles.pageContent}>
			<div className={styles.pageHeader}>
				<h3>Review &amp; Submit</h3>
				<p>Check your details and the submission instructions, then submit your run.</p>
			</div>

			<dl className={styles.reviewList}>
				{review.map((item) => (
					<div key={item.label} className={styles.reviewItem}>
						<dt>{item.label}</dt>
						<dd>{item.value}</dd>
						<Button variant="subtle" size="compact-sm" onClick={() => props.onEditStep(item.step)}>
							Edit
						</Button>
					</div>
				))}
			</dl>

			{props.acceptingBackups && props.acceptingSubmissions && (
				<Checkbox
					onChange={(e) => props.form.setFieldValue("backup", e.currentTarget.checked)}
					checked={values.backup}
					name="willingBackup"
					label="Allow as backup run"
					description="If your run isn't picked for the main schedule, it may still be used as a backup."
				/>
			)}
			{props.submissionInstructions && (
				<div className={styles.optionalSection}>
					<RichText data={props.submissionInstructions} enableGutter={false} />
				</div>
			)}
		</div>
	);
}
