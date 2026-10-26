"use client";

import { Checkbox } from "@mantine/core";
import { useState } from "react";
import styles from "../GameSubmission.module.css";
import RichText from "#components/RichText/RichText.tsx";
import type { UseFormReturnType } from "@mantine/form";
import type { GameSubmissionResults } from "../submissionTypes";

interface AcknowledgementProps {
	acceptingBackups: boolean;
	acceptingSubmissions: boolean;
	submissionInstructions?: any;
	form: UseFormReturnType<GameSubmissionResults>;
}

export function Acknowledgement(props: AcknowledgementProps) {
	const [backup, setBackup] = useState(true);

	return (
		<div className={styles.pageContent}>
			<div className={styles.pageHeader}>
				<h3>Review &amp; Submit</h3>
				<p>Please review the submission instructions, then submit your run.</p>
			</div>

			{props.acceptingBackups && props.acceptingSubmissions && (
				<Checkbox
					onChange={(e) => setBackup(e.currentTarget.checked)}
					checked={backup}
					name="willingBackup"
					label="Allow as backup run"
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
