"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./GameSubmission.module.css";

import { Checkbox, Stepper, Paper, Button, Select } from "@mantine/core";
import { ChevronLeft, ChevronRight, Upload } from "pixelarticons/react";
import type { GameSubmissionResults } from "./submissionTypes";
import CurrentSubmissionCard from "./components/CurrentSubmissionCard";
import { createSubmission } from "./gameSubmissionAction";
import { getStepErrors } from "./validateSubmission";
import { getEventDays } from "#/utilities/getEventDays";
import { GameInfo } from "./steps/GameInfoStep";
import { RunInfo } from "./steps/RunInfoStep";
import { Availability } from "./steps/AvailabilityStep";
import { Acknowledgement } from "./steps/AcknowledgementStep";
import { SubmissionResults } from "./steps/ResultsStep";
import { RaceCoop } from "./steps/RaceCoopStep";
import { useForm, type FormErrors } from "@mantine/form";
import type { OldSubmission } from "./components/PreviousSubmissions";
import type { Event, Submission } from "#payload-types.ts";
import { focusFirstError } from "#utilities/react/focusFirstError.ts";

const STEPS = [
	{ label: "Game", description: "Title & platform" },
	{ label: "Speedrun", description: "Category & estimate" },
	{ label: "Availability", description: "Event days" },
	{ label: "Race/Co-op", description: "Optional" },
	{ label: "Submit", description: "Review & confirm" },
];

interface GameSubmissionsProps {
	availableEvents: {
		id: number;
		shortName: string;
		acceptingSubmissions: boolean;
		acceptingBackups: boolean;
		startDate: string;
		endDate: string;
		eventTimezone: string;
		submissionInstructions: Event["submissionInstructions"];
	}[];
	oldSubmissions: OldSubmission[];
}

