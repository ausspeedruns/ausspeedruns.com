"use client";

import { Autocomplete, Input, TextInput, SegmentedControl } from "@mantine/core";
import PreviousSubmissions, { type OldSubmission } from "../components/PreviousSubmissions";
// import useFormInput from "../../../../hooks/useFormInput";
// import useAutoCompleteFormInput from "../../../../hooks/useAutocompleteFormInput";
import type { GameSubmissionResults } from "../submissionTypes";
// import { platforms, techPlatforms } from "../../../../components/platforms";
import type { UseFormReturnType } from "@mantine/form";
import { platforms, techPlatforms } from "../platforms";

interface RunInfoProps {
	previousSubmissions: OldSubmission[];
	form: UseFormReturnType<GameSubmissionResults>;
};

export function GameInfo(props: RunInfoProps) {
	function autofillGame(submission: OldSubmission) {
		props.form.setFieldValue("game", submission.game);
		props.form.setFieldValue("ageRating", submission.ageRating);
		props.form.setFieldValue("platform", submission.platform);
		props.form.setFieldValue("techPlatform", submission.techPlatform ? submission.techPlatform : submission.platform);
	}

	return (
		<>
			<PreviousSubmissions submissions={props.previousSubmissions} onGameClick={autofillGame} />
			<TextInput
				// {...game.elementProps}
				label="Game Name"
				autoComplete="game"
				maxLength={100}
				required
				name="game"
				key={props.form.key("game")}
				{...props.form.getInputProps("game")}
			/>
			<div>
				<Autocomplete
					// value={platform.elementProps.inputValue}
					// onChange={(val) => platform.setInputValue(val)}
					id="platform-field"
					data={platforms}
					label="Original Console/Platform"
					required
					name="platform"
					key={props.form.key("platform")}
					{...props.form.getInputProps("platform")}
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
					data={techPlatforms}
					label="Running on Console/Platform"
					required
					name="techPlatform"
					key={props.form.key("techPlatform")}
					{...props.form.getInputProps("techPlatform")}
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
					name="ageRating"
					key={props.form.key("ageRating")}
					{...props.form.getInputProps("ageRating")}
				/>
				<Input.Description>
					If unsure please search for the game title here:{" "}
					<a href="https://www.classification.gov.au/" target="_blank" rel="noreferrer noopener">
						https://www.classification.gov.au/
					</a>
				</Input.Description>
			</div>
		</>
	);
}
