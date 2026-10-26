"use client";

import { Autocomplete, Input, TextInput, SegmentedControl } from "@mantine/core";
import PreviousSubmissions, { type OldSubmission } from "../components/PreviousSubmissions";
import styles from "../GameSubmission.module.css";
import type { GameSubmissionResults } from "../submissionTypes";
import type { UseFormReturnType } from "@mantine/form";
import { platforms, techPlatforms } from "../platforms";

interface RunInfoProps {
	previousSubmissions: OldSubmission[];
	form: UseFormReturnType<GameSubmissionResults>;
}

export function GameInfo(props: RunInfoProps) {
	function autofillGame(submission: OldSubmission) {
		props.form.setFieldValue("game", submission.game);
		props.form.setFieldValue("ageRating", submission.ageRating);
		props.form.setFieldValue("platform", submission.platform);
		props.form.setFieldValue(
			"techPlatform",
			submission.techPlatform ? submission.techPlatform : submission.platform,
		);
	}

	return (
		<div className={styles.pageContent}>
			<div className={styles.pageHeader}>
				<h3>Game Information</h3>
				<p>Tell us about the game you want to run.</p>
			</div>

			<PreviousSubmissions submissions={props.previousSubmissions} onGameClick={autofillGame} />

			<TextInput
				label="Game Name"
				autoComplete="game"
				maxLength={100}
				required
				name="game"
				key={props.form.key("game")}
				{...props.form.getInputProps("game")}
			/>

			<div className={styles.fieldGroup}>
				<p className={styles.fieldGroupLabel}>Platform</p>
				<div className={styles.fieldRow}>
					<Autocomplete
						id="platform-field"
						data={platforms}
						label="Original Console/Platform"
						description="Used on layouts. Type your console if it's not listed."
						required
						name="platform"
						key={props.form.key("platform")}
						{...props.form.getInputProps("platform")}
					/>
					<Autocomplete
						id="tech-platform-field"
						data={techPlatforms}
						label="Running on Console/Platform"
						description="The console you will actually play on."
						required
						name="techPlatform"
						key={props.form.key("techPlatform")}
						{...props.form.getInputProps("techPlatform")}
					/>
				</div>
			</div>

			<div>
				<Input.Label required>Age Rating</Input.Label>
				<SegmentedControl
					fullWidth
					data={[
						{ label: "G, PG or M", value: "m_or_lower" },
						{ label: "MA15+", value: "ma15" },
						{ label: "RA18+", value: "r18" },
					]}
					name="ageRating"
					key={props.form.key("ageRating")}
					{...props.form.getInputProps("ageRating")}
				/>
				<Input.Description>
					If unsure, search{" "}
					<a href="https://www.classification.gov.au/" target="_blank" rel="noreferrer noopener">
						classification.gov.au
					</a>
				</Input.Description>
			</div>
		</div>
	);
}
