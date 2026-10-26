"use client";

import { useRef, useState } from "react";
import styles from "./GameSubmission.module.css";

import { Checkbox, Stepper, Paper, Button, Select } from "@mantine/core";
import type { GameSubmissionResults } from "./submissionTypes";
import CurrentSubmissionCard from "./components/CurrentSubmissionCard";
import { createSubmission } from "./gameSubmissionAction";
import { GameInfo } from "./steps/GameInfoStep";
import { RunInfo } from "./steps/RunInfoStep";
import { Availability } from "./steps/AvailabilityStep";
import { Acknowledgement } from "./steps/AcknowledgementStep";
import { SubmissionResults } from "./steps/ResultsStep";
import { RaceCoop } from "./steps/RaceCoopStep";
import { useForm } from "@mantine/form";
import type { OldSubmission } from "./components/PreviousSubmissions";
import type { Submission } from "#payload-types.ts";

interface GameSubmissionsProps {
	availableEvents: {
		id: number;
		shortName: string;
		acceptingSubmissions: boolean;
		acceptingBackups: boolean;
		startDate: string;
		endDate: string;
		eventTimezone: string;
		submissionInstructions: any | null;
	}[];
	oldSubmissions: OldSubmission[];
}

function GameSubmissions(props: GameSubmissionsProps) {
	const [loading, setLoading] = useState(false);
	const [submissionResults, setSubmissionResults] = useState<Submission | null>(null);
	const form = useForm<GameSubmissionResults>({
		mode: "uncontrolled",
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

		validate: (values) => {
			if (currentStep === 0) {
				return {
					game: values.game ? null : "Please enter a game",
					platform: values.platform ? null : "Please enter a platform",
					techPlatform: values.techPlatform ? null : "Please enter a tech platform",
				};
			}

			if (currentStep === 1) {
				return {
					category: values.category ? null : "Please enter a category",
					video: values.video ? null : "Please enter a video link",
					estimate: values.estimate !== "00:00:00" ? null : "Please enter an estimate",
					possibleEstimate: values.possibleEstimate
						? values.possibleEstimate === "00:00:00"
							? "Please enter a possible estimate"
							: null
						: null,
					possibleEstimateReason:
						values.possibleEstimateReason === "" ? "Please enter a reason for the possible estimate" : null,
					donationIncentives:
						values.donationIncentives && values.donationIncentives.length > 0
							? values.donationIncentives.some((incentive) => !incentive.title)
								? "Please fill out all donation incentive titles"
								: null
							: null,
				};
			}

			if (currentStep === 2) {
				return {
					availability:
						values.availability.length > 0 && values.availability.some((days) => days)
							? null
							: "Please select at least one availability option",
				};
			}

			// Step 3 (Race / Co-op) has no required fields
			if (currentStep === 3) {
				return {};
			}

			// Step 4 (Acknowledgement) has no fields
			if (currentStep === 4) {
				return {};
			}

			return {};
		},
	});
	const eventsList = props.availableEvents;

	const [backup, setBackup] = useState(true);
	const [currentStep, setCurrentStep] = useState(0);
	const submissionInFlightRef = useRef(false);

	const currentEvent = eventsList?.find((eventResult) => eventResult.id === form.values.event);

	function handleNext() {
		if (form.validate().hasErrors) {
			return;
		}

		if (currentStep === 4) {
			if (submissionInFlightRef.current) {
				return;
			}

			submissionInFlightRef.current = true;
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
	}

	if (!currentEvent) {
		return <h2>Event not found</h2>;
	}

	async function handleSubmission(values: typeof form.values) {
		setLoading(true);
		try {
			const result = await createSubmission(values);

			if (result.success) {
				console.log("Submission successful:", result.data);
				// notifications.show({
				// 	title: "Sent",
				// 	message: "Form submitted successfully",
				// 	color: "green",
				// });
				// form.reset();
				setSubmissionResults(result.data ?? null);
			} else {
				console.error("Submission error:", result.error);
				// notifications.show({
				// 	title: "Error",
				// 	message: result.error ?? "Something went wrong",
				// 	color: "red",
				// });
			}
		} catch {
			// notifications.show({
			// 	title: "Error",
			// 	message: "Network error",
			// 	color: "red",
			// });
			console.error("Network error");
		} finally {
			submissionInFlightRef.current = false;
			setLoading(false);
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
						required
						data={eventsList.map((event) => ({
							value: event.id.toString(),
							label: `${event.shortName}${event.acceptingBackups && !event.acceptingSubmissions ? " (Backups)" : ""}`,
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
			<div className={styles.formAndData}>
				<Paper shadow="sm" withBorder className={styles.paper}>
					<Stepper
						active={currentStep}
						onStepClick={(step) => {
							if (step < currentStep) setCurrentStep(step);
						}}
						className={styles.stepper}
						size="sm"
					>
						<Stepper.Step label="Game" description="Title &amp; platform">
							<GameInfo previousSubmissions={props.oldSubmissions} form={form} />
						</Stepper.Step>
						<Stepper.Step label="Speedrun" description="Category &amp; estimate">
							<RunInfo form={form} />
						</Stepper.Step>
						<Stepper.Step label="Availability" description="Event days">
							<Availability event={currentEvent} form={form} />
						</Stepper.Step>
						<Stepper.Step label="Race/Co-op" description="Optional">
							<RaceCoop form={form} />
						</Stepper.Step>
						<Stepper.Step label="Submit" description="Review &amp; confirm">
							<Acknowledgement
								acceptingBackups={currentEvent?.acceptingBackups ?? false}
								acceptingSubmissions={currentEvent?.acceptingSubmissions ?? false}
								submissionInstructions={currentEvent?.submissionInstructions.document}
								form={form}
							/>
						</Stepper.Step>
						<Stepper.Completed>
							<SubmissionResults resetForm={resetForm} results={submissionResults} loading={loading} />
						</Stepper.Completed>
					</Stepper>
					{currentStep < 5 && (
						<div className={styles.pageControls}>
							<Button
								variant="default"
								disabled={loading || currentStep === 0 || currentStep > 4}
								onClick={handleBack}
							>
								Back
							</Button>
							<Button
								onClick={handleNext}
								disabled={loading}
								variant={currentStep === 4 ? "filled" : "light"}
							>
								{currentStep === 4 ? "Submit Run" : "Continue"}
							</Button>
						</div>
					)}
				</Paper>
				{currentStep !== 5 && <CurrentSubmissionCard currentStep={currentStep} form={form} />}
			</div>
		</div>
	);
}

export default GameSubmissions;
