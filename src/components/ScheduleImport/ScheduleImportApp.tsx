"use client";

import {
	Alert,
	Anchor,
	Badge,
	Button,
	Group,
	Loader,
	Paper,
	Select,
	SimpleGrid,
	Stack,
	Tabs,
	Text,
} from "@mantine/core";
import { useCallback, useEffect, useMemo, useState } from "react";

import { computeSchedule, formatInTz, scheduleEnd } from "#/utilities/schedule/timing.ts";
import { validateDraft } from "#/utilities/schedule/validation.ts";
import { scheduleApi } from "./api.ts";
import { errorMessage, notify } from "./components/feedback.tsx";
import { fillLink, ScheduleProvider, type ScheduleContextValue, type ScheduleLinks, type StepId } from "./context.tsx";
import { ApplyStep } from "./steps/ApplyStep.tsx";
import { ExportStep } from "./steps/ExportStep.tsx";
import { ImportStep } from "./steps/ImportStep.tsx";
import { IncentivesStep } from "./steps/IncentivesStep.tsx";
import { PairingStep } from "./steps/PairingStep.tsx";
import { TimingStep } from "./steps/TimingStep.tsx";
import { useScheduleDraft, type SaveStatus } from "./useScheduleDraft.ts";

export interface ScheduleImportEvent {
	id: number;
	name: string;
	shortName: string;
}

export interface ScheduleImportAppProps {
	events: ScheduleImportEvent[];
	initialEventId: number | null;
	/** URL the schedule endpoints are mounted under, e.g. `/api/schedule-drafts` */
	apiBase: string;
	links?: ScheduleLinks;
}

const STEPS: { id: StepId; label: string }[] = [
	{ id: "export", label: "Export submissions" },
	{ id: "import", label: "Import schedule" },
	{ id: "timing", label: "Timing" },
	{ id: "incentives", label: "Incentives" },
	{ id: "pairing", label: "Races & co-ops" },
	{ id: "apply", label: "Apply & finalise" },
];

const SAVE_STATUS: Record<SaveStatus, { label: string; colour: string } | null> = {
	idle: null,
	dirty: { label: "Unsaved changes…", colour: "gray" },
	saving: { label: "Saving…", colour: "gray" },
	saved: { label: "All changes saved", colour: "green" },
	error: { label: "Save failed", colour: "red" },
	conflict: { label: "Changed by someone else", colour: "red" },
};

function formatDuration(ms: number): string {
	const hours = Math.floor(ms / 3_600_000);
	const minutes = Math.round((ms % 3_600_000) / 60_000);
	return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

function readStepFromUrl(): StepId {
	const step = new URLSearchParams(window.location.search).get("step");
	return STEPS.some((candidate) => candidate.id === step) ? (step as StepId) : "export";
}

function writeUrl(params: Record<string, string | null>) {
	const url = new URL(window.location.href);
	for (const [key, value] of Object.entries(params)) {
		if (value === null) url.searchParams.delete(key);
		else url.searchParams.set(key, value);
	}
	window.history.replaceState(window.history.state, "", url);
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<Stack gap={2}>
			<Text size="xs" tt="uppercase" c="dimmed" fw={600}>
				{label}
			</Text>
			<Text fw={700}>{value}</Text>
		</Stack>
	);
}

/**
 * Schedule builder: export submissions → import CSV → fix timing → incentives → pair races → apply & finalise.
 * Only depends on Mantine and the schedule HTTP API, so it can be mounted in any host that provides a MantineProvider.
 */
