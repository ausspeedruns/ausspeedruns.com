"use client";

import { Badge, Group, Paper, Progress, Stack, Text } from "@mantine/core";
import type { War as WarSchema } from "../incentiveType";
import { FormatLocalTime } from "./FormatLocalTime";
import type z from "zod";

function isColor(strColor: string) {
	if (typeof window === "undefined") {
		return false;
	}

	const s = new Option().style;
	s.color = strColor;
	return s.color !== "";
}

export function War(props: z.infer<typeof WarSchema>) {
	const time = new Date(props.run.scheduledTime);
	const sortedOptions = [...props.data.options].sort((a, b) => b.total - a.total);
	const maxTotal = sortedOptions[0]?.total ?? 0;

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
					<Badge radius={0} color={props.isActive ? "blue" : "gray"} variant="light">
						{props.isActive ? "War" : "War - Disabled"}
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

				{sortedOptions.length > 0 ? (
					<Stack gap={8}>
						{sortedOptions.map((option) => {
							const progress = maxTotal > 0 ? Math.min((option.total / maxTotal) * 100, 100) : 0;
							const customColor = isColor(option.name) ? option.name : null;

							return (
								<Stack key={option.name} gap={4}>
									<Group justify="space-between" align="center" wrap="nowrap" gap="xs">
										<Text fw={600}>{option.name}</Text>
										<Text size="sm">${option?.total?.toLocaleString() ?? "Error"}</Text>
									</Group>
									<Progress
										value={progress}
										radius={0}
										size="md"
										color={customColor ? "gray" : "blue"}
										styles={
											customColor
												? {
														section: {
															backgroundColor: customColor,
														},
													}
												: undefined
										}
									/>
								</Stack>
							);
						})}
					</Stack>
				) : (
					<Text size="sm" c="dimmed" fs="italic">
						{props.isActive
							? "None submitted. Donate and include one in your donation message!"
							: "None submitted. Runner's choice."}
					</Text>
				)}
			</Stack>
		</Paper>
	);
}
