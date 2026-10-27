import config from "#payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Accordion, Alert, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { ListBox } from "pixelarticons/react";
import { Volunteer } from "./Volunteer";
import type { VolunteerEventInfo } from "./EditVolunteer";

import type { Volunteer as VolunteerType } from "#payload-types.ts";

export default async function AccountVolunteerPage() {
	const payload = await getPayload({ config });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		redirect(`/login?redirect=${encodeURIComponent(`/account/volunteer`)}`);
	}

	const volunteers = await payload.find({
		collection: "volunteers",
		depth: 0,
		where: {
			volunteer: {
				equals: user.id,
			},
		},
		sort: "-createdAt",
		pagination: false,
	});

	// Group applications by event. A Map keeps insertion order (plain objects sort numeric keys ascending),
	// so events with the newest application come first and each group stays newest-first.
	const volunteersByEvent = new Map<number, VolunteerType[]>();
	volunteers.docs.forEach((volunteer) => {
		let eventId: number;
		if (volunteer.event && typeof volunteer.event === "object") {
			eventId = volunteer.event.id;
		} else if (typeof volunteer.event === "number") {
			eventId = volunteer.event;
		} else {
			eventId = -1;
		}

		const group = volunteersByEvent.get(eventId) ?? [];
		group.push(volunteer);
		volunteersByEvent.set(eventId, group);
	});

	const eventNames = await payload.find({
		collection: "events",
		depth: 0,
		pagination: false,
		where: {
			id: {
				in: [...volunteersByEvent.keys()],
			},
		},
		select: {
			name: true,
			timeSettings: true,
			settings: {
				isAcceptingVolunteers: true,
			},
		},
	});

	const eventNameMap: Record<number, VolunteerEventInfo> = {};
	eventNames.docs.forEach((event) => {
		eventNameMap[event.id] = {
			name: event.name,
			startDate: event.timeSettings?.startTime ?? "",
			endDate: event.timeSettings?.endTime ?? "",
			eventTimezone: event.timeSettings?.timezone ?? "",
			acceptingVolunteers: event.settings?.isAcceptingVolunteers ?? false,
		};
	});

	return (
		<Stack gap="md">
			<Title order={1}>Volunteer Applications</Title>
			<Accordion>
				{volunteersByEvent.size === 0 ? (
					<Alert
						color="gray"
						icon={
							<ThemeIcon color="gray" radius="xl" size="sm" variant="light">
								<ListBox width={14} height={14} />
							</ThemeIcon>
						}
						variant="light"
					>
						<Text size="sm">You have not made any applications yet.</Text>
					</Alert>
				) : (
					[...volunteersByEvent.entries()].map(([eventId, volunteers]) => {
						const eventInfo = eventNameMap[eventId];

						return (
							<div key={eventId}>
								<h3>{eventInfo?.name ?? "Unknown Event"}</h3>
								{volunteers.map((volunteer) => (
									<Volunteer key={volunteer.id} volunteer={volunteer} event={eventInfo} />
								))}
								<hr />
							</div>
						);
					})
				)}
			</Accordion>
		</Stack>
	);
}
