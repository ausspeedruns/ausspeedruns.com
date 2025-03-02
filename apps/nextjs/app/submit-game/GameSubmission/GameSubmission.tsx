"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import styles from "./GameSubmission.module.scss";

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
	Button,
	useMediaQuery,
} from "@mui/material";
import type { QUERY_USER_RESULTS, SubmissionPageRef } from "./submissionTypes";
import CurrentSubmissionCard from "./CurrentSubmissionCard";
import { createSubmissionFromForm } from "./game-submission-action";
import { GameInfo } from "./pages/game-info";
import { RunInfo } from "./pages/run-info";
import { Availability } from "./pages/availability";
import { Acknowledgement } from "./pages/acknowledgement";
import { SubmissionResults } from "./pages/results";
import { RaceCoop } from "./pages/race-coop";

const SubmissionSteps = ["Game", "Speedrun", "Availability", "Race/Co-op Opt-in", "Submit"];

interface GameSubmissionsProps {
	userId: string;
	userQueryResult: QUERY_USER_RESULTS;
}

function GameSubmissions(props: GameSubmissionsProps) {
	// const [state, formAction] = useActionState(createSubmissionFromForm, null);
	const eventsList = props.userQueryResult?.events;

	const formRef = useRef<HTMLFormElement>(null);
	const gameInfoRef = useRef<SubmissionPageRef>(null);
	const runInfoRef = useRef<SubmissionPageRef>(null);
	const availabilityRef = useRef<SubmissionPageRef>(null);
	const raceCoopRef = useRef<SubmissionPageRef>(null);
	const acknowledgementRef = useRef<SubmissionPageRef>(null);

	const mobileWidth = useMediaQuery("(max-width: 600px)");

	const [backup, setBackup] = useState(true);
	const [currentStep, setCurrentStep] = useState(0);
	const [canComplete, setCanComplete] = useState(false);

	const [event, setEvent] = useState(eventsList[0].id);

	const currentEvent = eventsList?.find((eventResult) => eventResult.id === event);

	useEffect(() => {
		setCanComplete(currentStep >= 3);
	}, [currentStep]);

	const handleStepOnClick = (step: number) => () => {
		setCurrentStep(step);
	};

	function handleNext(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();

		if (currentStep === 4) {
			e.currentTarget.form?.requestSubmit();
		}

		setCurrentStep((activeStep) => activeStep + 1);
	}

	function handleBack() {
		setCurrentStep((activeStep) => activeStep - 1);
	}

	function resetForm() {
		setCurrentStep(0);
		gameInfoRef.current?.reset();
		runInfoRef.current?.reset();
		availabilityRef.current?.reset();
		raceCoopRef.current?.reset();
		acknowledgementRef.current?.reset();
	}

	if (!currentEvent) {
		return <h2>Event not found</h2>;
	}

	return (
		<form className={styles.gameForm} action={createSubmissionFromForm} ref={formRef}>
			<input type="hidden" name="eventId" value={event} />

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
									{event.acceptingBackups && !event.acceptingSubmissions ? " (Backups)" : ""}
								</MenuItem>
							);
						})}
					</Select>
				</FormControl>
			)}

			{currentEvent.acceptingBackups && !currentEvent.acceptingSubmissions && (
				<FormControlLabel
					control={<Checkbox onChange={(e) => setBackup(e.target.checked)} value={backup} />}
					label="You understand that this is a submission for backup games"
				/>
			)}
			<Stepper className={styles.stepper} orientation={mobileWidth ? "vertical" : "horizontal"}>
				{SubmissionSteps.map((label, index) => (
					<Step key={label} active={index === currentStep} completed={index < currentStep}>
						<StepButton color="inherit" onClick={handleStepOnClick(index)}>
							{label}
						</StepButton>
					</Step>
				))}
			</Stepper>
			<div className={styles.formAndData}>
				<Paper elevation={3} className={styles.paper}>
					<GameInfo
						show={currentStep === 0}
						previousSubmissions={props.userQueryResult.user.submissions}
						ref={gameInfoRef}
						onComplete={(isComplete) => setCanComplete(isComplete)}
					/>
					<RunInfo
						show={currentStep === 1}
						ref={runInfoRef}
						onComplete={(isComplete) => setCanComplete(isComplete)}
					/>
					<Availability
						show={currentStep === 2}
						event={currentEvent}
						ref={availabilityRef}
						onComplete={(isComplete) => setCanComplete(isComplete)}
					/>
					<RaceCoop
						show={currentStep === 3}
						ref={raceCoopRef}
						onComplete={(isComplete) => setCanComplete(isComplete)}
					/>
					<Acknowledgement
						acceptingBackups={currentEvent?.acceptingBackups ?? false}
						acceptingSubmissions={currentEvent?.acceptingSubmissions ?? false}
						submissionInstructions={currentEvent?.submissionInstructions.document}
						show={currentStep === 4}
						ref={acknowledgementRef}
					/>
					<SubmissionResults
						show={currentStep === 5}
						resetForm={resetForm}
						formRef={formRef}
						results={null}
						// submissionResults={submissionResults}
					/>
					{currentStep < 5 && (
						<div className={styles.pageControls}>
							<Button disabled={currentStep === 0 || currentStep > 4} onClick={handleBack}>
								Back
							</Button>
							<Button
								onClick={handleNext}
								disabled={!canComplete}
								variant={currentStep === 4 ? "contained" : "outlined"}>
								{currentStep === 4 ? "Submit Run" : "Next"}
							</Button>
						</div>
					)}
				</Paper>
				{currentStep !== 5 && (
					<CurrentSubmissionCard
						currentStep={currentStep}
						formRef={formRef}
						// submissionData={{
						// 	game: game.value,
						// 	platform: platform.elementProps.inputValue!,
						// 	techPlatform: techPlatform.elementProps.inputValue!,
						// 	category: category.value,
						// 	estimate: estimate,
						// 	lowerEstimate: possibleEstimate,
						// 	race: race,
						// 	racer: racer.value,
						// 	coop: coop,
						// 	donationIncentives: donationIncentives,
						// }}
					/>
				)}
			</div>
		</form>
	);
}

export default GameSubmissions;
