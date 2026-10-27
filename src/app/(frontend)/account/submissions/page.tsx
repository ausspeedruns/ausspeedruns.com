import config from "#payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Accordion, Alert, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { ListBox } from "pixelarticons/react";
import { Submission } from "./Submission";
import type { SubmissionEventInfo } from "./EditSubmission";

import type { Submission as SubmissionType } from "#payload-types.ts";

export default async function AccountSubmissionsPage() {
	const payload = await getPayload({ config });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		redirect(`/login?redirect=${encodeURIComponent(`/account/submissions`)}`);
	}

	const submissions = await payload.find({
		collection: "submissions",
		depth: 0,
		where: {
			runner: {
				equals: user.id,
			},
		},
		sort: "-createdAt",
		pagination: false,
	});

	// Group submissions by event. A Map keeps insertion order (plain objects sort numeric keys ascending),
	// so events with the newest submission come first and each group stays newest-first.
	const submissionsByEvent = new Map<number, SubmissionType[]>();
	submissions.docs.forEach((submission) => {
		let eventId: number;
		if (submission.event && typeof submission.event === "object") {
			eventId = submission.event.id;
		} else if (typeof submission.event === "number") {
			eventId = submission.event;
		} else {
			eventId = -1;
		}

		const group = submissionsByEvent.get(eventId) ?? [];
		group.push(submission);
		submissionsByEvent.set(eventId, group);
	});

	const eventNames = await payload.find({
		collection: "events",
		depth: 0,
		pagination: false,
		where: {
			id: {
				in: [...submissionsByEvent.keys()],
			},
		},
		select: {
			name: true,
			timeSettings: true,
			settings: {
				isAcceptingBackups: true,
				isAcceptingSubmissions: true,
			},
		},
	});

	const eventNameMap: Record<number, SubmissionEventInfo> = {};
	eventNames.docs.forEach((event) => {
		eventNameMap[event.id] = {
			name: event.name,
			startDate: event.timeSettings?.startTime ?? "",
			endDate: event.timeSettings?.endTime ?? "",
			eventTimezone: event.timeSettings?.timezone ?? "",
			acceptingSubmissions: event.settings?.isAcceptingSubmissions ?? false,
			acceptingBackups: event.settings?.isAcceptingBackups ?? false,
		};
	});

	return (
		<Stack gap="md">
			<Title order={1}>Run Submissions</Title>
			<Accordion>
				{submissionsByEvent.size === 0 ? (
					<Alert
						color="gray"
						icon={
							<ThemeIcon color="gray" radius="xl" size="sm" variant="light">
								<ListBox width={14} height={14} />
							</ThemeIcon>
						}
						variant="light"
					>
						<Text size="sm">You have not made any submissions yet.</Text>
					</Alert>
				) : (
					[...submissionsByEvent.entries()].map(([eventId, submissions]) => {
						const eventInfo = eventNameMap[eventId];

						return (
							<div key={eventId}>
								<h3>{eventInfo?.name ?? "Unknown Event"}</h3>
								{submissions.map((submission) => (
									<Submission key={submission.id} submission={submission} event={eventInfo} />
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
