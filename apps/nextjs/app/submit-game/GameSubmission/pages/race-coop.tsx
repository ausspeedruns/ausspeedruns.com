import { FormControlLabel, Checkbox, FormControl, RadioGroup, Radio, FormLabel, TextField } from "@mui/material";
import { GameSubmitPage } from "../components/GameSubmitPage";
import { RaceLiterals, SubmissionPageRef } from "../submissionTypes";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import useFormInput from "../../../../hooks/useFormInput";

type RaceCoopProps = {
	show: boolean;
	onComplete: (isComplete: boolean) => void;
};

export const RaceCoop = forwardRef<SubmissionPageRef, RaceCoopProps>((props, ref) => {
	const [race, setRace] = useState<RaceLiterals>("no");
	const [coop, setCoop] = useState(false);
	const racer = useFormInput("");

	useImperativeHandle(ref, () => ({
		reset: () => {
			setRace("no");
			setCoop(false);
			racer.reset();
		},
	}));

	useEffect(() => {
		props.onComplete(Boolean(race === "no" || racer.elementProps.value));
	}, [race, racer.elementProps.value]);

	return (
		<GameSubmitPage title="Race/Co-op Opt-in" show={props.show}>
			<input type="hidden" name="race" value={race} />
			<input type="hidden" name="coop" value={coop.toString()} />

			<FormControlLabel
				control={
					<Checkbox onChange={(e) => setRace(e.target.checked ? "solo" : "no")} checked={race !== "no"} />
				}
				label="Submit as a race/co-op?"
			/>

			{race !== "no" && (
				<>
					<p
						style={{
							textAlign: "center",
							fontWeight: "bold",
						}}>
						IMPORTANT! All other runners must also submit the game.
					</p>
					<FormControl>
						<RadioGroup
							aria-labelledby="race-type-label"
							value={coop}
							onChange={(_, value) => setCoop(value === "true")}>
							<FormControlLabel value={false} control={<Radio />} label="Race" />
							<FormControlLabel value={true} control={<Radio />} label="Co-op" />
						</RadioGroup>
					</FormControl>
					<FormControl>
						{/* Don't think "type" is a good descriptor */}
						<FormLabel id="race-type-label">{coop ? "Co-op" : "Race"} Type</FormLabel>
						<RadioGroup
							aria-labelledby="race-type-label"
							value={race}
							onChange={(_, value) => setRace(value as RaceLiterals)}>
							<FormControlLabel value="solo" control={<Radio />} label="Possible to do solo" />
							<FormControlLabel
								value="only"
								control={<Radio />}
								label={`Only ${coop ? "co-op" : "race"}`}
							/>
						</RadioGroup>
					</FormControl>
					<TextField
						{...racer.elementProps}
						label="Name of other runner(s)"
						autoComplete="off"
						slotProps={{ htmlInput: { maxLength: 100 } }}
						name="racer"
					/>
				</>
			)}
		</GameSubmitPage>
	);
});
