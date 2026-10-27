import { Badge, Group, Progress, Stack, Text } from "@mantine/core";
import { formatCurrency } from "#/utilities/formatCurrency";
import { percent, type GoalResult } from "#/utilities/events/incentiveResults";
import type { IncentiveKindProps } from "./types";

export function GoalStatus({ result }: IncentiveKindProps<GoalResult>) {
	if (!result.met) return null;

	return (
		<Badge color="ausSpeedrunsOrange" variant="filled">
			Met
		</Badge>
	);
}

export function GoalProgress({ result, title, size }: IncentiveKindProps<GoalResult>) {
	const value = percent(result.current, result.goal);

	return (
		<Stack gap={6}>
			<Group justify="space-between" align="baseline" wrap="nowrap" gap="xs">
				<Text fw={700} size={size}>
					{formatCurrency(result.current)}{" "}
					<Text span c="dimmed" fw={400} inherit>
						/ {formatCurrency(result.goal)}
					</Text>
				</Text>
				<Text size="sm" c="dimmed">
					{value}%
				</Text>
			</Group>
			<Progress
				value={value}
				size={size === "sm" ? "md" : "lg"}
				color="ausSpeedrunsOrange"
				aria-label={`${title} progress`}
			/>
		</Stack>
	);
}
