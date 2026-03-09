import { Checkbox, Radio, TextInput } from "@mantine/core";
import type { GameSubmissionResults } from "../submissionTypes";
import type { UseFormReturnType } from "@mantine/form";
import type { Submission } from "#payload-types.ts";

interface RaceCoopProps {
	form: UseFormReturnType<GameSubmissionResults>;
}

export function RaceCoop(props: RaceCoopProps) {
	return (
		<>
			<Checkbox
				onChange={(e) => props.form.setFieldValue("race", e.currentTarget.checked ? "solo" : "noRace")}
				checked={props.form.values.race !== "noRace"}
				label="Submit as a race/co-op?"
			/>

			{props.form.values.race !== "noRace" && (
				<>
					<p
						style={{
							textAlign: "center",
							fontWeight: "bold",
						}}
					>
						IMPORTANT! All other runners must also submit the game.
					</p>
					<Radio.Group
						value={props.form.values.coop.toString()}
						onChange={(value) => props.form.setFieldValue("coop", value === "true")}
					>
						<Radio value="false" label="Race" />
						<Radio value="true" label="Co-op" />
					</Radio.Group>
					<Radio.Group
						label={`${props.form.values.coop ? "Co-op" : "Race"} Type`}
						value={props.form.values.race}
						onChange={(value) => props.form.setFieldValue("race", value as Submission["raceType"])}
					>
						<Radio value="solo" label="Possible to do solo" />
						<Radio value="only" label={`Only ${props.form.values.coop ? "co-op" : "race"}`} />
					</Radio.Group>
					<TextInput
						// {...racer.elementProps}
						label="Name of other runner(s)"
						autoComplete="off"
						maxLength={100}
						name="racer"
						key={props.form.key("racer")}
						{...props.form.getInputProps("racer")}
					/>
				</>
			)}
		</>
	);
}
