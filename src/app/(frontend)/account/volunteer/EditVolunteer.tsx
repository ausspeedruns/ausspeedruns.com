"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Group, Modal, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { Pencil, Trash } from "pixelarticons/react";

import { VolunteerFields } from "#/app/(frontend)/volunteer/VolunteerFields";
import { getVolunteerErrors, type VolunteerFormValues } from "#/app/(frontend)/volunteer/validateVolunteer";
import { getEventDays } from "#/utilities/getEventDays";

import { updateVolunteer, withdrawVolunteer } from "./updateVolunteerAction";
import { formValuesToVolunteerUpdate, volunteerToFormValues } from "./volunteerFormMapping";
import styles from "./EditVolunteer.module.css";

import type { Volunteer } from "#payload-types.ts";

export interface VolunteerEventInfo {
	name: string;
	startDate: string;
	endDate: string;
	eventTimezone: string;
	acceptingVolunteers: boolean;
}

interface EditVolunteerModalProps {
	volunteer: Volunteer;
	event: VolunteerEventInfo;
}

export function EditVolunteerModal({ volunteer, event }: EditVolunteerModalProps) {
	const router = useRouter();
	const isMobile = useMediaQuery("(max-width: 48em)");
	const bodyRef = useRef<HTMLDivElement>(null);
	const [opened, setOpened] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);
	const [confirmWithdraw, setConfirmWithdraw] = useState(false);
	const [isPending, startTransition] = useTransition();

	const eventDays = getEventDays(event.startDate, event.endDate);

	function initialValues(): VolunteerFormValues {
		const values = volunteerToFormValues(volunteer);
		return { ...values, dayTimes: Array.from({ length: eventDays }, (_, i) => values.dayTimes[i] ?? "") };
	}

	const form = useForm<VolunteerFormValues>({
		mode: "controlled",
		initialValues: initialValues(),
	});

	function open() {
		form.setValues(initialValues());
		form.resetDirty();
		form.clearErrors();
		setError(null);
		setConfirmWithdraw(false);
		setSaved(false);
		setOpened(true);
	}

	function close() {
		if (isPending) return;
		setOpened(false);
	}

	function handleSave() {
		setError(null);

		const errors = getVolunteerErrors(form.values, eventDays);
		form.setErrors(errors);
		if (Object.keys(errors).length > 0) {
			requestAnimationFrame(() => {
				bodyRef.current
					?.querySelector('[aria-invalid="true"], .mantine-InputWrapper-error, .mantine-Checkbox-error')
					?.scrollIntoView({ behavior: "smooth", block: "center" });
			});
			return;
		}

		startTransition(async () => {
			const result = await updateVolunteer(
				volunteer.id,
				formValuesToVolunteerUpdate(form.values, eventDays, volunteer),
			);

			if (!result.success) {
				setError(result.message);
				return;
			}

			setOpened(false);
			setSaved(true);
			router.refresh();
		});
	}

	function handleWithdraw() {
		if (!confirmWithdraw) {
			setConfirmWithdraw(true);
			return;
		}

		setError(null);
		startTransition(async () => {
			const result = await withdrawVolunteer(volunteer.id);

			if (!result.success) {
				setError(result.message);
				setConfirmWithdraw(false);
				return;
			}

			setOpened(false);
			router.refresh();
		});
	}

	return (
		<>
			<Group gap="sm">
				<Button onClick={open} size="xs" variant="light" leftSection={<Pencil width={14} height={14} />}>
					Edit application
				</Button>
				{saved && (
					<Text size="sm" c="green" role="status">
						Changes saved
					</Text>
				)}
			</Group>

			<Modal
				opened={opened}
				onClose={close}
				title={<span className={styles.modalTitle}>Edit volunteer application</span>}
				size="xl"
				fullScreen={isMobile}
				centered
			>
				<div className={styles.body} ref={bodyRef}>
					<p className={styles.eventName}>{event.name}</p>

					<VolunteerFields form={form} event={event} eventLength={eventDays} />

					{error && (
						<Alert color="red" variant="light" title="Couldn't save your changes">
							{error}
						</Alert>
					)}

					<div className={styles.footer}>
						<div className={styles.withdraw}>
							{confirmWithdraw ? (
								<>
									<Text size="sm">Withdraw this application?</Text>
									<Button size="xs" color="red" loading={isPending} onClick={handleWithdraw}>
										Yes, withdraw
									</Button>
									<Button
										size="xs"
										variant="subtle"
										color="gray"
										onClick={() => setConfirmWithdraw(false)}
									>
										Keep
									</Button>
								</>
							) : (
								<Button
									variant="subtle"
									color="red"
									size="sm"
									onClick={handleWithdraw}
									leftSection={<Trash width={14} height={14} />}
								>
									Withdraw application
								</Button>
							)}
						</div>
						<Group gap="sm">
							<Button variant="default" onClick={close} disabled={isPending}>
								Cancel
							</Button>
							<Button
								onClick={handleSave}
								loading={isPending && !confirmWithdraw}
								disabled={!form.isDirty() || confirmWithdraw}
							>
								Save changes
							</Button>
						</Group>
					</div>
				</div>
			</Modal>
		</>
	);
}
