"use client";

import { Button, Code, Group, Paper, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";

import { IMPORT_COLUMNS } from "#/utilities/schedule/csv.ts";
import { useSchedule } from "../context.tsx";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<Paper withBorder p="sm">
			<Text size="xs" tt="uppercase" c="dimmed" fw={600}>
				{label}
			</Text>
			<Text fw={700} size="lg">
				{value}
			</Text>
		</Paper>
	);
}

export function ExportStep() {
	const { api, data } = useSchedule();
	const submissions = data.submissions;
	const byStatus = (status: string) => submissions.filter((submission) => submission.status === status).length;
	const races = submissions.filter((submission) => submission.raceType !== "noRace").length;
	const incentives = submissions.reduce((total, submission) => total + submission.donationIncentives.length, 0);

	return (
		<Stack>
			<Text size="sm" c="dimmed">
				Download every submission for <strong>{data.event.name}</strong> as a CSV. Build the schedule in a
				spreadsheet by reordering, deleting and adding rows (keep the <Code>id</Code> column so rows stay linked
				to their submissions), then import it in the next step.
			</Text>

			<SimpleGrid cols={{ base: 2, md: 4 }}>
				<Stat label="Submissions" value={submissions.length} />
				<Stat
					label="Pending / accepted / backup / rejected"
					value={`${byStatus("pending")} / ${byStatus("accepted")} / ${byStatus("backup")} / ${byStatus("rejected")}`}
				/>
				<Stat label="Race / co-op submissions" value={races} />
				<Stat label="Suggested incentives" value={incentives} />
			</SimpleGrid>

			<Group>
				{submissions.length > 0 ? (
					<Button component="a" href={api.submissionsCsvUrl}>
						Download {submissions.length} submissions (CSV)
					</Button>
				) : (
					<Text c="dimmed">This event has no submissions yet.</Text>
				)}
			</Group>

			<Title order={4}>CSV columns the importer reads</Title>
			<Table withTableBorder verticalSpacing={4}>
				<Table.Tbody>
					{Object.entries(IMPORT_COLUMNS).map(([column, description]) => (
						<Table.Tr key={column}>
							<Table.Td w={180}>
								<Code>{column}</Code>
							</Table.Td>
							<Table.Td>
								<Text size="sm">{description}</Text>
							</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
			<Text size="sm" c="dimmed">
				Add a row with the game <Code>Setup Buffer</Code> or <Code>Sleep</Code> (or set the <Code>type</Code>{" "}
				column) for blocks that aren&apos;t runs, with the <Code>estimate</Code> as the length. You can also add
				or adjust these after importing. Other columns (availability, status, etc.) are just there to help you
				plan.
			</Text>
		</Stack>
	);
}
