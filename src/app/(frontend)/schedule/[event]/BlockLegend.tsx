import { Button, Chip, Group, Text } from "@mantine/core";

import styles from "./BlockLegend.module.css";
import type { Block, Run } from "./scheduleTypes";
import { formatScheduleTime } from "./time";

interface BlockLegendProps {
	blocks: Block[];
	runs: Run[];
	blockMap: Map<number, Block>;
	eventTimezone: string;
	showLocalTime: boolean;
	/** Selected block names (empty = show everything) */
	selected: string[];
	onChange: (selected: string[]) => void;
}

/** Chips for each block: toggle to filter the schedule to those blocks. */
export function BlockLegend(props: BlockLegendProps) {
	const runsById = new Map(props.runs.map((run) => [run.id, run]));
	// Blocks with the same name (e.g. several "Buffer" blocks) share a chip
	const entries: { name: string; colour: string; textColour: string; firstRun: Run }[] = [];
	for (const block of props.blocks) {
		const firstRun = runsById.get(block.startRunId);
		// Skip blocks that lost their runs to an earlier overlapping block
		if (!firstRun || props.blockMap.get(firstRun.id)?.name !== block.name) continue;
		const existing = entries.find((entry) => entry.name === block.name);
		if (!existing) entries.push({ name: block.name, colour: block.colour, textColour: block.textColour, firstRun });
		else if (firstRun.displayIndex < existing.firstRun.displayIndex) existing.firstRun = firstRun;
	}
	entries.sort((a, b) => a.firstRun.displayIndex - b.firstRun.displayIndex);

	if (entries.length === 0) return null;

	return (
		<section className={styles.legend} aria-label="Schedule blocks">
			<Group justify="space-between" align="baseline" mb="xs">
				<Text fw={700} fz="lg">
					Schedule Blocks
				</Text>
				{props.selected.length > 0 && (
					<Button size="compact-sm" variant="subtle" onClick={() => props.onChange([])}>
						Show all runs
					</Button>
				)}
			</Group>
			<Chip.Group multiple value={props.selected} onChange={props.onChange}>
				<div className={styles.chips}>
					{entries.map((entry) => (
						<div key={entry.name} className={styles.entry}>
							<Chip
								value={entry.name}
								color={entry.colour}
								variant="outline"
								size="md"
								styles={{
									root: { minWidth: 0 },
									label: {
										height: "auto",
										minHeight: 32,
										maxWidth: "100%",
										whiteSpace: "normal",
										overflowWrap: "anywhere",
										lineHeight: 1.3,
										paddingBlock: 4,
										borderRadius: 0,
										borderColor: entry.colour,
										borderWidth: 2,
										...(props.selected.includes(entry.name)
											? { background: entry.colour, color: entry.textColour }
											: {}),
									},
									iconWrapper: { color: entry.textColour },
								}}
							>
								<span className={styles.swatch} style={{ background: entry.colour }} aria-hidden />
								{entry.name}
								<span className={styles.time}>
									{formatScheduleTime(
										entry.firstRun.scheduledTime,
										props.eventTimezone,
										props.showLocalTime,
										"EEE h:mm a",
									)}
								</span>
							</Chip>
						</div>
					))}
				</div>
			</Chip.Group>
		</section>
	);
}
