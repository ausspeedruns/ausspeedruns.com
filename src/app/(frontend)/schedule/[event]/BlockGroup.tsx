import type { CSSProperties, ReactNode } from "react";
import { addSeconds, format } from "date-fns";

import styles from "./BlockGroup.module.css";
import type { Block, Run } from "./scheduleTypes";
import { displayZoneOptions, scheduleTimeToDate } from "./time";

export function estimateToSeconds(estimate: string) {
	return estimate.split(":").reduce((acc, time) => 60 * acc + (parseInt(time, 10) || 0), 0);
}

/** Splits runs into consecutive groups that share a block (or have none). */
export function groupByBlock(runs: Run[], blocks: Map<number, Block>): { block?: Block; runs: Run[] }[] {
	const groups: { block?: Block; runs: Run[] }[] = [];
	for (const run of runs) {
		const block = blocks.get(run.id);
		const last = groups.at(-1);
		if (last && block && last.block === block) last.runs.push(run);
		else groups.push({ block, runs: [run] });
	}
	return groups;
}

interface BlockGroupProps {
	block: Block;
	startRun?: Run;
	endRun?: Run;
	continuesFromPreviousDay: boolean;
	continuesNextDay: boolean;
	eventTimezone: string;
	showLocalTime: boolean;
	children: ReactNode;
}

export function BlockGroup(props: BlockGroupProps) {
	const { block, startRun, endRun } = props;
	const zone = displayZoneOptions(props.eventTimezone, props.showLocalTime);
	let timeRange: string | null = null;
	if (startRun && endRun) {
		const start = scheduleTimeToDate(startRun.scheduledTime);
		const end = addSeconds(scheduleTimeToDate(endRun.scheduledTime), estimateToSeconds(endRun.estimate));
		const sameDay = format(start, "yyyy-MM-dd", zone) === format(end, "yyyy-MM-dd", zone);
		timeRange = `${format(start, "EEE h:mm a", zone)} – ${format(end, sameDay ? "h:mm a" : "EEE h:mm a", zone)}`;
	}

	return (
		<section
			className={styles.blockGroup}
			aria-label={`${block.name} block`}
			style={{ "--block-colour": block.colour, "--block-text": block.textColour } as CSSProperties}
			data-continued={props.continuesFromPreviousDay}
			data-continues={props.continuesNextDay}
		>
			<header className={styles.header}>
				<h3 className={styles.name}>
					{block.name}
					{props.continuesFromPreviousDay && <span className={styles.continued}> (continued)</span>}
				</h3>
				{timeRange && <span className={styles.timeRange}>{timeRange}</span>}
			</header>
			<div className={styles.runs}>{props.children}</div>
			{props.continuesNextDay && <p className={styles.continuesNote}>Continues tomorrow…</p>}
		</section>
	);
}
