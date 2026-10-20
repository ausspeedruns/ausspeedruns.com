"use client";

import {
	Accordion,
	Alert,
	Anchor,
	Badge,
	Button,
	Card,
	Checkbox,
	Group,
	Radio,
	ScrollArea,
	Stack,
	Table,
	Text,
	Title,
} from "@mantine/core";
import { useState } from "react";

import type { FinalisePlan } from "#/utilities/schedule/finalise.ts";
import { formatInTz } from "#/utilities/schedule/timing.ts";
import type { ApplyResult, BackupRule } from "#/utilities/schedule/types.ts";
import type { ScheduleIssue } from "#/utilities/schedule/validation.ts";
import { ApiError } from "../api.ts";
import { ConfirmModal, errorMessage, notify } from "../components/feedback.tsx";
import { fillLink, useSchedule, type StepId } from "../context.tsx";

const STEP_LABELS: Record<ScheduleIssue["step"], string> = {
	import: "Import",
	timing: "Timing",
	incentives: "Incentives",
	pairing: "Pairing",
	apply: "Apply",
};

const BACKUP_RULES: { value: BackupRule; label: string; description: string }[] = [
	{
		value: "acceptedRunnersOnly",
		label: "Only runners who already have an accepted run",
		description: "They'll be at the event anyway, so they're the most reliable backups.",
	},
	{ value: "all", label: "Everyone who said they're willing to be a backup", description: "" },
	{ value: "none", label: "No backups", description: "Every unscheduled submission is rejected." },
];

const STATUS_COLOURS: Record<string, string> = {
	accepted: "green",
	backup: "blue",
	rejected: "red",
	pending: "gray",
};

type ModalId = "replace" | "reset" | "finalise" | "rebuild" | null;

