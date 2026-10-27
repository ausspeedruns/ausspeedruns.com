import type { ArrayField, FilterOptions, PayloadRequest, Where } from "payload";

import { relationId } from "#access/helpers.ts";
import { colourField } from "#fields/colour.ts";
import { describeBlockProblem, findBlockProblems } from "#utilities/schedule/blocks.ts";

/** Top-level runs of an event in schedule order (the runs a block can span). */
export async function loadBlockRunOrder(req: PayloadRequest, eventId: number): Promise<number[]> {
	const runs = await req.payload.find({
		collection: "runs",
		where: { and: [{ event: { equals: eventId } }, { parent: { exists: false } }] },
		sort: "scheduledTime",
		depth: 0,
		pagination: false,
		overrideAccess: true,
		select: { scheduledTime: true },
		req,
	});
	return runs.docs.map((run) => run.id);
}

const sameEventTopLevelRuns: FilterOptions = ({ id }) => {
	const and: Where[] = [{ parent: { exists: false } }];
	if (id) and.push({ event: { equals: id } });
	return { and };
};

type RelationValue = number | { id: number } | null | undefined;
type BlockRow = { name?: string | null; startRun?: RelationValue; endRun?: RelationValue };

/** Named, coloured spans of runs highlighted on the public schedule. */
export const scheduleBlocksField: ArrayField = {
	name: "scheduleBlocks",
	type: "array",
	// The default (`_events_v_version_schedule_metadata_schedule_blocks`) pushes its index/FK names past Postgres's 63-char limit.
	dbName: "events_schedule_blocks",
	label: "Schedule Blocks",
	labels: { singular: "Block", plural: "Blocks" },
	admin: {
		description:
			"Themed groups of consecutive runs, called out on the public schedule. Blocks can also be managed in the Schedule Import tool (applying a draft replaces these).",
		components: {
			RowLabel: "./components/admin/ScheduleBlockRowLabel/ScheduleBlockRowLabel#ScheduleBlockRowLabel",
		},
	},
	validate: async (value, { req, id }) => {
		const rows = (value ?? []) as BlockRow[];
		if (rows.length === 0 || !req?.payload || id === undefined || id === null) return true;

		const order = await loadBlockRunOrder(req, Number(id));
		const problems = findBlockProblems(
			rows.map((row) => ({
				name: row.name ?? "",
				start: relationId(row.startRun as RelationValue),
				end: relationId(row.endRun as RelationValue),
			})),
			order,
		);
		if (problems.length === 0) return true;
		const names = rows.map((row) => row.name ?? "");
		return problems.map((problem) => describeBlockProblem(problem, names)).join(" ");
	},
	fields: [
		{
			type: "row",
			fields: [
				{ name: "name", type: "text", required: true, admin: { width: "40%" } },
				colourField({ name: "colour", required: true, admin: { width: "30%" } }),
				colourField({
					name: "textColour",
					admin: {
						width: "30%",
						placeholder: "Auto",
						description: "Leave empty for black or white, whichever is easier to read.",
					},
				}),
			],
		},
		{
			type: "row",
			fields: [
				{
					name: "startRun",
					type: "relationship",
					relationTo: "runs",
					required: true,
					filterOptions: sameEventTopLevelRuns,
					admin: { width: "50%", sortOptions: "scheduledTime" },
				},
				{
					name: "endRun",
					type: "relationship",
					relationTo: "runs",
					filterOptions: sameEventTopLevelRuns,
					admin: {
						width: "50%",
						sortOptions: "scheduledTime",
						description: "Leave empty for a single-run block.",
					},
				},
			],
		},
	],
};
