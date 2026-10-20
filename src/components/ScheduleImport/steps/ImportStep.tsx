"use client";

import { Alert, Button, Card, FileButton, Group, List, Stack, Text, Title } from "@mantine/core";
import { useRef, useState } from "react";

import { parseCsv, type CsvRow, type ImportReport } from "#/utilities/schedule/csv.ts";
import { ConfirmModal, errorMessage, notify } from "../components/feedback.tsx";
import { useSchedule } from "../context.tsx";

function ReportItem({ title, items }: { title: string; items: string[] }) {
	if (items.length === 0) return null;
	return (
		<List.Item>
			<strong>{title}</strong> {items.join(", ")}
		</List.Item>
	);
}

export function ImportStep() {
	const { api, data, state, flush, reload, goToStep } = useSchedule();
	const resetRef = useRef<() => void>(null);
	const [pending, setPending] = useState<{ name: string; rows: CsvRow[] } | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [report, setReport] = useState<ImportReport | null>(null);
	const [busy, setBusy] = useState(false);

	async function runImport(rows: CsvRow[]) {
		setBusy(true);
		try {
			await flush();
			const result = await api.importCsv(rows, state.defaultSetupMinutes);
			setReport(result);
			await reload();
			notify.success(`Imported ${result.rowCount} rows (${result.runCount} runs).`);
		} catch (error) {
			notify.error(errorMessage(error, "Import failed."));
		} finally {
			setBusy(false);
			setPending(null);
			resetRef.current?.();
		}
	}

	async function onFile(file: File | null) {
		if (!file) return;
		const rows = parseCsv(await file.text());
		if (rows.length === 0) {
			notify.error("That CSV has no rows.");
			resetRef.current?.();
			return;
		}
		setPending({ name: file.name, rows });
		if (state.rows.length > 0) setConfirmOpen(true);
		else await runImport(rows);
	}

	const hasProblems =
		report &&
		(report.unknownSubmissionIds.length > 0 ||
			report.duplicateSubmissionIds.length > 0 ||
			report.unmatchedRunners.length > 0 ||
			report.invalidEstimates.length > 0 ||
			report.invalidIncentiveJson.length > 0 ||
			report.newGames.length > 0);

	return (
		<Stack>
			<Text size="sm" c="dimmed">
				Upload your schedule CSV. Rows are scheduled in file order starting at the event start time; you can fix
				times, add sleep blocks and reorder in the next step. Importing replaces the current draft
				{data.draft.status === "applied"
					? " — the live schedule isn't touched until you re-apply, which will then replace all its runs and reset incentive totals"
					: ""}
				.
			</Text>

			{data.draft.status === "applied" && (
				<Alert color="blue">
					This schedule has already been applied. For small changes, edit it in the Timing step and re-apply
					instead of re-importing, so donation incentive totals are kept.
				</Alert>
			)}

			<Group>
				<FileButton resetRef={resetRef} onChange={(file) => void onFile(file)} accept=".csv,text/csv">
					{(props) => (
						<Button {...props} loading={busy}>
							Upload schedule CSV
						</Button>
					)}
				</FileButton>
			</Group>

			{report && (
				<Card withBorder>
					<Stack gap="sm">
						<Title order={4}>Import report</Title>
						<Text>
							{report.rowCount} rows imported, {report.runCount} of them runs.
						</Text>
						{hasProblems && (
							<Alert color="yellow" title="Check these">
								<List size="sm" spacing={4}>
									<ReportItem
										title="Unknown submission IDs (not in this event):"
										items={report.unknownSubmissionIds}
									/>
									<ReportItem
										title="Submissions used more than once:"
										items={report.duplicateSubmissionIds.map(String)}
									/>
									<ReportItem
										title="Runners without a matching account (kept as free text):"
										items={report.unmatchedRunners}
									/>
									<ReportItem
										title="Invalid estimates:"
										items={report.invalidEstimates.map(
											(item) => `line ${item.line} (${item.game}: "${item.estimate}")`,
										)}
									/>
									<ReportItem
										title="Invalid donationIncentives JSON on lines:"
										items={report.invalidIncentiveJson.map(String)}
									/>
									<ReportItem
										title="New games that will be created on apply (fix spelling in Timing if they should match an existing game):"
										items={report.newGames}
									/>
								</List>
							</Alert>
						)}
						<Group>
							<Button onClick={() => goToStep("timing")}>Continue to timing →</Button>
						</Group>
					</Stack>
				</Card>
			)}

			<ConfirmModal
				opened={confirmOpen}
				title="Replace the current draft?"
				confirmLabel="Replace draft"
				danger
				onCancel={() => {
					setConfirmOpen(false);
					if (!busy) {
						setPending(null);
						resetRef.current?.();
					}
				}}
				onConfirm={async () => {
					if (pending) await runImport(pending.rows);
				}}
			>
				<Text>
					The draft has {state.rows.length} rows. Importing <strong>{pending?.name}</strong> will replace all
					rows, incentive set-up and pairings.
				</Text>
			</ConfirmModal>
		</Stack>
	);
}
