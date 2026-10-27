import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
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
		<Card
			component="article"
			className={styles.scheduleItem}
			data-highlighted={props.run.isHighlighted || undefined}
			padding="lg"
			withBorder
		>
			<Stack gap="sm">
				<Group justify="space-between" wrap="nowrap">
					<Text c="ausSpeedrunsOrange" flex="none">
						{props.run.date}
					</Text>
					{props.run.estimate && (
						<Badge color="ausSpeedrunsBlue" variant="outline">
							EST: {props.run.estimate}
						</Badge>
					)}
				</Group>
				<div>
					<Title order={4}>{props.run.game}</Title>
					<Text c="dimmed">{props.run.event}</Text>
				</div>
				{props.run.mode && (
					<Text c="dimmed" size="sm" ta="right">
						{props.run.mode}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
