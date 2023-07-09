import { useEffect, useState } from "react";
import { DocumentRenderer } from "@keystone-6/document-renderer";
import styles from "./GameSubmission.module.scss";
import { platforms, techPlatforms } from "../platforms";
import useFormInput from "../../hooks/useFormInput";
import useAutoCompleteFormInput from "../../hooks/useAutocompleteFormInput";

import {
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormControlLabel,
	Checkbox,
	Stepper,
	Step,
	StepButton,
	Paper,
	TextField,
	Autocomplete,
	FormHelperText,
	Button,
	FormLabel,
	RadioGroup,
	Radio,
	CircularProgress,
	ToggleButton,
	ToggleButtonGroup,
	useMediaQuery,
} from "@mui/material";
import { GameSubmitPage } from "./GameSubmitPage";
import type { UseMutationResponse } from "urql";
import type { AuthReturnData } from "../auth";
import { useLoadingTimeout } from "apps/nextjs/hooks/useLoadingTimeout";
import PreviousSubmissions from "./PreviousSubmissions";
import EstimateInput from "./EstimateInput";
import DonationIncentiveInput from "./DonationIncentive";
import type {
	AgeRatingLiterals,
	DonationIncentive,
	MUTATION_SUBMISSION_RESULTS,
	QUERY_USER_RESULTS,
	RaceLiterals,
} from "./submissionTypes";
import Availability from "./Availability";
import CurrentSubmissionCard from "./CurrentSubmissionCard";

function HumanErrorMsg(error: string) {
	// console.log(error.replace(/(\r\n|\n|\r)/gm, ""));
	switch (error.replace(/(\r\n|\n|\r)/gm, "")) {
		case `[GraphQL] You provided invalid data for this operation.  - Submission.estimate: Estimate invalid. Make sure its like 01:30:00.`:
			return "Error: Estimate invalid. Make sure it's like HH:MM:SS. e.g. 01:30:00";

		default:
			return error;
	}
}

const SubmissionSteps = [
	"Game",
	"Speedrun",
	"Availability",
	"Race/Co-op Opt-in",
	"Submit",
];

interface GameSubmissionsProps {
	submissionMutation: UseMutationResponse<MUTATION_SUBMISSION_RESULTS>;
	auth: AuthReturnData;
	userQueryResult: QUERY_USER_RESULTS;
}

