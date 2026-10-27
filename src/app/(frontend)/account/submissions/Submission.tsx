"use client";

import type { Submission as SubmissionType } from "#payload-types.ts";
import {
	Accordion,
	Anchor,
	Badge,
	Divider,
	Group,
	List,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { Calendar, Clock, Monitor, Link as LinkIcon } from "pixelarticons/react";

import { EditSubmissionModal, type SubmissionEventInfo } from "./EditSubmission";
import { parseAvailability, parseDonationIncentives } from "./submissionFormMapping";
import { getEventDays } from "#/utilities/getEventDays";

interface SubmissionProps {
	submission: SubmissionType;
	event?: SubmissionEventInfo;
}

const RACE_LABELS: Record<string, string> = {
	noRace: "No",
	solo: "Yes (solo possible)",
	only: "Yes (race/co-op only)",
};

function availabilitySummary(submission: SubmissionType, event?: SubmissionEventInfo) {
	const days = parseAvailability(submission.availability);
	const eventDays = event ? getEventDays(event.startDate, event.endDate) : days.length;
	if (eventDays === 0 || days.length === 0) return "Not provided";
	return `${days.slice(0, eventDays).filter(Boolean).length} of ${eventDays} days`;
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
	const { submission, event } = props;
	const eventOpen = Boolean(event?.acceptingSubmissions || event?.acceptingBackups);
	const isPending = submission.status === "pending";
	const incentives = parseDonationIncentives(submission.donationIncentives);

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
						{event && eventOpen && isPending && <EditSubmissionModal submission={submission} event={event} />}
						{eventOpen && !isPending && (
							<Text size="sm" c="dimmed">
								This submission has been reviewed, so it can no longer be edited. Contact the event
								staff if something needs to change.
							</Text>
						)}
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
										{submission.isCoop ? "Co-op" : "Race"}
									</Text>{" "}
									{RACE_LABELS[submission.raceType ?? "noRace"] ?? formatEnumLabel(submission.raceType)}
								</Text>
								{submission.raceType && submission.raceType !== "noRace" && (
									<Text>
										<Text span fw={600}>
											With
										</Text>{" "}
										{renderValue(submission.racer)}
									</Text>
								)}
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
										Availability
									</Text>{" "}
									{availabilitySummary(submission, event)}
								</Text>
								<Text component="div">
									<Text span fw={600}>
										Donation incentives
									</Text>{" "}
									{incentives.length === 0 ? (
										"None"
									) : (
										<List size="sm" mt={4}>
											{incentives.map((incentive, i) => (
												<List.Item key={i}>
													{incentive.title}
													{incentive.time && ` (+${incentive.time})`}
													{incentive.description && (
														<Text span c="dimmed">
															{" "}
															– {incentive.description}
														</Text>
													)}
												</List.Item>
											))}
										</List>
									)}
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
