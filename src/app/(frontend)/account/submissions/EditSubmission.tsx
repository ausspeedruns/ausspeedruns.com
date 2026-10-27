"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Checkbox, Group, Modal, Tabs, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { Pencil, Trash } from "pixelarticons/react";

import gameStyles from "#/app/(frontend)/submit-game/GameSubmission/GameSubmission.module.css";
import { GameInfo } from "#/app/(frontend)/submit-game/GameSubmission/steps/GameInfoStep";
import { RunInfo } from "#/app/(frontend)/submit-game/GameSubmission/steps/RunInfoStep";
import { Availability } from "#/app/(frontend)/submit-game/GameSubmission/steps/AvailabilityStep";
import { RaceCoop } from "#/app/(frontend)/submit-game/GameSubmission/steps/RaceCoopStep";
import { getStepErrors } from "#/app/(frontend)/submit-game/GameSubmission/validateSubmission";
import type { GameSubmissionResults } from "#/app/(frontend)/submit-game/GameSubmission/submissionTypes";
import { getEventDays } from "#/utilities/getEventDays";

import { updateSubmission, withdrawSubmission } from "./updateSubmissionAction";
import { formValuesToUpdate, submissionToFormValues } from "./submissionFormMapping";
import styles from "./EditSubmission.module.css";

import type { Submission } from "#payload-types.ts";

export interface SubmissionEventInfo {
	name: string;
	startDate: string;
	endDate: string;
	eventTimezone: string;
	acceptingSubmissions: boolean;
	acceptingBackups: boolean;
}

interface EditSubmissionModalProps {
	submission: Submission;
	event: SubmissionEventInfo;
}

const TABS = [
	{ value: "game", label: "Game" },
	{ value: "speedrun", label: "Speedrun" },
	{ value: "availability", label: "Availability" },
	{ value: "race", label: "Race/Co-op" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export function EditSubmissionModal({ submission, event }: EditSubmissionModalProps) {
	const router = useRouter();
	const isMobile = useMediaQuery("(max-width: 48em)");
	const [opened, setOpened] = useState(false);
	const [activeTab, setActiveTab] = useState<TabValue>("game");
	const [tabsWithErrors, setTabsWithErrors] = useState<TabValue[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);
	const [confirmWithdraw, setConfirmWithdraw] = useState(false);
	const [isPending, startTransition] = useTransition();

	const eventDays = getEventDays(event.startDate, event.endDate);
	const form = useForm<GameSubmissionResults>({
		mode: "controlled",
		initialValues: submissionToFormValues(submission),
	});

	function open() {
		form.setValues(submissionToFormValues(submission));
		form.resetDirty();
		form.clearErrors();
		setActiveTab("game");
		setTabsWithErrors([]);
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

		const errors: Record<string, string> = {};
		const failingTabs: TabValue[] = [];
		TABS.forEach((tab, step) => {
			const stepErrors = getStepErrors(step, form.values, eventDays);
			if (Object.keys(stepErrors).length > 0) {
				failingTabs.push(tab.value);
				Object.assign(errors, stepErrors);
			}
		});

		form.setErrors(errors);
		setTabsWithErrors(failingTabs);
		if (failingTabs.length > 0) {
			setActiveTab(failingTabs[0]);
			return;
		}

		startTransition(async () => {
			const result = await updateSubmission(submission.id, formValuesToUpdate(form.values, eventDays));

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
			const result = await withdrawSubmission(submission.id);

			if (!result.success) {
				setError(result.message);
				setConfirmWithdraw(false);
				return;
			}

			setOpened(false);
			router.refresh();
		});
	}

	const showBackupOption = event.acceptingSubmissions && event.acceptingBackups;

	return (
		<>
			<Group gap="sm">
				<Button onClick={open} size="xs" variant="light" leftSection={<Pencil width={14} height={14} />}>
					Edit submission
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
				title={<span className={styles.modalTitle}>Edit {submission.game}</span>}
				size="xl"
				fullScreen={isMobile}
				centered
			>
				<div className={`${gameStyles.gameForm} ${styles.body}`}>
					<p className={styles.eventName}>{event.name}</p>

					<Tabs value={activeTab} onChange={(value) => value && setActiveTab(value as TabValue)}>
						<Tabs.List grow>
							{TABS.map((tab) => (
								<Tabs.Tab
									key={tab.value}
									value={tab.value}
									rightSection={
										tabsWithErrors.includes(tab.value) ? (
											<span className={styles.errorDot} aria-label="Has errors" />
										) : null
									}
								>
									{tab.label}
								</Tabs.Tab>
							))}
						</Tabs.List>

						<Tabs.Panel value="game" pt="lg">
							<GameInfo form={form} />
						</Tabs.Panel>
						<Tabs.Panel value="speedrun" pt="lg">
							<RunInfo form={form} />
						</Tabs.Panel>
						<Tabs.Panel value="availability" pt="lg">
							<Availability event={event} eventLength={eventDays} form={form} />
						</Tabs.Panel>
						<Tabs.Panel value="race" pt="lg">
							<RaceCoop form={form} />
						</Tabs.Panel>
					</Tabs>

					{showBackupOption && (
						<Checkbox
							label="Allow as backup run"
							description="If your run isn't picked for the main schedule, it may still be used as a backup."
							checked={form.values.backup}
							onChange={(e) => form.setFieldValue("backup", e.currentTarget.checked)}
						/>
					)}

					{error && (
						<Alert color="red" variant="light" title="Couldn't save your changes">
							{error}
						</Alert>
					)}

					<div className={styles.footer}>
						<div className={styles.withdraw}>
							{confirmWithdraw ? (
								<>
									<Text size="sm">Withdraw this submission?</Text>
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
									Withdraw submission
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
