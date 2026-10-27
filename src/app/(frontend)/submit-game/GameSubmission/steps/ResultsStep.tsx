import styles from "../GameSubmission.module.css";

import { Loader, Button, Alert, ThemeIcon } from "@mantine/core";
import { Archive, Check, Reload } from "pixelarticons/react";
import type { Submission } from "#payload-types.ts";

type SubmissionResultsProps = {
	resetForm: () => void;
	returnToReview: () => void;
	results: Submission | null;
	error?: string | null;
	loading?: boolean;
};

export function SubmissionResults(props: SubmissionResultsProps) {
	if (props.loading) {
		return (
			<div
				role="status"
				style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem", gap: "1rem" }}
			>
				<Loader size="lg" />
				<p style={{ color: "var(--mantine-color-dimmed)" }}>Submitting your run...</p>
			</div>
		);
	}

	if (!props.results) {
		return (
			<div className={styles.pageContent}>
				<Alert color="red" variant="light" title="Submission Error">
					{props.error ?? "Something went wrong. Please try again."}
				</Alert>
				<Button variant="light" fullWidth onClick={props.returnToReview}>
					Go back
				</Button>
			</div>
		);
	}

	return (
		<div className={styles.pageContent}>
			<div className={styles.successHeader}>
				<ThemeIcon size={56} radius="xl" color="green" variant="light">
					<Check style={{ width: 32, height: 32 }} />
				</ThemeIcon>
				<h2>Submission received!</h2>
				<p>
					<strong>{props.results.game}</strong> – {props.results.category} has been submitted.
				</p>
			</div>

			<div className={styles.optionalSection}>
				<p className={styles.fieldGroupLabel}>What happens next</p>
				<ul className={styles.nextSteps}>
					<li>Your submission is now pending review by the event team.</li>
					<li>You can view or edit it from your submissions page while it is still pending.</li>
				</ul>
			</div>

			<div className={styles.resultActions}>
				<Button variant="default" component="a" href="/account/submissions" leftSection={<Archive />}>
					View my submissions
				</Button>
				<Button onClick={props.resetForm} rightSection={<Reload />}>
					Submit another game
				</Button>
			</div>
		</div>
	);
}
