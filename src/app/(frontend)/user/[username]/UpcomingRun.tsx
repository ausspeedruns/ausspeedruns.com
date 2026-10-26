import { Badge, Group, Text, Title } from "@mantine/core";
import styles from "./UpcomingRun.module.css";

interface UpcomingRunProps {
	run: {
		id: number;
		game: string;
		date: string;
		estimate?: string;
		event: string;
		mode: string;
		isHighlighted: boolean;
	};
}

export function UpcomingRun(props: UpcomingRunProps) {
	return (
		<article
			className={`${styles.scheduleItem} ${props.run.isHighlighted ? styles.scheduleItemHighlight : ""}`}
			key={props.run.id}
		>
			<div className={styles.scheduleRail} />
			<Group justify="space-between" wrap="nowrap">
				<Text className={styles.scheduleDate}>{props.run.date}</Text>
				<Badge className={styles.scheduleEstimate} variant="outline">
					EST: {props.run.estimate}
				</Badge>
			</Group>
			<div>
				<Title className={styles.scheduleTitle} order={4}>
					{props.run.game}
				</Title>
				<Text className={styles.scheduleEvent}>{props.run.event}</Text>
			</div>
			<Group justify="space-between" wrap="nowrap">
				<Text className={styles.scheduleMode}>{props.run.mode}</Text>
			</Group>
		</article>
	);
}
