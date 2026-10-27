"use client";

import type { Volunteer as VolunteerType } from "#payload-types.ts";
import { Accordion, Badge, Divider, Group, List, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { EditVolunteerModal, type VolunteerEventInfo } from "./EditVolunteer";

import styles from "./Volunteer.module.css";

interface VolunteerProps {
	volunteer: VolunteerType;
	event?: VolunteerEventInfo;
}

const STATUS_COLORS: Record<string, string> = {
	pending: "yellow",
	accepted: "green",
	rejected: "red",
};

const ROLE_LABELS: Record<VolunteerType["role"][number], string> = {
	frontDesk: "Front Desk",
	host: "Host",
	tech: "Tech",
	stageHand: "Stage Hand",
};

const ROLE_COLORS: Record<VolunteerType["role"][number], string> = {
	frontDesk: "teal",
	host: "violet",
	tech: "blue",
	stageHand: "orange",
};

export function Volunteer(props: VolunteerProps) {
	const { volunteer } = props;
	const { event } = props;
	const hasHost = volunteer.role.includes("host");
	const hasTech = volunteer.role.includes("tech");
	const status = volunteer.status ?? "pending";
	const isPending = status === "pending";

	return (
		<Paper my="md" shadow="xs" withBorder>
			<Accordion.Item value={String(volunteer.id)}>
				<Accordion.Control>
					<Stack gap={4} align="flex-start">
						<Group gap="xs" wrap="wrap">
							<Badge color={STATUS_COLORS[status] ?? "gray"} variant="filled">
								{status.charAt(0).toUpperCase() + status.slice(1)}
							</Badge>
							{volunteer.role.map((role) => (
								<Badge key={role} color={ROLE_COLORS[role]} variant="light">
									{ROLE_LABELS[role]}
								</Badge>
							))}
						</Group>
						{volunteer.maximumTime != null && (
							<Text size="sm" c="dimmed">
								Max time: {volunteer.maximumTime}h
							</Text>
						)}
					</Stack>
				</Accordion.Control>
				<Accordion.Panel>
					<Stack gap="md" pb="xs">
						{event?.acceptingVolunteers && isPending && (
							<EditVolunteerModal volunteer={volunteer} event={event} />
						)}
						{event?.acceptingVolunteers && !isPending && (
							<Text size="sm" c="dimmed">
								This application has been reviewed, so it can no longer be edited. Contact the event
								staff if something needs to change.
							</Text>
						)}
						<div>
							<Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
								Availability
							</Text>
							{volunteer.availability && volunteer.availability.length > 0 ? (
								<List className={styles.availabilityList}>
									{volunteer.availability.map((slot) => (
										<List.Item key={slot.id ?? slot.time}>{slot.time}</List.Item>
									))}
								</List>
							) : (
								<Text size="sm" c="dimmed">
									None provided
								</Text>
							)}
						</div>

						{(hasHost || hasTech) && <Divider />}

						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
							{hasHost && (
								<Stack gap={4}>
									<Title order={5} c="violet">
										Host Details
									</Title>
									{volunteer.maxDailyHostTime != null && (
										<Text>
											<Text span fw={600}>
												Max daily host time:
											</Text>{" "}
											{volunteer.maxDailyHostTime}h
										</Text>
									)}
									{volunteer.hostSpecificGame && (
										<Text>
											<Text span fw={600}>
												Specific game:
											</Text>{" "}
											{volunteer.hostSpecificGame}
										</Text>
									)}
									{volunteer.hostSpecificRunner && (
										<Text>
											<Text span fw={600}>
												Specific runner:
											</Text>{" "}
											{volunteer.hostSpecificRunner}
										</Text>
									)}
									{volunteer.hostOtherInformation && (
										<Text>
											<Text span fw={600}>
												Other info:
											</Text>{" "}
											{volunteer.hostOtherInformation}
										</Text>
									)}
								</Stack>
							)}

							{hasTech && (
								<Stack gap={4}>
									<Title order={5} c="blue">
										Tech Details
									</Title>
									{volunteer.techExperience ? (
										<Text size="sm">{volunteer.techExperience}</Text>
									) : (
										<Text size="sm" c="dimmed">
											No experience provided
										</Text>
									)}
								</Stack>
							)}
						</SimpleGrid>
					</Stack>
				</Accordion.Panel>
			</Accordion.Item>
		</Paper>
	);
}
