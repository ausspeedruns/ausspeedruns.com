"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Checkbox, Group, Modal, NumberInput, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

import { updateVolunteer, type UpdateVolunteerValues } from "./update-volunteer-action.ts";
import styles from "./edit-volunteer.module.css";

import type { Volunteer } from "#payload-types.ts";

type VolunteerRole = Volunteer["role"][number];

type FormStatus = {
	message: string;
	type: "error" | "success";
} | null;

interface EditVolunteerModalProps {
	volunteer: Volunteer;
}

const ROLE_OPTIONS: { label: string; value: VolunteerRole }[] = [
	{ label: "Front Desk", value: "frontDesk" },
	{ label: "Host", value: "host" },
	{ label: "Tech", value: "tech" },
	{ label: "Stage Hand", value: "stageHand" },
];

function toAvailabilityText(value: Volunteer["availability"]) {
	if (!value || value.length === 0) return "";

	return value
		.map((slot) => slot.time?.trim() ?? "")
		.filter(Boolean)
		.join("\n");
}

export function EditVolunteerModal({ volunteer }: EditVolunteerModalProps) {
	const router = useRouter();
	const [opened, setOpened] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [status, setStatus] = useState<FormStatus>(null);

	const form = useForm<UpdateVolunteerValues & { availabilityText: string }>({
		mode: "controlled",
		initialValues: {
			role: volunteer.role ?? [],
			availability: [],
			availabilityText: toAvailabilityText(volunteer.availability),
			maximumTime: volunteer.maximumTime,
			maxDailyHostTime: volunteer.maxDailyHostTime,
			hostSpecificGame: volunteer.hostSpecificGame ?? "",
			hostSpecificRunner: volunteer.hostSpecificRunner ?? "",
			hostOtherInformation: volunteer.hostOtherInformation ?? "",
			techExperience: volunteer.techExperience ?? "",
		},
		validate: {
			role: (value: VolunteerRole[]) => (value.length > 0 ? null : "Select at least one role."),
		},
	});

	const selectedRoles = form.values.role;
	const hasHost = selectedRoles.includes("host");
	const hasTech = selectedRoles.includes("tech");

	const handleClose = () => {
		setOpened(false);
		setStatus(null);
		form.reset();
	};

	const handleSubmit = form.onSubmit((values) => {
		setStatus(null);

		const availability = values.availabilityText
			.split("\n")
			.map((line: string) => line.trim())
			.filter((line: string) => line.length > 0);

		startTransition(async () => {
			const result = await updateVolunteer(volunteer.id, {
				role: values.role,
				availability,
				maximumTime: values.maximumTime,
				maxDailyHostTime: hasHost ? values.maxDailyHostTime : null,
				hostSpecificGame: hasHost ? values.hostSpecificGame : "",
				hostSpecificRunner: hasHost ? values.hostSpecificRunner : "",
				hostOtherInformation: hasHost ? values.hostOtherInformation : "",
				techExperience: hasTech ? values.techExperience : "",
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
				Edit application
			</Button>
			<Modal opened={opened} onClose={handleClose} title="Edit volunteer application" size="lg" centered>
				<form className={styles.form} onSubmit={handleSubmit}>
					<Stack gap="sm">
						<Checkbox.Group
							label="Roles"
							required
							value={form.values.role}
							error={form.errors.role}
							onChange={(value) => form.setFieldValue("role", value as VolunteerRole[])}
						>
							<Group mt="xs">
								{ROLE_OPTIONS.map((option) => (
									<Checkbox key={option.value} value={option.value} label={option.label} />
								))}
							</Group>
						</Checkbox.Group>

						<NumberInput
							label="Maximum total time (hours)"
							min={0}
							{...form.getInputProps("maximumTime")}
						/>

						<Textarea
							autosize
							description="One line per day or timeslot."
							label="Availability"
							minRows={4}
							placeholder="Friday: 9am - 2pm&#10;Saturday: all day"
							{...form.getInputProps("availabilityText")}
						/>

						{hasHost && (
							<>
								<Text fw={600} size="sm">
									Host details
								</Text>
								<NumberInput
									label="Max daily host time (hours)"
									min={0}
									{...form.getInputProps("maxDailyHostTime")}
								/>
								<TextInput label="Specific game" {...form.getInputProps("hostSpecificGame")} />
								<TextInput label="Specific runner" {...form.getInputProps("hostSpecificRunner")} />
								<Textarea
									autosize
									label="Other host information"
									minRows={2}
									{...form.getInputProps("hostOtherInformation")}
								/>
							</>
						)}

						{hasTech && (
							<Textarea
								autosize
								label="Tech experience"
								minRows={3}
								{...form.getInputProps("techExperience")}
							/>
						)}
					</Stack>

					{status && (
						<Alert
							className={styles.status}
							color={status.type === "error" ? "red" : "green"}
							role="status"
						>
							{status.message}
						</Alert>
					)}

					<Group className={styles.actions} mt="md">
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
