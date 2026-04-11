"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Checkbox, Group, Modal, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";

import { updateSubmission, type UpdateSubmissionValues } from "./update-submission-action";
import styles from "./edit-submission.module.css";

import type { Submission } from "#payload-types.ts";

type FormStatus = {
	message: string;
	type: "error" | "success";
} | null;

interface EditSubmissionModalProps {
	submission: Submission;
}

function valueToJsonText(value: Submission["donationIncentives"] | Submission["availability"]) {
	if (value === null || value === undefined || value === "") {
		return "";
	}

	if (typeof value === "string") {
		return value;
	}

	return JSON.stringify(value, null, 2);
}

function parseJsonField(value: string, fieldName: string) {
	const trimmedValue = value.trim();
	if (!trimmedValue) {
		return {
			error: null,
			value: null,
		};
	}

	try {
		return {
			error: null,
			value: JSON.parse(trimmedValue) as unknown,
		};
	} catch {
		return {
			error: `${fieldName} must be valid JSON.`,
			value: null,
		};
	}
}

export function EditSubmissionModal({ submission }: EditSubmissionModalProps) {
	const router = useRouter();
	const [opened, setOpened] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [status, setStatus] = useState<FormStatus>(null);

	const form = useForm<UpdateSubmissionValues & { donationIncentivesText: string; availabilityText: string }>({
		mode: "uncontrolled",
		initialValues: {
			game: submission.game ?? "",
			category: submission.category ?? "",
			platform: submission.platform ?? "",
			techPlatform: submission.techPlatform ?? "",
			estimate: submission.estimate ?? "",
			possibleEstimate: submission.possibleEstimate ?? "",
			possibleEstimateReason: submission.possibleEstimateReason ?? "",
			specialRequirements: submission.specialRequirements ?? "",
			video: submission.video ?? "",
			ageRating: submission.ageRating ?? null,
			raceType: submission.raceType ?? null,
			racer: submission.racer ?? "",
			isCoop: Boolean(submission.isCoop),
			canBackup: Boolean(submission.canBackup),
			donationIncentives: submission.donationIncentives ?? null,
			availability: submission.availability ?? null,
			donationIncentivesText: valueToJsonText(submission.donationIncentives),
			availabilityText: valueToJsonText(submission.availability),
		},
		validate: {
			game: (value) => (value.trim().length > 0 ? null : "Game is required."),
			category: (value) => (value.trim().length > 0 ? null : "Category is required."),
			platform: (value) => (value.trim().length > 0 ? null : "Platform is required."),
			estimate: (value) => (value.trim().length > 0 ? null : "Estimate is required."),
		},
	});

	const handleClose = () => {
		setOpened(false);
		setStatus(null);
		form.reset();
	};

	const handleSubmit = form.onSubmit((values) => {
		setStatus(null);
		form.clearErrors();

		const parsedDonationIncentives = parseJsonField(values.donationIncentivesText, "Donation incentives");
		const parsedAvailability = parseJsonField(values.availabilityText, "Availability");

		if (parsedDonationIncentives.error) {
			form.setFieldError("donationIncentivesText", parsedDonationIncentives.error);
			return;
		}

		if (parsedAvailability.error) {
			form.setFieldError("availabilityText", parsedAvailability.error);
			return;
		}

		startTransition(async () => {
			const result = await updateSubmission(submission.id, {
				game: values.game,
				category: values.category,
				platform: values.platform,
				techPlatform: values.techPlatform,
				estimate: values.estimate,
				possibleEstimate: values.possibleEstimate,
				possibleEstimateReason: values.possibleEstimateReason,
				specialRequirements: values.specialRequirements,
				video: values.video,
				ageRating: values.ageRating,
				raceType: values.raceType,
				racer: values.racer,
				isCoop: values.isCoop,
				canBackup: values.canBackup,
				donationIncentives: parsedDonationIncentives.value as Submission["donationIncentives"],
				availability: parsedAvailability.value as Submission["availability"],
			});

			setStatus({
				message: result.message,
				type: result.success ? "success" : "error",
			});

			if (result.success) {
				router.refresh();
				handleClose();
			}
		});
	});

	return (
		<>
			<Button className={styles.triggerButton} onClick={() => setOpened(true)} size="xs" variant="light">
				Edit submission
			</Button>
			<Modal opened={opened} onClose={handleClose} title="Edit submission" size="xl" centered>
				<form className={styles.form} onSubmit={handleSubmit}>
					<div className={styles.grid}>
						<TextInput key={form.key("game")} label="Game" required {...form.getInputProps("game")} />
						<TextInput
							key={form.key("category")}
							label="Category"
							required
							{...form.getInputProps("category")}
						/>
						<TextInput
							key={form.key("platform")}
							label="Platform"
							required
							{...form.getInputProps("platform")}
						/>
						<TextInput
							key={form.key("techPlatform")}
							label="Tech Platform"
							{...form.getInputProps("techPlatform")}
						/>
						<TextInput
							key={form.key("estimate")}
							label="Estimate"
							required
							{...form.getInputProps("estimate")}
						/>
						<TextInput
							key={form.key("possibleEstimate")}
							label="Possible estimate"
							{...form.getInputProps("possibleEstimate")}
						/>
						<Select
							clearable
							data={[
								{ label: "G, PG or M", value: "m_or_lower" },
								{ label: "MA15+", value: "ma15" },
								{ label: "R18+", value: "r18" },
							]}
							key={form.key("ageRating")}
							label="Age rating"
							{...form.getInputProps("ageRating")}
						/>
						<Select
							clearable
							data={[
								{ label: "No Race", value: "noRace" },
								{ label: "Possible Solo", value: "solo" },
								{ label: "Only Race/Co-op", value: "only" },
							]}
							key={form.key("raceType")}
							label="Race type"
							{...form.getInputProps("raceType")}
						/>
						<TextInput key={form.key("racer")} label="Racer" {...form.getInputProps("racer")} />
						<TextInput key={form.key("video")} label="Video URL" {...form.getInputProps("video")} />
						<Textarea
							className={styles.fullWidth}
							autosize
							key={form.key("possibleEstimateReason")}
							label="Possible estimate reason"
							minRows={2}
							{...form.getInputProps("possibleEstimateReason")}
						/>
						<Textarea
							className={styles.fullWidth}
							autosize
							key={form.key("specialRequirements")}
							label="Special requirements"
							minRows={2}
							{...form.getInputProps("specialRequirements")}
						/>
						<Textarea
							className={styles.fullWidth}
							autosize
							description="Raw JSON. Leave empty to clear this field."
							key={form.key("donationIncentivesText")}
							label="Donation incentives"
							minRows={3}
							{...form.getInputProps("donationIncentivesText")}
						/>
						<Textarea
							className={styles.fullWidth}
							autosize
							description="Raw JSON. Leave empty to clear this field."
							key={form.key("availabilityText")}
							label="Availability"
							minRows={3}
							{...form.getInputProps("availabilityText")}
						/>
						<Stack className={styles.fullWidth} gap="xs">
							<Checkbox
								key={form.key("isCoop")}
								label="Co-op run"
								{...form.getInputProps("isCoop", { type: "checkbox" })}
							/>
							<Checkbox
								key={form.key("canBackup")}
								label="Can backup"
								{...form.getInputProps("canBackup", { type: "checkbox" })}
							/>
						</Stack>
					</div>

					{status && (
						<Alert
							className={styles.status}
							color={status.type === "error" ? "red" : "green"}
							role="status"
						>
							{status.message}
						</Alert>
					)}

					<Group className={styles.actions} mt="sm">
						<Button onClick={handleClose} type="button" variant="default">
							Cancel
						</Button>
						<Button loading={isPending} type="submit">
							Save changes
						</Button>
					</Group>
				</form>
			</Modal>
		</>
	);
}