function GameSubmissions(props: GameSubmissionsProps) {
	const eventsList = props.userQueryResult?.events;
	const [submissionResult, createSubmission] = props.submissionMutation;

	const mobileWidth = useMediaQuery("(max-width: 600px)");

	const game = useFormInput("");
	const category = useFormInput("");
	const platform = useAutoCompleteFormInput("");
	const techPlatform = useAutoCompleteFormInput("");
	const ageRating = useFormInput<AgeRatingLiterals>("m_or_lower");
	const [race, setRace] = useState<RaceLiterals>("no");
	const [coop, setCoop] = useState(false);
	const racer = useFormInput("");
	const video = useFormInput("");
	const specialReqs = useFormInput("");
	const [availableDates, setAvailableDates] = useState<boolean[]>([]);
	const [backup, setBackup] = useState(true);

	const [donationIncentives, setDonationIncentives] = useState<
		DonationIncentive[] | undefined
	>(undefined);
	const [estimate, setEstimate] = useState("");
	const [possibleEstimate, setLowerEstimate] = useState("");
	const possibleEstimateReason = useFormInput("");

	const [showPossibleEstimate, setShowPossibleEstimate] = useState(false);
	const [showSpecialReqs, setShowSpecialReqs] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);

	const [event, setEvent] = useState("");

	const [submissionLoading] = useLoadingTimeout(submissionResult.fetching);

	const currentEvent = eventsList?.find(
		(eventResult) => eventResult.id === event,
	);

	useEffect(() => {
		if (eventsList?.length > 0) {
			setEvent(eventsList[0].id);
		}
	}, [eventsList]);

	function canCompletePage() {
		switch (currentStep) {
			case 0:
				// console.log(
				// 	game.value,
				// 	platform.inputValue,
				// 	techPlatform.inputValue,
				// );
				return (
					game.value && platform.inputValue && techPlatform.inputValue
				);
			case 1:
				// console.log(
				// 	category.value,
				// 	estimate !== "00:00:00",
				// 	`${!showPossibleEstimate} || ${lowerEstimate}`,
				// );
				return (
					category.value &&
					estimate !== "00:00:00" &&
					(!showPossibleEstimate ||
						(possibleEstimate !== "00:00:00" &&
							possibleEstimateReason.value)) &&
					video.value &&
					(typeof donationIncentives === "undefined" ||
						donationIncentives.at(-1)?.title)
				);
			case 2:
				// console.log(availableDates);
				return availableDates.some((date) => date);
			case 3:
				// console.log(race, racer.value);
				return race === "no" || racer.value;
			case 4:
				return true;
			default:
				return false;
		}
	}

	const handleStepOnClick = (step: number) => () => {
		setCurrentStep(step);
	};

	function handleNext() {
		if (currentStep === 4) {
			submitSubmission();
		}
		setCurrentStep((activeStep) => activeStep + 1);
	}

	function handleBack() {
		setCurrentStep((activeStep) => activeStep - 1);
	}

	function handleNewDonationIncentive() {
		if (typeof donationIncentives === "undefined") {
			setDonationIncentives([{ title: "" }]);
		} else {
			setDonationIncentives((prev) => [
				...(prev as DonationIncentive[]),
				{ title: "" },
			]);
		}
	}

	function handleDonationIncentiveCancel(index: number) {
		if (donationIncentives?.length === 1) {
			setDonationIncentives(undefined);
		} else {
			setDonationIncentives(
				donationIncentives?.filter((_, i) => i !== index),
			);
		}
	}

	function handleEstimateChange(time: string) {
		setEstimate(time);
	}

	function handlePossibleEstimateChange(time: string) {
		setLowerEstimate(time);
	}

	function resetForm() {
		setCurrentStep(0);
		game.reset();
		category.reset();
		platform.reset();
		techPlatform.reset();
		setEstimate("00:00:00");
		possibleEstimateReason.reset();
		setShowPossibleEstimate(false);
		setLowerEstimate("00:00:00");
		ageRating.reset();
		setDonationIncentives(undefined);
		setShowSpecialReqs(false);
		specialReqs.reset();
		setRace("no");
		racer.reset();
		setCoop(false);
		video.reset();
	}

	function submitSubmission() {
		if (props.auth.ready && props.auth.sessionData) {
			createSubmission({
				userId: props.auth.sessionData.id,
				game: game.value,
				category: category.value,
				platform: platform.inputValue,
				techPlatform: techPlatform.inputValue,
				estimate: estimate,
				possibleEstimate:
					possibleEstimate === "00:00:00" ? "" : possibleEstimate,
				possibleEstimateReason: possibleEstimateReason.value,
				ageRating: ageRating.value,
				newDonationIncentives: donationIncentives,
				specialReqs: specialReqs.value,
				availableDates,
				race: race,
				racer: racer.value,
				coop,
				video: video.value,
				eventId: event,
				willingBackup: currentEvent?.acceptingBackups,
			}).then((result) => {
				if (result.error) {
					console.error(result);
					console.error(result.error);
				}
			});
		}
	}

	function autofillGame(
		submissionGame: QUERY_USER_RESULTS["user"]["submissions"][0],
	) {
		console.log(submissionGame);
		game.setValue(submissionGame.game);
		ageRating.setValue(submissionGame.ageRating as AgeRatingLiterals);
		platform.setInputValue(submissionGame.platform);
		techPlatform.setInputValue(
			submissionGame.techPlatform
				? submissionGame.techPlatform
				: submissionGame.platform,
		);
	}

	function handleAvailabilityUpdate(newDates: boolean[]) {
		setAvailableDates(newDates);
	}

	function handleDonationIncentiveChange(
		updatedIncentive: DonationIncentive,
		updateIndex: number,
	) {
		setDonationIncentives(
			donationIncentives?.map((incentive, i) => {
				if (i === updateIndex) {
					return updatedIncentive;
				} else {
					return incentive;
				}
			}),
		);
	}

	return (
		<form
			className={styles.gameForm}
			onSubmit={(e) => {
				e.preventDefault();
			}}>
			{eventsList.length > 1 && (
				<FormControl fullWidth>
					<InputLabel id="event-label">Event</InputLabel>
					<Select
						labelId="event-label"
						value={event}
						label="Event"
						onChange={(e) => setEvent(e.target.value)}
						required>
						{eventsList.map((event) => {
							return (
								<MenuItem value={event.id} key={event.id}>
									{event.shortname}
									{event.acceptingBackups &&
									!event.acceptingSubmissions
										? " (Backups)"
										: ""}
								</MenuItem>
							);
						})}
					</Select>
				</FormControl>
			)}

			{currentEvent?.acceptingBackups &&
				!currentEvent?.acceptingSubmissions && (
					<FormControlLabel
						control={
							<Checkbox
								onChange={(e) => setBackup(e.target.checked)}
								value={backup}
							/>
						}
						label="You understand that this is a submission for backup games"
					/>
				)}
			<Stepper
				className={styles.stepper}
				orientation={mobileWidth ? "vertical" : "horizontal"}>
				{SubmissionSteps.map((label, index) => (
					<Step
						key={label}
						active={index === currentStep}
						completed={index < currentStep}>
						<StepButton
							color="inherit"
							onClick={handleStepOnClick(index)}>
							{label}
						</StepButton>
					</Step>
				))}
			</Stepper>
			<div className={styles.formAndData}>
				<Paper elevation={3} className={styles.paper}>
					<GameSubmitPage
						title="Game Information"
						show={currentStep === 0}>
						<PreviousSubmissions
							submissions={props.userQueryResult.user.submissions}
							onGameClick={autofillGame}
						/>
						<TextField
							{...game}
							label="Game Name"
							autoComplete="game"
							inputProps={{ maxLength: 100 }}
							required
						/>
						<FormControl fullWidth>
							<Autocomplete
								{...platform}
								freeSolo
								disablePortal
								id="platform-field"
								options={platforms}
								renderInput={(params) => (
									<TextField
										{...params}
										required
										label="Original Console/Platform"
									/>
								)}
							/>
							<FormHelperText>
								Used to display on layouts. If your console does
								not show up still type it.
							</FormHelperText>
						</FormControl>

						<FormControl fullWidth>
							<Autocomplete
								{...techPlatform}
								freeSolo
								disablePortal
								id="tech-platform-field"
								options={techPlatforms}
								renderInput={(params) => (
									<TextField
										{...params}
										required
										label="Running on Console/Platform"
									/>
								)}
							/>
							<FormHelperText>
								What console you will run the game on.
							</FormHelperText>
						</FormControl>
						<InputLabel required>Age Rating</InputLabel>
						<ToggleButtonGroup
							fullWidth
							value={ageRating.value}
							onChange={(_, newVal) => {
								ageRating.setValue(newVal);
							}}
							color="primary"
							exclusive>
							<ToggleButton value="m_or_lower">
								G, PG or M
							</ToggleButton>
							<ToggleButton value="ma15">MA15+</ToggleButton>
							<ToggleButton value="ra18">RA18+</ToggleButton>
						</ToggleButtonGroup>
						<FormHelperText>
							If unsure please search for the game title here:{" "}
							<a
								href="https://www.classification.gov.au/"
								target="_blank"
								rel="noreferrer noopener">
								https://www.classification.gov.au/
							</a>
						</FormHelperText>
					</GameSubmitPage>
					<GameSubmitPage
						title="Speedrun Information"
						show={currentStep === 1}>
						<TextField
							{...category}
							label="Category"
							autoComplete="category"
							helperText="Do not use uncommon acronyms."
							inputProps={{ maxLength: 100 }}
							required
						/>

						<EstimateInput
							required
							value={estimate}
							onTimeChange={handleEstimateChange}
						/>
						<FormControlLabel
							control={
								<Checkbox
									onChange={(e) =>
										setShowPossibleEstimate(
											e.target.checked,
										)
									}
									checked={showPossibleEstimate}
								/>
							}
							label="Possible to go 15 minutes or more under?"
						/>
						{showPossibleEstimate && (
							<>
								<TextField
									{...possibleEstimateReason}
									label="Provide details as to why"
									autoComplete="off"
									inputProps={{ maxLength: 200 }}
									required
									multiline
									rows={2}
								/>
								<EstimateInput
									value={possibleEstimate}
									required
									label="Revised estimate based on reason above"
									onTimeChange={handlePossibleEstimateChange}
								/>
								<br />
							</>
						)}
						<TextField
							{...video}
							label="Video of your own run"
							autoComplete="off"
							inputProps={{ maxLength: 100 }}
							required
						/>
						{showSpecialReqs ? (
							<div className={styles.optionalTextInputs}>
								<TextField
									{...specialReqs}
									label="Special Requirements to run your game"
									autoComplete="off"
									inputProps={{
										maxLength: 300,
									}}
									multiline
									rows={2}
									className={styles.input}
								/>
								<Button
									variant="outlined"
									disabled={Boolean(specialReqs.value)}
									onClick={() => setShowSpecialReqs(false)}
									color="error"
									className={styles.button}>
									Cancel
								</Button>
							</div>
						) : (
							<FormControl>
								<Button
									variant="contained"
									onClick={() => setShowSpecialReqs(true)}
									className={styles.button}>
									The speedrun needs special requirements
								</Button>
								<FormHelperText>
									This involves any: mods, downpatches,
									software, controllers (if a PC game) and any
									other requirements.
								</FormHelperText>
							</FormControl>
						)}

						{typeof donationIncentives !== "undefined" && (
							<InputLabel>Donation Incentives</InputLabel>
						)}
						{donationIncentives?.map((donationIncentive, i) => {
							return (
								<div
									className={styles.optionalTextInputs}
									key={i}>
									<DonationIncentiveInput
										value={donationIncentive}
										onDonationChange={
											handleDonationIncentiveChange
										}
										index={i}
									/>
									<Button
										variant="outlined"
										disabled={Boolean(
											donationIncentive.title,
										)}
										onClick={() =>
											handleDonationIncentiveCancel(i)
										}
										color="error">
										Cancel
									</Button>
								</div>
							);
						})}
						<Button
							variant="contained"
							onClick={handleNewDonationIncentive}
							disabled={
								typeof donationIncentives !== "undefined" &&
								!donationIncentives.at(-1)?.title
							}>
							Add{" "}
							{typeof donationIncentives !== "undefined"
								? "another"
								: "a"}{" "}
							donation incentive
						</Button>
					</GameSubmitPage>
					<GameSubmitPage
						title="Availability"
						show={currentStep === 2}>
						<Availability
							event={currentEvent!}
							onAvailabilityUpdate={handleAvailabilityUpdate}
						/>
					</GameSubmitPage>
					<GameSubmitPage
						title="Race/Co-op Opt-in"
						show={currentStep === 3}>
						<FormControlLabel
							control={
								<Checkbox
									onChange={(e) =>
										setRace(
											e.target.checked ? "solo" : "no",
										)
									}
									checked={race !== "no"}
								/>
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
									IMPORTANT! All other runners must also
									submit the game.
								</p>
								<FormControl>
									<RadioGroup
										aria-labelledby="race-type-label"
										value={coop}
										onChange={(_, value) =>
											setCoop(value === "true")
										}>
										<FormControlLabel
											value={false}
											control={<Radio />}
											label="Race"
										/>
										<FormControlLabel
											value={true}
											control={<Radio />}
											label="Co-op"
										/>
									</RadioGroup>
								</FormControl>
								<FormControl>
									{/* Don't think "type" is a good descriptor */}
									<FormLabel id="race-type-label">
										{coop ? "Co-op" : "Race"} Type
									</FormLabel>
									<RadioGroup
										aria-labelledby="race-type-label"
										value={race}
										onChange={(_, value) =>
											setRace(value as RaceLiterals)
										}>
										<FormControlLabel
											value="solo"
											control={<Radio />}
											label="Possible to do solo"
										/>
										<FormControlLabel
											value="only"
											control={<Radio />}
											label={`Only ${
												coop ? "co-op" : "race"
											}`}
										/>
									</RadioGroup>
								</FormControl>
								<TextField
									{...racer}
									label="Name of other runner(s)"
									autoComplete="off"
									inputProps={{
										maxLength: 100,
									}}
								/>
							</>
						)}
					</GameSubmitPage>
					<GameSubmitPage
						title="Submit"
						show={currentStep === 4}
						childrenJustify="space-evenly">
						{currentEvent?.acceptingBackups &&
							currentEvent?.acceptingSubmissions && (
								<FormControlLabel
									control={
										<Checkbox
											onChange={(e) =>
												setBackup(e.target.checked)
											}
											value={backup}
											checked={backup}
										/>
									}
									label="Allow as backup run"
								/>
							)}
						{currentEvent?.submissionInstructions.document && (
							<div>
								<DocumentRenderer
									document={
										currentEvent.submissionInstructions
											.document
									}
								/>
							</div>
						)}
					</GameSubmitPage>
					<GameSubmitPage
						title={
							submissionLoading
								? "Submitting"
								: submissionResult.error
								? "Error :("
								: "Complete!"
						}
						show={currentStep === 5}>
						{submissionLoading ? (
							<CircularProgress />
						) : submissionResult.error ? (
							<h3 className={styles.error}>
								{HumanErrorMsg(submissionResult.error.message)}
							</h3>
						) : (
							<div className={styles.finalGamePage}>
								<p className={styles.game}>
									{
										submissionResult.data?.createSubmission
											.game
									}
								</p>
								<hr />
								<table>
									<tbody>
										<tr>
											<td>Category</td>
											<td>
												{
													submissionResult.data
														?.createSubmission
														.category
												}
											</td>
										</tr>
										<tr>
											<td>
												Estimate
												{submissionResult.data
													?.createSubmission
													.possibleEstimate &&
													" between"}
											</td>
											<td>
												{submissionResult.data
													?.createSubmission
													.possibleEstimate &&
													`${submissionResult.data?.createSubmission.possibleEstimate} – `}
												{
													submissionResult.data
														?.createSubmission
														.estimate
												}
											</td>
										</tr>
										<tr>
											<td>Platform</td>
											<td>
												{
													submissionResult.data
														?.createSubmission
														.platform
												}{" "}
												<span
													className={
														styles.techPlatform
													}>
													{submissionResult.data
														?.createSubmission
														.platform !==
														submissionResult.data
															?.createSubmission
															.techPlatform &&
														`(Running on ${submissionResult.data?.createSubmission.techPlatform})`}
												</span>
											</td>
										</tr>
										{submissionResult.data?.createSubmission
											.race !== "no" && (
											<tr>
												<td>
													{submissionResult.data
														?.createSubmission
														.race === "solo" &&
														"Solo or "}
													{submissionResult.data
														?.createSubmission.coop
														? "Co-op"
														: "Race"}{" "}
													with
												</td>
												<td>
													{
														submissionResult.data
															?.createSubmission
															.racer
													}
												</td>
											</tr>
										)}
										{submissionResult.data?.createSubmission
											.newDonationIncentives &&
											submissionResult.data
												.createSubmission
												.newDonationIncentives?.length >
												0 && (
												<tr>
													<td>
														Donation Incentive
														{submissionResult.data
															?.createSubmission
															.newDonationIncentives
															?.length > 1 && "s"}
													</td>
													<td>
														{submissionResult.data?.createSubmission.newDonationIncentives
															.map(
																(incentive) =>
																	incentive.title,
															)
															.join(", ")}
													</td>
												</tr>
											)}
									</tbody>
								</table>
							</div>
						)}

						<Button
							variant="contained"
							fullWidth
							onClick={resetForm}>
							Submit another game?
						</Button>
					</GameSubmitPage>
					<div className={styles.pageControls}>
						<Button
							disabled={currentStep === 0 || currentStep > 4}
							onClick={handleBack}>
							Back
						</Button>
						<Button
							onClick={handleNext}
							disabled={!canCompletePage()}
							variant={
								currentStep === 4 ? "contained" : "outlined"
							}>
							{currentStep === 4 ? "Submit Run" : "Next"}
						</Button>
					</div>
				</Paper>
				{currentStep !== 5 && (
					<CurrentSubmissionCard
						currentStep={currentStep}
						submissionData={{
							game: game.value,
							platform: platform.inputValue!,
							techPlatform: techPlatform.inputValue!,
							category: category.value,
							estimate: estimate,
							lowerEstimate: possibleEstimate,
							race: race,
							racer: racer.value,
							coop: coop,
							donationIncentives: donationIncentives,
						}}
					/>
				)}
			</div>
		</form>
	);
}

export default GameSubmissions;
