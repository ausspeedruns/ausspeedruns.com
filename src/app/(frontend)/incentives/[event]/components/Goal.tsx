import { Badge, Group, Progress, Stack, Text } from "@mantine/core";
import { formatMoney, type GoalIncentive } from "../incentiveType";
import { IncentiveCard } from "./IncentiveCard";

interface GoalProps {
	incentive: GoalIncentive;
	highlighted?: boolean;
}

export function Goal({ incentive, highlighted }: GoalProps) {
	const { goal, current } = incentive.data;
	const percent = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
	const isMet = goal > 0 && current >= goal;

	return (
		<IncentiveCard
			incentive={incentive}
			highlighted={highlighted}
			status={
				isMet ? (
					<Badge color="ausSpeedrunsOrange" variant="filled">
						Met
					</Badge>
				) : null
			}
		>
			<Stack gap={6}>
				<Group justify="space-between" align="baseline" wrap="nowrap" gap="xs">
					<Text fw={700}>
						{formatMoney(current)}{" "}
						<Text span c="dimmed" fw={400}>
							/ {formatMoney(goal)}
						</Text>
					</Text>
					<Text size="sm" c="dimmed">
						{Math.floor(percent)}%
					</Text>
				</Group>
				<Progress
					value={percent}
					size="lg"
					color="ausSpeedrunsOrange"
					aria-label={`${incentive.title} progress`}
				/>
			</Stack>
		</IncentiveCard>
	);
}
