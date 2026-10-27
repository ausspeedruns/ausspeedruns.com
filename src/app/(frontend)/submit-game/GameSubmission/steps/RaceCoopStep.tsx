import { Alert, Checkbox, Radio, TextInput } from "@mantine/core";
import styles from "../GameSubmission.module.css";
import type { GameSubmissionResults } from "../submissionTypes";
import type { UseFormReturnType } from "@mantine/form";
import type { Submission } from "#payload-types.ts";

interface RaceCoopProps {
	form: UseFormReturnType<GameSubmissionResults>;
}

export function RaceCoop(props: RaceCoopProps) {
	return (
		<div className={styles.pageContent}>
			<div className={styles.pageHeader}>
				<h2>Race / Co-op</h2>
				<p>Optionally submit this run as a race or co-op.</p>
			</div>

			<Checkbox
				onChange={(e) => props.form.setFieldValue("race", e.currentTarget.checked ? "solo" : "noRace")}
				checked={props.form.values.race !== "noRace"}
				label="Submit as a race or co-op"
			/>

			{props.form.values.race !== "noRace" && (
				<div className={styles.optionalSection}>
					<div className={styles.fieldGroup}>
						<Alert variant="light" color="orange">
							All other runners must also submit the game separately.
						</Alert>
						<Radio.Group
							label="Race or co-op"
							value={props.form.values.coop.toString()}
							onChange={(value) => props.form.setFieldValue("coop", value === "true")}
						>
							<div style={{ display: "flex", gap: "1rem" }}>
								<Radio value="false" label="Race" />
								<Radio value="true" label="Co-op" />
							</div>
						</Radio.Group>
						<Radio.Group
							label={`${props.form.values.coop ? "Co-op" : "Race"} Type`}
							value={props.form.values.race}
							onChange={(value) => props.form.setFieldValue("race", value as Submission["raceType"])}
						>
							<div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
								<Radio value="solo" label="Possible to do solo" />
								<Radio value="only" label={`Only ${props.form.values.coop ? "co-op" : "race"}`} />
							</div>
						</Radio.Group>
						<TextInput
							label="Name of other runner(s)"
							autoComplete="off"
							maxLength={100}
							required
							name="racer"
							key={props.form.key("racer")}
							{...props.form.getInputProps("racer")}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
