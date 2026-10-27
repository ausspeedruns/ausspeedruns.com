import { Badge, Group, Progress, Stack, Text } from "@mantine/core";
import { formatMoney, type WarIncentive } from "../incentiveType";
import { IncentiveCard } from "./IncentiveCard";

interface WarProps {
	incentive: WarIncentive;
	highlighted?: boolean;
}

export function War({ incentive, highlighted }: WarProps) {
	const options = [...incentive.data.options].sort((a, b) => b.total - a.total);
	const grandTotal = options.reduce((sum, option) => sum + option.total, 0);
	const leadingTotal = options[0]?.total ?? 0;

	return (
		<IncentiveCard incentive={incentive} highlighted={highlighted}>
			{options.length > 0 ? (
				<Stack gap="sm">
					{options.map((option, index) => {
						const share = grandTotal > 0 ? (option.total / grandTotal) * 100 : 0;
						const isLeading = leadingTotal > 0 && option.total === leadingTotal;

						return (
							<Stack key={`${option.name}-${index}`} gap={4}>
								<Group justify="space-between" align="baseline" wrap="nowrap" gap="xs">
									{/* Intentionally not truncated: long names spilling out of the card is a beloved bit (see "Stennnn…" at ASM2025) */}
									<Group gap="xs" wrap="nowrap">
										<Text fw={isLeading ? 700 : 500} style={{ whiteSpace: "nowrap" }}>
											{option.name}
										</Text>
										{isLeading && !incentive.isActive && (
											<Badge color="ausSpeedrunsOrange" variant="filled" flex="none">
												Winner
											</Badge>
										)}
									</Group>
									<Text size="sm" c={isLeading ? undefined : "dimmed"} fw={isLeading ? 700 : 400} flex="none">
										{formatMoney(option.total)}
									</Text>
								</Group>
								<Progress
									value={share}
									size="md"
									color={isLeading ? "ausSpeedrunsOrange" : "ausSpeedrunsBlue"}
									aria-label={`${option.name} share of ${incentive.title}`}
								/>
							</Stack>
						);
					})}
				</Stack>
			) : (
				<Text size="sm" c="dimmed" fs="italic">
					{incentive.isActive
						? "No options yet. Donate and include one in your donation message!"
						: "No options were submitted. Runner's choice."}
				</Text>
			)}
		</IncentiveCard>
	);
}
