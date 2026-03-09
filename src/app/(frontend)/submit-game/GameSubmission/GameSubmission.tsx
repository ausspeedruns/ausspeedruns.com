"use client";

import { useState } from "react";
import styles from "./GameSubmission.module.css";

import { Checkbox, Stepper, Paper, Button, Select } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { GameSubmissionResults } from "./submissionTypes";
import CurrentSubmissionCard from "./components/CurrentSubmissionCard";
import { createSubmission } from "./game-submission-action";
import { GameInfo } from "./pages/game-info";
import { RunInfo } from "./pages/run-info";
import { Availability } from "./pages/availability";
import { Acknowledgement } from "./pages/acknowledgement";
import { SubmissionResults } from "./pages/results";
import { RaceCoop } from "./pages/race-coop";
import { useForm } from "@mantine/form";
import type { OldSubmission } from "./components/PreviousSubmissions";
import type { Submission } from "#payload-types.ts";

interface GameSubmissionsProps {
	availableEvents: {
		id: number;
		shortname: string;
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
	// const [state, formAction] = useActionState(createSubmissionFromForm, null);
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

	const mobileWidth = useMediaQuery("(max-width: 600px)");

	const [backup, setBackup] = useState(true);
	const [currentStep, setCurrentStep] = useState(0);

	const currentEvent = eventsList?.find((eventResult) => eventResult.id === form.values.event);

	function handleNext() {
		setCurrentStep((current) => {
			if (form.validate().hasErrors) {
				return current;
			}

			// Submit form
			if (currentStep === 4) {
				handleSubmission(form.values);
			}

			if (current < 5) {
				return current + 1;
			}

			return current;
		});
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
			setLoading(false);
		}
	}

	return (
		// <form className={styles.gameForm} action={createSubmissionFromForm} ref={formRef}>
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
			<div className={styles.formAndData}>
				<Paper shadow="md" className={styles.paper}>
					<Stepper
						active={currentStep}
						onStepClick={setCurrentStep}
						className={styles.stepper}
						// orientation={mobileWidth ? "vertical" : "horizontal"}
					>
						<Stepper.Step label="Game">
							<GameInfo
								// show={currentStep === 0}
								previousSubmissions={props.oldSubmissions}
								// ref={gameInfoRef}
								// onComplete={(isComplete) => setCanComplete(isComplete)}
								form={form}
							/>
						</Stepper.Step>
						<Stepper.Step label="Speedrun">
							<RunInfo form={form} />
						</Stepper.Step>
						<Stepper.Step label="Availability">
							<Availability event={currentEvent} form={form} />
						</Stepper.Step>
						<Stepper.Step label="Race/Co-op Opt-in">
							<RaceCoop form={form} />
						</Stepper.Step>
						<Stepper.Step label="Submit">
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
							<Button disabled={currentStep === 0 || currentStep > 4} onClick={handleBack}>
								Back
							</Button>
							<Button
								onClick={handleNext}
								// disabled={!canComplete}
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
						form={form}
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
		</div>
	);
}

export default GameSubmissions;
