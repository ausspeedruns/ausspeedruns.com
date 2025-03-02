"use client";

import {
	Autocomplete,
	FormControl,
	FormHelperText,
	InputLabel,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import { GameSubmitPage } from "../components/GameSubmitPage";
import PreviousSubmissions, { type Submission } from "../PreviousSubmissions";
import useFormInput from "../../../../hooks/useFormInput";
import useAutoCompleteFormInput from "../../../../hooks/useAutocompleteFormInput";
import { AgeRatingLiterals, QUERY_USER_RESULTS, SubmissionPageRef } from "../submissionTypes";
import { platforms, techPlatforms } from "../../../../components/platforms";
import { forwardRef, useEffect, useImperativeHandle } from "react";

type RunInfoProps = {
	show: boolean;
	previousSubmissions: Submission[];
	onComplete: (isComplete: boolean) => void;
};

export const GameInfo = forwardRef<SubmissionPageRef, RunInfoProps>((props, ref) => {
	const game = useFormInput("");
	const platform = useAutoCompleteFormInput("");
	const techPlatform = useAutoCompleteFormInput("");
	const ageRating = useFormInput<AgeRatingLiterals>("m_or_lower");

	useImperativeHandle(ref, () => ({
		reset: () => {
			game.reset();
			platform.reset();
			techPlatform.reset();
			ageRating.reset();
		},
	}));

	useEffect(() => {
		props.onComplete(
			Boolean(game.elementProps.value && platform.elementProps.inputValue && techPlatform.elementProps.inputValue),
		);
	}, [game.elementProps.value, platform.elementProps.inputValue, techPlatform.elementProps.inputValue]);

	function autofillGame(submission: QUERY_USER_RESULTS["user"]["submissions"][0]) {
		game.setValue(submission.game);
		ageRating.setValue(submission.ageRating as AgeRatingLiterals);
		platform.setInputValue(submission.platform);
		techPlatform.setInputValue(submission.techPlatform ? submission.techPlatform : submission.platform);
	}

	return (
		<GameSubmitPage title="Game Information" show={props.show}>
			<PreviousSubmissions submissions={props.previousSubmissions} onGameClick={autofillGame} />
			<TextField
				{...game.elementProps}
				label="Game Name"
				autoComplete="game"
				slotProps={{ htmlInput: { maxLength: 100 } }}
				required
				name="game"
			/>
			<FormControl fullWidth>
				<Autocomplete
					{...platform.elementProps}
					freeSolo
					disablePortal
					id="platform-field"
					options={platforms}
					renderInput={(params) => (
						<TextField {...params} required label="Original Console/Platform" name="platform" />
					)}
				/>
				<FormHelperText>
					Used to display on layouts. If your console does not show up still type it.
				</FormHelperText>
			</FormControl>

			<FormControl fullWidth>
				<Autocomplete
					{...techPlatform.elementProps}
					freeSolo
					disablePortal
					id="tech-platform-field"
					options={techPlatforms}
					renderInput={(params) => (
						<TextField {...params} required label="Running on Console/Platform" name="techPlatform" />
					)}
				/>
				<FormHelperText>What console you will run the game on.</FormHelperText>
			</FormControl>

			<InputLabel required>Age Rating</InputLabel>
			<ToggleButtonGroup
				fullWidth
				value={ageRating.elementProps.value}
				onChange={(_, newVal) => {
					ageRating.setValue(newVal);
				}}
				color="primary"
				exclusive>
				<ToggleButton value="m_or_lower">G, PG or M</ToggleButton>
				<ToggleButton value="ma15">MA15+</ToggleButton>
				<ToggleButton value="ra18">RA18+</ToggleButton>
			</ToggleButtonGroup>
			<FormHelperText>
				If unsure please search for the game title here:{" "}
				<a href="https://www.classification.gov.au/" target="_blank" rel="noreferrer noopener">
					https://www.classification.gov.au/
				</a>
			</FormHelperText>
			<input type="hidden" name="ageRating" value={ageRating.elementProps.value} />
		</GameSubmitPage>
	);
});
