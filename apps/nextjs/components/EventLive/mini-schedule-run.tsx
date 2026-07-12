import styles from "./mini-schedule-run.module.css";
import { formatDistanceToNow } from "date-fns";

interface MiniScheduleRunProps {
	game: string;
	runners: string[];
	category: string;
	scheduledTime: string;
}

export function MiniScheduleRun(props: MiniScheduleRunProps) {
	return (
		<div className={styles.container}>
			<span className={styles.game}>{props.game}</span>
			<span className={styles.category}>{props.category}</span>
			<div className={styles.subtitle}>
				<span>by {props.runners.join(", ")}</span>
				<span> {formatDistanceToNow(new Date(props.scheduledTime), { addSuffix: true })}</span>
			</div>
		</div>
	);
}
