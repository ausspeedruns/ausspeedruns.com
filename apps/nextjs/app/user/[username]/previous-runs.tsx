"use client";

import { useState } from "react";
import styles from "./previous-runs.module.scss";
import { Box, Tab, Tabs } from "@mui/material";
import RunCompleted from "../../../components/RunCompleted/RunCompleted";

type Run = {
	id: string;
	game: string;
	category: string;
	finalTime?: string;
	platform: string;
	twitchVOD?: string;
	youtubeVOD?: string;
	scheduledTime: string;
	event: {
		name: string;
		shortname: string;
		logo: {
			url: string;
			width: number;
			height: number;
		};
	};
};

export default function PreviousRuns({ runs }: { runs: Run[] }) {
	const [eventTab, setEventTab] = useState(0);

	const allRunEvents = [
		...Array.from(new Set(runs.map((run) => (run.finalTime ? run.event?.shortname : undefined)))).filter(
			(el) => typeof el !== "undefined",
		),
	];

	return (
		<div className={styles.runs}>
			<Box>
				<Tabs value={eventTab} onChange={(_e: any, newVal: number) => setEventTab(newVal)} variant="scrollable">
					{allRunEvents.reverse().map((event) => (
						<Tab label={event} key={event} />
					))}
				</Tabs>
			</Box>
			{runs.map((run) => {
				if (!run.finalTime) return;
				return (
					<div key={run.id} hidden={run.event?.shortname !== allRunEvents[eventTab]}>
						<RunCompleted run={run} />
					</div>
				);
			})}
		</div>
	);
}