export function ScheduleImportApp({ events, initialEventId, apiBase, links = {} }: ScheduleImportAppProps) {
	const [eventId, setEventId] = useState<number | null>(initialEventId);
	const [step, setStep] = useState<StepId>("export");

	useEffect(() => setStep(readStepFromUrl()), []);

	const api = useMemo(() => (eventId ? scheduleApi(apiBase, eventId) : null), [apiBase, eventId]);
	const draft = useScheduleDraft(api);
	const { data, state, flush, saveStatus, saveError } = draft;

	const goToStep = useCallback((next: StepId) => {
		setStep(next);
		writeUrl({ step: next });
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	const selectEvent = async (id: number | null) => {
		try {
			await flush();
		} catch (error) {
			notify.error(errorMessage(error, "Could not save changes."));
			return;
		}
		setEventId(id);
		writeUrl({ event: id ? String(id) : null });
	};

	const timed = useMemo(
		() =>
			data?.event.startTime && state
				? computeSchedule(state.rows, data.event.startTime, state.defaultSetupMinutes)
				: [],
		[data?.event.startTime, state],
	);
	const issues = useMemo(
		() => (data && state ? validateDraft(state, data.event, data.submissions) : []),
		[data, state],
	);
	const submissionsById = useMemo(
		() => new Map((data?.submissions ?? []).map((submission) => [submission.id, submission])),
		[data?.submissions],
	);

	const contextValue: ScheduleContextValue | null =
		api && data && state
			? {
					api,
					links,
					data,
					state,
					update: draft.update,
					flush,
					reload: draft.reload,
					users: draft.users,
					rememberUsers: draft.rememberUsers,
					timed,
					issues,
					submissionsById,
					goToStep,
				}
			: null;

	const end = scheduleEnd(timed);
	const runCount = timed.filter((entry) => entry.row.type === "run").length;
	const eventLink = data ? fillLink(links.event, { id: data.event.id, eventId: data.event.id }) : null;
	const saveBadge = SAVE_STATUS[saveStatus];

	const stepBadge = (id: StepId) => {
		const stepIssues = issues.filter((issue) => issue.step === id);
		const errors = stepIssues.filter((issue) => issue.level === "error").length;
		if (errors > 0) return { colour: "red", text: String(errors) };
		if (stepIssues.length > 0) return { colour: "yellow", text: String(stepIssues.length) };
		if (id === "apply" && data?.draft.status === "applied") return { colour: "green", text: "Applied" };
		return null;
	};

	return (
		<Stack gap="md" pb="xl">
			<Group align="center">
				<Select
					w={340}
					placeholder="Select an event…"
					searchable
					allowDeselect={false}
					data={events.map((event) => ({
						value: String(event.id),
						label: `${event.name} (${event.shortName})`,
					}))}
					value={eventId ? String(eventId) : null}
					onChange={(value) => void selectEvent(value ? Number(value) : null)}
				/>
				{eventLink && (
					<Anchor href={eventLink} size="sm">
						Edit event
					</Anchor>
				)}
				{saveBadge && (
					<Badge color={saveBadge.colour} variant="light" title={saveError ?? undefined}>
						{saveBadge.label}
					</Badge>
				)}
			</Group>

			{!eventId && <Text c="dimmed">Choose an event to build its schedule.</Text>}
			{draft.loading && !data && <Loader size="sm" />}
			{draft.loadError && <Alert color="red">{draft.loadError}</Alert>}

			{saveStatus === "conflict" && (
				<Alert color="red" title="Changed by someone else">
					<Group justify="space-between">
						<Text size="sm">
							Another staff member saved this schedule after you loaded it, so your latest edits
							weren&apos;t saved.
						</Text>
						<Button size="xs" color="red" onClick={() => void draft.reload()}>
							Reload their version
						</Button>
					</Group>
				</Alert>
			)}
			{saveStatus === "error" && saveError && <Alert color="red">{saveError}</Alert>}

			{data?.draft.liveRunsChanged && (
				<Alert color="blue">
					Runs for this event were edited directly after the schedule was last applied. Re-applying will
					overwrite those edits — use &quot;Rebuild draft from live runs&quot; on the Apply step to bring them
					into the draft first.
				</Alert>
			)}

			{contextValue && (
				<ScheduleProvider value={contextValue}>
					<Paper withBorder p="md">
						<SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }}>
							<Stat
								label="Status"
								value={
									contextValue.data.draft.status === "applied"
										? "Applied"
										: contextValue.state.rows.length
											? "Draft"
											: "Not started"
								}
							/>
							<Stat label="Timezone" value={contextValue.data.event.timezone} />
							<Stat
								label="Start"
								value={
									contextValue.data.event.startTime
										? formatInTz(
												contextValue.data.event.startTime,
												contextValue.data.event.timezone,
												"EEE d MMM, h:mm a",
											)
										: "Not set"
								}
							/>
							<Stat
								label="End"
								value={
									end ? formatInTz(end, contextValue.data.event.timezone, "EEE d MMM, h:mm a") : "—"
								}
							/>
							<Stat
								label="Duration"
								value={
									end && contextValue.data.event.startTime
										? formatDuration(
												end.getTime() - new Date(contextValue.data.event.startTime).getTime(),
											)
										: "—"
								}
							/>
							<Stat label="Runs" value={runCount} />
						</SimpleGrid>
					</Paper>

					<Tabs value={step} onChange={(value) => value && goToStep(value as StepId)} keepMounted={false}>
						<Tabs.List>
							{STEPS.map((candidate, index) => {
								const badge = stepBadge(candidate.id);
								return (
									<Tabs.Tab
										key={candidate.id}
										value={candidate.id}
										leftSection={
											<Badge size="sm" circle variant="default">
												{index + 1}
											</Badge>
										}
										rightSection={
											badge && (
												<Badge size="sm" color={badge.colour} variant="light">
													{badge.text}
												</Badge>
											)
										}
									>
										{candidate.label}
									</Tabs.Tab>
								);
							})}
						</Tabs.List>

						<Tabs.Panel value="export" pt="md">
							<ExportStep />
						</Tabs.Panel>
						<Tabs.Panel value="import" pt="md">
							<ImportStep />
						</Tabs.Panel>
						<Tabs.Panel value="timing" pt="md">
							<TimingStep />
						</Tabs.Panel>
						<Tabs.Panel value="incentives" pt="md">
							<IncentivesStep />
						</Tabs.Panel>
						<Tabs.Panel value="pairing" pt="md">
							<PairingStep />
						</Tabs.Panel>
						<Tabs.Panel value="apply" pt="md">
							<ApplyStep />
						</Tabs.Panel>
					</Tabs>
				</ScheduleProvider>
			)}
		</Stack>
	);
}
