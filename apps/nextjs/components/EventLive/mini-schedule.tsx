import Link from "next/link";
import { MiniScheduleRun } from "./mini-schedule-run";
import styles from "./mini-schedule.module.css";

import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


interface MiniScheduleProps {
	runs: {
		game: string;
		runners: string[];
		category: string;
		scheduledTime: string;
	}[];
}

export function MiniSchedule(props: MiniScheduleProps) {
	return (
		<div className={styles.container}>
			{props.runs.map((run, index) => (
				<MiniScheduleRun key={index} {...run} />
			))}
			<div className={styles.scheduleButton}>
				<Link href="/schedule" passHref>
					<FontAwesomeIcon icon={faCalendar} />
					Schedule
				</Link>
			</div>
		</div>
	);
}
