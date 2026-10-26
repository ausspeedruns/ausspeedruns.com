import config from "#payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Accordion, Alert, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { ListBox } from "pixelarticons/react";
import { Volunteer } from "./Volunteer";

import type { Volunteer as VolunteerType } from "#payload-types.ts";

export default async function AccountSubmissionsPage() {
	const payload = await getPayload({ config });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		redirect(`/login?redirect=${encodeURIComponent(`/account/submissions`)}`);
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
	});

	// Each volunteer has an event attached to it, group volunteers by event and display them in separate accordions
	const volunteersByEvent: Record<number, VolunteerType[]> = {};
	volunteers.docs.forEach((volunteer) => {
		let eventId: number | undefined;
		if (volunteer.event && typeof volunteer.event === "object") {
			eventId = volunteer.event.id;
		} else if (typeof volunteer.event === "number") {
			eventId = volunteer.event;
		} else {
			eventId = -1;
		}

		if (!volunteersByEvent[eventId]) {
			volunteersByEvent[eventId] = [];
		}

		volunteersByEvent[eventId].push(volunteer);
	});

	const eventNames = await payload.find({
		collection: "events",
		depth: 0,
		where: {
			id: {
				in: Object.keys(volunteersByEvent).map(Number),
			},
		},
		select: {
			name: true,
			settings: {
				isAcceptingVolunteers: true,
			},
		},
	});

	const eventNameMap: Record<
		number,
		{
			name: string;
			acceptingVolunteers: boolean;
		}
	> = {};
	eventNames.docs.forEach((event) => {
		eventNameMap[event.id] = {
			name: event.name,
			acceptingVolunteers: event.settings?.isAcceptingVolunteers ?? false,
		};
	});

	return (
		<Stack gap="md">
			<Title order={1}>Volunteer Applications</Title>
			<Accordion>
				{Object.keys(volunteersByEvent).length === 0 ? (
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
					Object.entries(volunteersByEvent).map(([eventId, volunteers]) => {
						const eventInfo = eventNameMap[Number(eventId)];
						const canEdit = eventInfo?.acceptingVolunteers ?? false;

						return (
							<div key={eventId}>
								<h3>{eventInfo?.name ?? "Unknown Event"}</h3>
								{volunteers.map((volunteer) => (
									<Volunteer key={volunteer.id} volunteer={volunteer} canEdit={canEdit} />
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
