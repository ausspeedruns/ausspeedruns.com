import React from "react";
import { Badge, Group, Paper, Progress, Stack, Text } from "@mantine/core";
import { formatCurrency } from "#/utilities/formatCurrency";
import { percent, type IncentiveResult } from "#/utilities/events/incentiveResults";
import styles from "./IncentiveResultCard.module.css";

interface IncentiveResultCardProps {
	title: string;
	/** Usually "Game – Category". */
	label?: string | null;
	/** Small text shown next to the label, e.g. when the run is scheduled. */
	meta?: React.ReactNode;
	/** Badge text for the top bid war option. */
	leaderLabel?: string;
	result: IncentiveResult;
}

export function IncentiveResultCard({ title, label, meta, leaderLabel = "Winner", result }: IncentiveResultCardProps) {
	const isGoal = result.kind === "goal";

	return (
		<Paper withBorder p="sm" className={styles.card} data-met={isGoal && result.met ? "true" : undefined}>
			<Stack gap="xs">
				<Stack gap={2}>
					{label || meta ? (
						<Group justify="space-between" gap="xs" wrap="nowrap">
							<Text size="xs" c="dimmed" truncate="end">
								{label}
							</Text>
							{meta ? (
								<Text size="xs" c="dimmed" className={styles.numeric}>
									{meta}
								</Text>
							) : null}
						</Group>
					) : null}
					<Text fw={700} lh={1.3}>
						{title}
					</Text>
				</Stack>

				{result.kind === "goal" ? (
					<Stack gap={6}>
						<Progress
							value={percent(result.current, result.goal)}
							color={result.met ? "lime" : "gray"}
							size="md"
						/>
						<Group justify="space-between" gap="xs" wrap="nowrap">
							<Text size="sm" c="dimmed" className={styles.numeric}>
								<Text span fw={700} c="bright">
									{formatCurrency(result.current)}
								</Text>{" "}
								/ {formatCurrency(result.goal)}
							</Text>
							<Badge variant="light" color={result.met ? "lime" : "gray"}>
								{result.met ? "Met" : `${percent(result.current, result.goal)}%`}
							</Badge>
						</Group>
					</Stack>
				) : (
					<Stack gap={8}>
						{result.options.map((option, index) => {
							const isLeader = index === 0 && result.total > 0;
							return (
								<Stack key={`${option.name}-${index}`} gap={4}>
									<Group justify="space-between" gap="xs" wrap="nowrap">
										<Group gap={6} wrap="nowrap" className={styles.optionName}>
											{isLeader && (
												<Badge variant="light" color="blue" size="sm">
													{leaderLabel}
												</Badge>
											)}
											<Text
												size="sm"
												fw={isLeader ? 600 : 400}
												c={isLeader ? undefined : "dimmed"}
											>
												{option.name}
											</Text>
										</Group>
										<Text size="sm" c={isLeader ? undefined : "dimmed"} className={styles.numeric}>
											{formatCurrency(option.total)}
										</Text>
									</Group>
									<Progress
										value={percent(option.total, result.options[0].total)}
										color={isLeader ? "blue" : "gray"}
										size="sm"
									/>
								</Stack>
							);
						})}
					</Stack>
				)}
			</Stack>
		</Paper>
	);
}
