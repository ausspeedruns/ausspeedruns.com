import type { ReactNode } from "react";
import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import type { IncentiveItem } from "../incentiveType";
import { FormatLocalTime } from "./FormatLocalTime";
import styles from "./IncentiveCard.module.css";

interface IncentiveCardProps {
	incentive: IncentiveItem;
	highlighted?: boolean;
	status?: ReactNode;
	children: ReactNode;
}

export function IncentiveCard({ incentive, highlighted, status, children }: IncentiveCardProps) {
	const runLabel = incentive.run ? [incentive.run.name, incentive.run.category].filter(Boolean).join(" · ") : null;

	return (
		<Card
			component="article"
			className={styles.card}
			data-highlighted={highlighted || undefined}
			data-closed={!incentive.isActive || undefined}
			padding="lg"
			withBorder
		>
			<Stack gap="md" h="100%">
				<Group justify="space-between" wrap="nowrap">
					<Text c="ausSpeedrunsOrange" flex="none">
						{incentive.run?.scheduledTime ? (
							<FormatLocalTime date={incentive.run.scheduledTime} />
						) : (
							"Time TBD"
						)}
					</Text>
					<Group gap="xs" wrap="nowrap">
						{status}
						<Badge color="ausSpeedrunsBlue" variant="outline">
							{incentive.type === "goal" ? "Goal" : "Bid War"}
						</Badge>
					</Group>
				</Group>

				<div>
					<Title order={3} size="h4" textWrap="balance">
						{incentive.title}
					</Title>
					{runLabel && <Text c="dimmed">{runLabel}</Text>}
				</div>

				{incentive.description && (
					<Text size="sm" className={styles.description}>
						{incentive.description}
					</Text>
				)}

				<div className={styles.progress}>{children}</div>
			</Stack>
		</Card>
	);
}
