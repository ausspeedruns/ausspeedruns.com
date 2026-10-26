import { Badge, Group, Paper, Progress, Stack, Text } from "@mantine/core";
import type { Goal as GoalSchema } from "../incentiveType";
import { FormatLocalTime } from "./FormatLocalTime";
import type z from "zod";

export function Goal(props: z.infer<typeof GoalSchema>) {
	const time = new Date(props.run.scheduledTime);
	const progress = props.data.goal > 0 ? Math.min(props.data.current / props.data.goal, 1) : 0;

	return (
		<Paper
			withBorder
			radius={0}
			p="sm"
			style={{
				borderWidth: 1,
				borderColor: "var(--mantine-color-default-border)",
				background: "var(--mantine-color-default)",
				opacity: props.isActive ? 1 : 0.7,
			}}
		>
			<Stack gap={6}>
				<Group justify="space-between" align="center" wrap="wrap">
					<Badge radius={0} color={props.isActive ? "lime" : "gray"} variant="light">
						{props.isActive ? "Goal" : "Goal - Disabled"}
					</Badge>
					<Text size="xs" c="dimmed">
						<FormatLocalTime date={time} />
					</Text>
				</Group>

				<Text fw={700}>{props.title}</Text>
				<Text size="sm" c="dimmed">
					{props.run.game} / {props.run.category}
				</Text>
				{props.notes ? <Text size="sm">{props.notes}</Text> : null}

				<Group justify="space-between" align="center" wrap="nowrap" gap="xs">
					<Text fw={700}>
						${props?.data.current?.toLocaleString() ?? "Error"} / $
						{props?.data.goal?.toLocaleString() ?? "Error"}
					</Text>
					<Text size="xs" c="dimmed">
						{Math.round(progress * 100)}%
					</Text>
				</Group>

				<Progress value={progress * 100} radius={0} size="lg" color={props.isActive ? "lime" : "gray"} />
			</Stack>
		</Paper>
	);
}
