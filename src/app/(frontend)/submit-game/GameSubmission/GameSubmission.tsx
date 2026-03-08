"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./GameSubmission.module.css";

import { Checkbox, Stepper, Paper, Button, Select } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
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

	const [event, setEvent] = useState(eventsList[0].id.toString());

	const currentEvent = eventsList?.find((eventResult) => eventResult.id.toString() === event);

	useEffect(() => {
		setCanComplete(currentStep >= 3);
	}, [currentStep]);

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
				<div>
					<Select
						label="Event"
						value={event}
						onChange={(val) => val && setEvent(val)}
						required
						data={eventsList.map((event) => ({
							value: event.id.toString(),
							label: `${event.shortname}${event.acceptingBackups && !event.acceptingSubmissions ? " (Backups)" : ""}`,
						}))}
					/>
				</div>
			)}

			{currentEvent.acceptingBackups && !currentEvent.acceptingSubmissions && (
				<Checkbox
					onChange={(e) => setBackup(e.currentTarget.checked)}
					checked={backup}
					label="You understand that this is a submission for backup games"
				/>
			)}
			<Stepper
				active={currentStep}
				onStepClick={setCurrentStep}
				className={styles.stepper}
				orientation={mobileWidth ? "vertical" : "horizontal"}
			>
				{SubmissionSteps.map((label) => (
					<Stepper.Step key={label} label={label} />
				))}
			</Stepper>
			<div className={styles.formAndData}>
				<Paper shadow="md" className={styles.paper}>
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
								variant={currentStep === 4 ? "filled" : "outline"}
							>
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