export function ApplyStep() {
	const { api, data, issues, flush, reload, goToStep, links, timed } = useSchedule();
	const [busy, setBusy] = useState<string | null>(null);
	const [modal, setModal] = useState<ModalId>(null);
	const [result, setResult] = useState<ApplyResult | null>(null);
	const [untracked, setUntracked] = useState(0);
	const [resetSubmissions, setResetSubmissions] = useState(false);
	const [backupRule, setBackupRule] = useState<BackupRule>("acceptedRunnersOnly");
	const [skipReviewed, setSkipReviewed] = useState(false);
	const [plan, setPlan] = useState<FinalisePlan | null>(null);

	const errors = issues.filter((issue) => issue.level === "error");
	const warnings = issues.filter((issue) => issue.level === "warning");
	const applied = data.draft.status === "applied";
	const tz = data.event.timezone;
	const runsLink = fillLink(links.runs, { eventId: data.event.id });
	const incentivesLink = fillLink(links.incentives, { eventId: data.event.id });

	async function run<T>(label: string, action: () => Promise<T>): Promise<T | undefined> {
		setBusy(label);
		try {
			await flush();
			return await action();
		} catch (error) {
			const count =
				error instanceof ApiError && error.status === 409
					? (error.details as { untrackedRuns?: number } | undefined)?.untrackedRuns
					: undefined;
			if (count) {
				setUntracked(count);
				setModal("replace");
			} else {
				notify.error(errorMessage(error));
			}
			return undefined;
		} finally {
			setBusy(null);
		}
	}

	async function apply(replaceUntracked = false) {
		const applyResult = await run("apply", () => api.apply(replaceUntracked));
		if (!applyResult) return;
		setResult(applyResult);
		setPlan(null);
		notify.success(
			`Schedule applied: ${applyResult.created} created, ${applyResult.updated} updated, ${applyResult.deleted} removed.`,
		);
		await reload();
	}

	async function preview() {
		const preview = await run("preview", () => api.finalise({ backupRule, skipReviewed }, true));
		if (preview) setPlan(preview);
	}

	const issueList = (list: ScheduleIssue[]) => (
		<Stack gap={4}>
			{list.slice(0, 50).map((issue, i) => (
				<Group key={`${issue.message}-${i}`} gap="xs" wrap="nowrap" align="flex-start">
					<Button
						size="compact-xs"
						variant="light"
						color={issue.level === "error" ? "red" : "yellow"}
						onClick={() => goToStep(issue.step as StepId)}
					>
						{STEP_LABELS[issue.step]}
					</Button>
					<Text size="sm">{issue.message}</Text>
				</Group>
			))}
			{list.length > 50 && (
				<Text size="sm" c="dimmed">
					…and {list.length - 50} more
				</Text>
			)}
		</Stack>
	);

	return (
		<Stack gap="xl">
			<Stack>
				<Title order={3}>1. Apply the schedule</Title>
				<Text size="sm" c="dimmed">
					Creates (or updates) the event&apos;s runs and incentives from this draft and sets the event end
					time. Re-applying after edits updates the existing runs in place and keeps incentive totals; rows
					you removed are deleted. The public schedule only shows once the event&apos;s schedule is published.
				</Text>

				{applied && (
					<Alert color="green">
						Applied{" "}
						{data.draft.appliedAt ? formatInTz(data.draft.appliedAt, tz, "ddd D MMM YYYY, h:mm A") : ""} (
						{data.draft.appliedRunCount} rows).
						{runsLink && (
							<>
								{" "}
								<Anchor href={runsLink} inherit>
									View runs
								</Anchor>
							</>
						)}
						{incentivesLink && (
							<>
								{" · "}
								<Anchor href={incentivesLink} inherit>
									View incentives
								</Anchor>
							</>
						)}
					</Alert>
				)}

				{errors.length > 0 && (
					<Alert color="red" title={`${errors.length} error(s) must be fixed before applying`}>
						{issueList(errors)}
					</Alert>
				)}
				{warnings.length > 0 && (
					<Accordion variant="contained">
						<Accordion.Item value="warnings">
							<Accordion.Control>
								<Group gap="xs">
									<Badge color="yellow" variant="light">
										{warnings.length}
									</Badge>
									<Text size="sm">warning(s) — review before applying</Text>
								</Group>
							</Accordion.Control>
							<Accordion.Panel>{issueList(warnings)}</Accordion.Panel>
						</Accordion.Item>
					</Accordion>
				)}

				<Group>
					<Button
						loading={busy === "apply"}
						disabled={errors.length > 0 || (busy !== null && busy !== "apply") || timed.length === 0}
						onClick={() => void apply()}
					>
						{applied ? "Re-apply changes" : "Apply schedule"}
					</Button>
					{applied && (
						<Button component="a" href={api.horaroUrl} variant="default">
							Export for Horaro
						</Button>
					)}
				</Group>

				{result && (
					<Card withBorder>
						<Stack gap={4}>
							<Text fw={600}>Result</Text>
							<Text size="sm">
								Runs: {result.created} created, {result.updated} updated, {result.deleted} removed.
								Incentives: {result.incentives.created} created, {result.incentives.updated} updated,{" "}
								{result.incentives.deleted} removed.
							</Text>
							{result.gamesCreated.length > 0 && (
								<Text size="sm">New games created: {result.gamesCreated.join(", ")}</Text>
							)}
							{result.endTime && (
								<Text size="sm">
									Event end time set to {formatInTz(result.endTime, tz, "ddd D MMM, h:mm A")}.
								</Text>
							)}
						</Stack>
					</Card>
				)}
			</Stack>

			<Stack>
				<Title order={3}>2. Finalise submissions</Title>
				<Text size="sm" c="dimmed">
					Marks every submission linked to a scheduled run (including race/co-op partners) as{" "}
					<strong>accepted</strong>, applies the backup rule below, and rejects the rest. Uses the live runs,
					so apply first.
					{data.draft.finalisedAt
						? ` Last finalised ${formatInTz(data.draft.finalisedAt, tz, "ddd D MMM, h:mm A")}.`
						: ""}
				</Text>
				<Radio.Group
					label="Who becomes a backup?"
					value={backupRule}
					onChange={(value) => {
						setBackupRule(value as BackupRule);
						setPlan(null);
					}}
				>
					<Stack gap="xs" mt="xs">
						{BACKUP_RULES.map((rule) => (
							<Radio
								key={rule.value}
								value={rule.value}
								label={rule.label}
								description={rule.description}
							/>
						))}
					</Stack>
				</Radio.Group>
				<Checkbox
					label="Leave submissions that have already been reviewed (not pending) unchanged, unless they're now scheduled"
					checked={skipReviewed}
					onChange={(event) => {
						setSkipReviewed(event.currentTarget.checked);
						setPlan(null);
					}}
				/>
				<Group>
					<Button
						variant="default"
						loading={busy === "preview"}
						disabled={!applied || (busy !== null && busy !== "preview")}
						onClick={() => void preview()}
					>
						Preview changes
					</Button>
					<Button
						disabled={!plan || plan.changes.length === 0 || busy !== null}
						onClick={() => setModal("finalise")}
					>
						Update {plan?.changes.length ?? 0} submissions
					</Button>
				</Group>
				{plan && (
					<Card withBorder>
						<Stack gap="sm">
							<Group gap="xs">
								<Badge color="green" variant="light">
									{plan.counts.accepted} accepted
								</Badge>
								<Badge color="blue" variant="light">
									{plan.counts.backup} backup
								</Badge>
								<Badge color="red" variant="light">
									{plan.counts.rejected} rejected
								</Badge>
								{plan.counts.pending > 0 && (
									<Badge color="gray" variant="light">
										{plan.counts.pending} pending
									</Badge>
								)}
								<Text size="sm" c="dimmed">
									{plan.changes.length} change(s), {plan.unchanged} already correct
								</Text>
							</Group>
							{plan.changes.length > 0 && (
								<ScrollArea.Autosize mah={320}>
									<Table striped stickyHeader verticalSpacing={4}>
										<Table.Thead>
											<Table.Tr>
												<Table.Th>Runner</Table.Th>
												<Table.Th>Game</Table.Th>
												<Table.Th>Category</Table.Th>
												<Table.Th>From</Table.Th>
												<Table.Th>To</Table.Th>
											</Table.Tr>
										</Table.Thead>
										<Table.Tbody>
											{plan.changes.map((change) => (
												<Table.Tr key={change.id}>
													<Table.Td>{change.runnerUsername}</Table.Td>
													<Table.Td>{change.game}</Table.Td>
													<Table.Td>{change.category}</Table.Td>
													<Table.Td>
														<Badge color={STATUS_COLOURS[change.from]} variant="outline">
															{change.from}
														</Badge>
													</Table.Td>
													<Table.Td>
														<Badge color={STATUS_COLOURS[change.to]} variant="light">
															{change.to}
														</Badge>
													</Table.Td>
												</Table.Tr>
											))}
										</Table.Tbody>
									</Table>
								</ScrollArea.Autosize>
							)}
						</Stack>
					</Card>
				)}
			</Stack>

			<Stack>
				<Title order={3}>3. Start over</Title>
				<Text size="sm" c="dimmed">
					Deletes the runs and incentives this tool created for the event (the draft is kept, so you can edit
					and re-apply, or import a new CSV). If the runs were edited directly in the CMS, you can instead
					rebuild the draft from them.
				</Text>
				<Group>
					<Button
						color="red"
						variant="light"
						disabled={!applied || busy !== null}
						onClick={() => setModal("reset")}
					>
						Reset applied schedule
					</Button>
					<Button
						variant="default"
						loading={busy === "rebuild"}
						disabled={busy !== null}
						onClick={() => setModal("rebuild")}
					>
						Rebuild draft from live runs
					</Button>
				</Group>
			</Stack>

			<ConfirmModal
				opened={modal === "replace"}
				title="Replace existing runs?"
				confirmLabel="Delete and apply"
				danger
				onCancel={() => setModal(null)}
				onConfirm={() => apply(true)}
			>
				<Text>
					This event already has {untracked} run(s) that weren&apos;t created by the schedule importer.
					Applying will <strong>delete them</strong> (and their incentives) and replace them with this
					schedule. To keep and edit them instead, cancel and use &quot;Rebuild draft from live runs&quot;.
				</Text>
			</ConfirmModal>

			<ConfirmModal
				opened={modal === "reset"}
				title="Reset the applied schedule?"
				confirmLabel="Reset"
				danger
				onCancel={() => setModal(null)}
				onConfirm={async () => {
					const reset = await run("reset", () => api.reset(resetSubmissions));
					if (!reset) return;
					notify.success(
						`Removed ${reset.runs} runs and ${reset.incentives} incentives${resetSubmissions ? `, reset ${reset.submissions} submissions` : ""}.`,
					);
					setResult(null);
					setPlan(null);
					await reload();
				}}
			>
				<Stack>
					<Text>
						This deletes {data.draft.appliedRunCount} run(s) and their incentives, including any donation
						totals recorded against them. The draft is kept.
					</Text>
					<Checkbox
						label="Also set every submission for this event back to pending"
						checked={resetSubmissions}
						onChange={(event) => setResetSubmissions(event.currentTarget.checked)}
					/>
				</Stack>
			</ConfirmModal>

			<ConfirmModal
				opened={modal === "rebuild"}
				title="Rebuild the draft from live runs?"
				confirmLabel="Rebuild draft"
				danger
				onCancel={() => setModal(null)}
				onConfirm={async () => {
					const rebuilt = await run("rebuild", () => api.rebuild());
					if (!rebuilt) return;
					notify.success(`Draft rebuilt with ${rebuilt.rows} rows.`);
					await reload();
				}}
			>
				<Text>
					The current draft will be replaced with the event&apos;s live runs and incentives. Unapplied draft
					edits will be lost.
				</Text>
			</ConfirmModal>

			<ConfirmModal
				opened={modal === "finalise"}
				title="Update submission statuses?"
				confirmLabel="Update submissions"
				onCancel={() => setModal(null)}
				onConfirm={async () => {
					const finalised = await run("finalise", () => api.finalise({ backupRule, skipReviewed }, false));
					if (!finalised) return;
					notify.success(`Updated ${finalised.changes.length} submissions.`);
					setPlan(null);
					await reload();
				}}
			>
				<Text>
					{plan?.changes.length ?? 0} submission(s) will be updated. Runners can see their submission status
					on their account page.
				</Text>
			</ConfirmModal>
		</Stack>
	);
}
