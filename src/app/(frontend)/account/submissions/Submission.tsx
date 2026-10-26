"use client";

import type { Submission as SubmissionType } from "#payload-types.ts";
import {
	Accordion,
	Anchor,
	Badge,
	Divider,
	Group,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { Calendar, Clock, Monitor, Link as LinkIcon } from "pixelarticons/react";

import { EditSubmissionModal } from "./EditSubmission";

interface SubmissionProps {
	submission: SubmissionType;
	canEdit?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
	dateStyle: "medium",
	timeStyle: "short",
});

function formatEnumLabel(value: string | null | undefined) {
	if (!value) return "Not provided";

	return value
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/_/g, " ")
		.replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusColor(status: SubmissionType["status"]) {
	if (status === "accepted") return "green";
	if (status === "rejected") return "red";
	if (status === "backup") return "blue";
	return "yellow";
}

function renderValue(value: unknown) {
	if (typeof value === "string") {
		return value.trim().length > 0 ? value : "Not provided";
	}

	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}

	if (Array.isArray(value)) {
		return value.length > 0 ? JSON.stringify(value) : "Not provided";
	}

	if (value && typeof value === "object") {
		return JSON.stringify(value);
	}

	return "Not provided";
}

export function Submission(props: SubmissionProps) {
	const { submission } = props;

	return (
		<Paper my="md" shadow="xs" withBorder>
			<Accordion.Item value={String(submission.id)}>
				<Accordion.Control>
					<Stack gap={4} align="flex-start">
						<Group gap="xs" wrap="wrap">
							<Title order={3}>{renderValue(submission.game)}</Title>
							<Badge color={getStatusColor(submission.status)} variant="light">
								{formatEnumLabel(submission.status)}
							</Badge>
							{submission.canBackup ? (
								<Badge color="blue" variant="outline">
									Can backup
								</Badge>
							) : null}
						</Group>
						<Text size="sm" c="dimmed">
							{renderValue(submission.category)}
						</Text>
					</Stack>
				</Accordion.Control>
				<Accordion.Panel>
					<Stack gap="md" pb="xs">
						{props.canEdit && <EditSubmissionModal submission={submission} />}
						<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
							<Group gap="xs" wrap="nowrap" align="flex-start">
								<ThemeIcon color="violet" variant="light">
									<Clock width={16} height={16} />
								</ThemeIcon>
								<div>
									<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
										Estimate
									</Text>
									<Text fw={600}>{renderValue(submission.estimate)}</Text>
									<Text size="sm" c="dimmed">
										Possible: {renderValue(submission.possibleEstimate)}
									</Text>
								</div>
							</Group>
							<Group gap="xs" wrap="nowrap" align="flex-start">
								<ThemeIcon color="indigo" variant="light">
									<Monitor width={16} height={16} />
								</ThemeIcon>
								<div>
									<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
										Platform
									</Text>
									<Text fw={600}>{renderValue(submission.platform)}</Text>
									<Text size="sm" c="dimmed">
										Tech: {renderValue(submission.techPlatform)}
									</Text>
								</div>
							</Group>
							<Group gap="xs" wrap="nowrap" align="flex-start">
								<ThemeIcon color="green" variant="light">
									<Calendar width={16} height={16} />
								</ThemeIcon>
								<div>
									<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
										Submitted
									</Text>
									<Text fw={600}>{dateFormatter.format(new Date(submission.createdAt))}</Text>
									<Text size="sm" c="dimmed">
										Updated: {dateFormatter.format(new Date(submission.updatedAt))}
									</Text>
								</div>
							</Group>
						</SimpleGrid>

						<Divider />

						<SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
							<Stack gap={4}>
								<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
									Run Details
								</Text>
								<Text>
									<Text span fw={600}>
										Game
									</Text>{" "}
									{renderValue(submission.game)}
								</Text>
								<Text>
									<Text span fw={600}>
										Category
									</Text>{" "}
									{renderValue(submission.category)}
								</Text>
								<Text>
									<Text span fw={600}>
										Age rating
									</Text>{" "}
									{formatEnumLabel(submission.ageRating)}
								</Text>
								<Text>
									<Text span fw={600}>
										Race type
									</Text>{" "}
									{formatEnumLabel(submission.raceType)}
								</Text>
								<Text>
									<Text span fw={600}>
										Co-op
									</Text>{" "}
									{submission.isCoop ? "Yes" : "No"}
								</Text>
								<Text>
									<Text span fw={600}>
										Racer
									</Text>{" "}
									{renderValue(submission.racer)}
								</Text>
							</Stack>

							<Stack gap={4}>
								<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
									Submission Notes
								</Text>
								<Text>
									<Text span fw={600}>
										Special requirements
									</Text>{" "}
									{renderValue(submission.specialRequirements)}
								</Text>
								<Text>
									<Text span fw={600}>
										Donation incentives
									</Text>{" "}
									{renderValue(submission.donationIncentives)}
								</Text>
								<Text>
									<Text span fw={600}>
										Availability
									</Text>{" "}
									{renderValue(submission.availability)}
								</Text>
								{submission.video ? (
									<Group gap={6} mt={4} wrap="wrap">
										<LinkIcon width={14} height={14} />
										<Anchor href={submission.video} target="_blank" rel="noreferrer">
											Watch submitted video
										</Anchor>
									</Group>
								) : null}
							</Stack>
						</SimpleGrid>

						{submission.possibleEstimateReason ? (
							<Stack gap={4}>
								<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
									Possible Estimate Reason
								</Text>
								<Text size="sm">{submission.possibleEstimateReason}</Text>
							</Stack>
						) : null}
					</Stack>
				</Accordion.Panel>
			</Accordion.Item>
		</Paper>
	);
}