function GameSubmissions(props: GameSubmissionsProps) {
	const [loading, setLoading] = useState(false);
	const [submissionResults, setSubmissionResults] = useState<Submission | null>(null);
	const form = useForm<GameSubmissionResults>({
		mode: "controlled",
		initialValues: {
			event: props.availableEvents.length > 0 ? props.availableEvents[0].id : 0,

			// Game info
			game: "",
			platform: "",
			techPlatform: "",
			ageRating: "m_or_lower",

			// Run info
			category: "",
			video: "",
			estimate: "01:00:00",
			possibleEstimate: undefined,
			possibleEstimateReason: undefined,
			lowerEstimate: "",
			specialRequirements: "",
			donationIncentives: undefined,

			// Availability
			availability: [],

			// Race/Co-op
			race: "noRace",
			racer: "",
			coop: false,

			// Backup
			backup: true,
		},

		validate: (values) => getStepErrors(currentStep, values, eventLength),
	});
	const eventsList = props.availableEvents;

	const [backupAcknowledged, setBackupAcknowledged] = useState(false);
	const [backupAcknowledgedError, setBackupAcknowledgedError] = useState(false);
	const [submissionError, setSubmissionError] = useState<string | null>(null);
	const [currentStep, setCurrentStep] = useState(0);
	const submissionInFlightRef = useRef(false);

	const formTopRef = useRef<HTMLDivElement>(null);
	const stepContentRef = useRef<HTMLDivElement>(null);
	const backupCheckboxRef = useRef<HTMLInputElement>(null);
	const pendingErrorFocusRef = useRef<FormErrors | null>(null);
	const lastStepStateRef = useRef(`${currentStep}-${loading}`);

	const currentEvent = eventsList?.find((eventResult) => eventResult.id === form.values.event);
	const isBackupOnly = Boolean(currentEvent?.acceptingBackups && !currentEvent?.acceptingSubmissions);
	const eventLength: number = currentEvent ? getEventDays(currentEvent.startDate, currentEvent.endDate) : 0;

	// Bring the top of the form back into view when changing steps on long pages
	useEffect(() => {
		// Compare against the last handled state rather than a first-render flag so Strict Mode's double effect run
		// doesn't steal focus on page load
		const stepState = `${currentStep}-${loading}`;
		if (lastStepStateRef.current === stepState) return;
		lastStepStateRef.current = stepState;

		const formTop = formTopRef.current;
		if (formTop && formTop.getBoundingClientRect().top < 0) {
			formTop.scrollIntoView({ behavior: "smooth", block: "start" });
		}

		// Sent back to an earlier step with errors: focus the first invalid field instead of the heading
		const pendingErrors = pendingErrorFocusRef.current;
		pendingErrorFocusRef.current = null;
		if (pendingErrors && focusFirstError(form, pendingErrors)) return;

		// Move focus to the new step's heading (or the loading/result message) so screen readers announce the change,
		// and so focus isn't lost when the Continue/Submit button disappears on the final step
		const focusTarget = stepContentRef.current?.querySelector<HTMLElement>('h2, [role="status"], [role="alert"]');
		if (focusTarget) {
			focusTarget.tabIndex = -1;
			focusTarget.focus({ preventScroll: true });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentStep, loading]);

	function handleNext() {
		const validation = form.validate();
		if (validation.hasErrors) {
			focusFirstError(form, validation.errors);
			return;
		}

		if (currentStep === 4) {
			if (submissionInFlightRef.current) {
				return;
			}

			// Re-check every earlier step in case something changed (e.g. a different event was selected)
			for (let step = 0; step < 4; step++) {
				const stepErrors = getStepErrors(step, form.values, eventLength);
				if (Object.keys(stepErrors).length > 0) {
					pendingErrorFocusRef.current = stepErrors;
					setCurrentStep(step);
					form.setErrors(stepErrors);
					return;
				}
			}

			if (isBackupOnly && !backupAcknowledged) {
				setBackupAcknowledgedError(true);
				backupCheckboxRef.current?.focus();
				return;
			}

			submissionInFlightRef.current = true;
			setSubmissionError(null);
			setCurrentStep(5);
			void handleSubmission(form.values);
			return;
		}

		setCurrentStep((current) => (current < 5 ? current + 1 : current));
	}

	function handleBack() {
		setCurrentStep((activeStep) => (activeStep > 0 ? activeStep - 1 : activeStep));
	}

	function resetForm() {
		setCurrentStep(0);
		form.reset();
		setSubmissionResults(null);
		setSubmissionError(null);
		setBackupAcknowledged(false);
	}

	function returnToReview() {
		setSubmissionError(null);
		setCurrentStep(4);
	}

	if (!currentEvent) {
		return <h2>Event not found</h2>;
	}

	async function handleSubmission(values: typeof form.values) {
		setLoading(true);
		try {
			const result = await createSubmission(values);

			if (result.success) {
				setSubmissionResults(result.data ?? null);
			} else {
				console.error("Submission error:", result.error);
				setSubmissionError(result.error ?? "Something went wrong. Please try again.");
			}
		} catch (error) {
			console.error("Network error", error);
			setSubmissionError("Network error. Please check your connection and try again.");
		} finally {
			submissionInFlightRef.current = false;
			setLoading(false);
		}
	}

	function renderStep() {
		if (!currentEvent) return null;

		switch (currentStep) {
			case 0:
				return <GameInfo previousSubmissions={props.oldSubmissions} form={form} />;
			case 1:
				return <RunInfo form={form} />;
			case 2:
				return <Availability event={currentEvent} eventLength={eventLength} form={form} />;
			case 3:
				return <RaceCoop form={form} />;
			case 4:
				return (
					<Acknowledgement
						acceptingBackups={currentEvent.acceptingBackups}
						acceptingSubmissions={currentEvent.acceptingSubmissions}
						submissionInstructions={currentEvent.submissionInstructions}
						eventDays={eventLength}
						onEditStep={setCurrentStep}
						form={form}
					/>
				);
			default:
				return (
					<SubmissionResults
						resetForm={resetForm}
						returnToReview={returnToReview}
						results={submissionResults}
						error={submissionError}
						loading={loading}
					/>
				);
		}
	}

	return (
		<div className={styles.gameForm}>
			{eventsList.length > 1 && (
				<div>
					<Select
						label="Event"
						key={form.key("event")}
						{...form.getInputProps("event")}
						value={form.values.event.toString()}
						onChange={(value) => {
							if (!value) return;
							form.setFieldValue("event", Number(value));
							form.setFieldValue("availability", []);
						}}
						allowDeselect={false}
						required
						data={eventsList.map((event) => ({
							value: event.id.toString(),
							label: `${event.shortName}${event.acceptingBackups && !event.acceptingSubmissions ? " (Backups)" : ""}`,
						}))}
					/>
				</div>
			)}

			{isBackupOnly && (
				<Checkbox
					ref={backupCheckboxRef}
					onChange={(e) => {
						setBackupAcknowledged(e.currentTarget.checked);
						if (e.currentTarget.checked) setBackupAcknowledgedError(false);
					}}
					checked={backupAcknowledged}
					error={backupAcknowledgedError ? "Please confirm you understand before submitting" : undefined}
					label="You understand that this is a submission for backup games"
				/>
			)}
			<div className={styles.formTop} ref={formTopRef} aria-hidden />
			<Stepper
				active={currentStep}
				onStepClick={(step) => {
					if (step < currentStep && currentStep < 5) setCurrentStep(step);
				}}
				allowNextStepsSelect={false}
				size="sm"
				classNames={{
					root: styles.stepper,
					stepDescription: styles.stepDescription,
					stepBody: styles.stepBody,
				}}
			>
				{STEPS.map((step, index) => (
					<Stepper.Step
						key={step.label}
						label={step.label}
						description={step.description}
						aria-current={index === currentStep ? "step" : undefined}
					/>
				))}
			</Stepper>

			<div className={styles.formAndData}>
				<Paper shadow="sm" withBorder className={styles.paper}>
					<div ref={stepContentRef} style={{ display: "contents" }}>
						{renderStep()}
					</div>
					{currentStep < 5 && (
						<div className={styles.pageControls}>
							<Button
								variant="default"
								disabled={loading}
								onClick={handleBack}
								leftSection={<ChevronLeft />}
								className={currentStep === 0 ? styles.hidden : undefined}
								aria-hidden={currentStep === 0}
								tabIndex={currentStep === 0 ? -1 : undefined}
							>
								Back
							</Button>
							<span className={styles.stepCount}>
								Step {currentStep + 1} of {STEPS.length}
							</span>
							<Button
								onClick={handleNext}
								loading={loading}
								variant={currentStep === 4 ? "filled" : "light"}
								rightSection={currentStep === 4 ? <Upload /> : <ChevronRight />}
							>
								{currentStep === 4 ? "Submit Run" : "Continue"}
							</Button>
						</div>
					)}
				</Paper>
				<CurrentSubmissionCard
					currentStep={currentStep}
					form={form}
					eventName={currentEvent.shortName}
					totalDays={eventLength}
					submitted={Boolean(submissionResults)}
				/>
			</div>
		</div>
	);
}

export default GameSubmissions;
