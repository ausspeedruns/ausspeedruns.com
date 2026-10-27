import type { ReactNode } from "react";
import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import type { IncentiveResult } from "#/utilities/events/incentiveResults";
import { FormatLocalTime } from "./FormatLocalTime";
import { getIncentiveKind } from "./incentiveKinds";
import type { IncentiveCardSize } from "./types";
import styles from "./IncentiveCard.module.css";

interface IncentiveCardProps {
	title: string;
	/** Usually "Game – Category". */
	runLabel?: string | null;
	description?: string | null;
	scheduledTime?: string | null;
	/** Replaces the default scheduled time display, e.g. with a relative time. */
	time?: ReactNode;
	isActive?: boolean;
	highlighted?: boolean;
	/** "sm" for dense grids such as the donation tracker and event live blocks. */
	size?: IncentiveCardSize;
	result: IncentiveResult;
}

export function IncentiveCard({
	title,
	runLabel,
	description,
	scheduledTime,
	time,
	isActive = true,
	highlighted,
	size = "md",
	result,
}: IncentiveCardProps) {
	const { label, Status, Body } = getIncentiveKind(result);
	const kindProps = { result, title, isActive, size };
	const isSmall = size === "sm";

	return (
		<Card
			component="article"
			className={styles.card}
			data-highlighted={highlighted || undefined}
			data-closed={!isActive || undefined}
			padding={isSmall ? "sm" : "lg"}
			withBorder
		>
			<Stack gap={isSmall ? "sm" : "md"} h="100%">
				<Group justify="space-between" gap="xs" style={{ rowGap: 4 }}>
					<Text c="ausSpeedrunsOrange" size={isSmall ? "sm" : undefined}>
						{time ?? (scheduledTime ? <FormatLocalTime date={scheduledTime} /> : "Time TBD")}
					</Text>
					<Group gap="xs" wrap="nowrap" ml="auto">
						{Status && <Status {...kindProps} />}
						<Badge color="ausSpeedrunsBlue" variant="outline">
							{label}
						</Badge>
					</Group>
				</Group>

				<div>
					<Title order={3} size={isSmall ? "h5" : "h4"} textWrap="balance">
						{title}
					</Title>
					{runLabel && (
						<Text c="dimmed" size={isSmall ? "sm" : undefined}>
							{runLabel}
						</Text>
					)}
				</div>

				{description && (
					<Text
						size={isSmall ? "xs" : "sm"}
						className={styles.description}
						lineClamp={isSmall ? 3 : undefined}
					>
						{description}
					</Text>
				)}

				<Body {...kindProps} />
			</Stack>
		</Card>
	);
}
