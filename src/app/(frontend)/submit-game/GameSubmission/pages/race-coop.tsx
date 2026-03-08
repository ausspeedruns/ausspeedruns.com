import { Checkbox, Radio, TextInput } from "@mantine/core";
import { GameSubmitPage } from "../components/GameSubmitPage";
import type { RaceLiterals, SubmissionPageRef } from "../submissionTypes";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
// import useFormInput from "../../../../hooks/useFormInput";

type RaceCoopProps = {
	show: boolean;
	onComplete: (isComplete: boolean) => void;
};

export const RaceCoop = forwardRef<SubmissionPageRef, RaceCoopProps>((props, ref) => {
	const [race, setRace] = useState<RaceLiterals>("no");
	const [coop, setCoop] = useState(false);
	// const racer = useFormInput("");

	useImperativeHandle(ref, () => ({
		reset: () => {
			setRace("no");
			setCoop(false);
			// racer.reset();
		},
	}));

	// useEffect(() => {
	// 	props.onComplete(Boolean(race === "no" || racer.elementProps.value));
	// }, [race, racer.elementProps.value]);

	return (
		<GameSubmitPage title="Race/Co-op Opt-in" show={props.show}>
			<input type="hidden" name="race" value={race} />
			<input type="hidden" name="coop" value={coop.toString()} />

			<Checkbox
				onChange={(e) => setRace(e.currentTarget.checked ? "solo" : "no")}
				checked={race !== "no"}
				label="Submit as a race/co-op?"
			/>

			{race !== "no" && (
				<>
					<p
						style={{
							textAlign: "center",
							fontWeight: "bold",
						}}
					>
						IMPORTANT! All other runners must also submit the game.
					</p>
					<Radio.Group value={coop.toString()} onChange={(value) => setCoop(value === "true")}>
						<Radio value="false" label="Race" />
						<Radio value="true" label="Co-op" />
					</Radio.Group>
					<Radio.Group
						label={`${coop ? "Co-op" : "Race"} Type`}
						value={race}
						onChange={(value) => setRace(value as RaceLiterals)}
					>
						<Radio value="solo" label="Possible to do solo" />
						<Radio value="only" label={`Only ${coop ? "co-op" : "race"}`} />
					</Radio.Group>
					<TextInput
						// {...racer.elementProps}
						label="Name of other runner(s)"
						autoComplete="off"
						maxLength={100}
						name="racer"
					/>
				</>
			)}
		</GameSubmitPage>
	);
});
