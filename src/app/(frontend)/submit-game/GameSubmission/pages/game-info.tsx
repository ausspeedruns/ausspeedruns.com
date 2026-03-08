"use client";

import { Autocomplete, Input, TextInput, SegmentedControl } from "@mantine/core";
import { GameSubmitPage } from "../components/GameSubmitPage";
import PreviousSubmissions, { type Submission } from "../PreviousSubmissions";
// import useFormInput from "../../../../hooks/useFormInput";
// import useAutoCompleteFormInput from "../../../../hooks/useAutocompleteFormInput";
import type { AgeRatingLiterals, QUERY_USER_RESULTS, SubmissionPageRef } from "../submissionTypes";
// import { platforms, techPlatforms } from "../../../../components/platforms";
import { forwardRef, useEffect, useImperativeHandle } from "react";

type RunInfoProps = {
	show: boolean;
	previousSubmissions: Submission[];
	onComplete: (isComplete: boolean) => void;
};

export const GameInfo = forwardRef<SubmissionPageRef, RunInfoProps>((props, ref) => {
	// const game = useFormInput("");
	// const platform = useAutoCompleteFormInput("");
	// const techPlatform = useAutoCompleteFormInput("");
	// const ageRating = useFormInput<AgeRatingLiterals>("m_or_lower");

	// useImperativeHandle(ref, () => ({
	// 	reset: () => {
	// 		game.reset();
	// 		platform.reset();
	// 		techPlatform.reset();
	// 		ageRating.reset();
	// 	},
	// }));

	// useEffect(() => {
	// 	props.onComplete(
	// 		Boolean(
	// 			game.elementProps.value && platform.elementProps.inputValue && techPlatform.elementProps.inputValue,
	// 		),
	// 	);
	// }, [game.elementProps.value, platform.elementProps.inputValue, techPlatform.elementProps.inputValue]);

	function autofillGame(submission: QUERY_USER_RESULTS["user"]["submissions"][0]) {
		// game.setValue(submission.game);
		// ageRating.setValue(submission.ageRating as AgeRatingLiterals);
		// platform.setInputValue(submission.platform);
		// techPlatform.setInputValue(submission.techPlatform ? submission.techPlatform : submission.platform);
	}

	return (
		<GameSubmitPage title="Game Information" show={props.show}>
			<PreviousSubmissions submissions={props.previousSubmissions} onGameClick={autofillGame} />
			<TextInput
				// {...game.elementProps}
				label="Game Name"
				autoComplete="game"
				maxLength={100}
				required
				name="game"
			/>
			<div>
				<Autocomplete
					// value={platform.elementProps.inputValue}
					// onChange={(val) => platform.setInputValue(val)}
					id="platform-field"
					// data={platforms}
					label="Original Console/Platform"
					required
					name="platform"
				/>
				<Input.Description>
					Used to display on layouts. If your console does not show up still type it.
				</Input.Description>
			</div>

			<div>
				<Autocomplete
					// value={techPlatform.elementProps.inputValue}
					// onChange={(val) => techPlatform.setInputValue(val)}
					id="tech-platform-field"
					// data={techPlatforms}
					label="Running on Console/Platform"
					required
					name="techPlatform"
				/>
				<Input.Description>What console you will run the game on.</Input.Description>
			</div>

			<div>
				<Input.Label required>Age Rating</Input.Label>
				<SegmentedControl
					fullWidth
					// value={ageRating.elementProps.value}
					// onChange={(val) => {
					// 	ageRating.setValue(val);
					// }}
					data={[
						{ label: "G, PG or M", value: "m_or_lower" },
						{ label: "MA15+", value: "ma15" },
						{ label: "RA18+", value: "ra18" },
					]}
				/>
				<Input.Description>
					If unsure please search for the game title here:{" "}
					<a href="https://www.classification.gov.au/" target="_blank" rel="noreferrer noopener">
						https://www.classification.gov.au/
					</a>
				</Input.Description>
			</div>
			{/* <input type="hidden" name="ageRating" value={ageRating.elementProps.value} /> */}
		</GameSubmitPage>
	);
});
