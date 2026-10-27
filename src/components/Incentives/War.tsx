import { Group, Progress, Stack, Text } from "@mantine/core";
import { formatCurrency } from "#/utilities/formatCurrency";
import { percent, type WarResult } from "#/utilities/events/incentiveResults";
import type { IncentiveKindProps } from "./types";

export function WarProgress({ result, title, isActive, size }: IncentiveKindProps<WarResult>) {
	if (result.options.length === 0) {
		return (
			<Text size="sm" c="dimmed" fs="italic">
				{isActive
					? "No options yet. Donate and include one in your donation message!"
					: "No options were submitted. Runner's choice."}
			</Text>
		);
	}

	const leadingTotal = result.options[0].total;

	return (
		<Stack gap={size === "sm" ? "xs" : "sm"}>
			{result.options.map((option, index) => {
				const isLeading = leadingTotal > 0 && option.total === leadingTotal;

				return (
					<Stack key={`${option.name}-${index}`} gap={4}>
						<Group justify="space-between" align="baseline" wrap="nowrap" gap="xs">
							{/* Intentionally not truncated: long names spilling out of the card is a beloved bit (see "Stennnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn" at ASM2025) */}
							<Group gap="xs" wrap="nowrap">
								<Text fw={isLeading ? 700 : 500} size={size} style={{ whiteSpace: "nowrap" }}>
									{option.name}
								</Text>
							</Group>
							<Text size="sm" c={isLeading ? undefined : "dimmed"} fw={isLeading ? 700 : 400} flex="none">
								{formatCurrency(option.total)}
							</Text>
						</Group>
						<Progress
							value={percent(option.total, result.total)}
							size={size === "sm" ? "sm" : "md"}
							color={isLeading ? "ausSpeedrunsOrange" : "ausSpeedrunsBlue"}
							aria-label={`${option.name} share of ${title}`}
						/>
					</Stack>
				);
			})}
		</Stack>
	);
}
