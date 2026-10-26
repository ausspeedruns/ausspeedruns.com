import config from "#payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Accordion, Alert, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { ListBox } from "pixelarticons/react";
import { Submission } from "./Submission";

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
	});

	// Each submission has an event attached to it, group submissions by event and display them in separate accordions
	const submissionsByEvent: Record<number, SubmissionType[]> = {};
	submissions.docs.forEach((submission) => {
		let eventId: number | undefined;
		if (submission.event && typeof submission.event === "object") {
			eventId = submission.event.id;
		} else if (typeof submission.event === "number") {
			eventId = submission.event;
		} else {
			eventId = -1;
		}

		if (!submissionsByEvent[eventId]) {
			submissionsByEvent[eventId] = [];
		}

		submissionsByEvent[eventId].push(submission);
	});

	const eventNames = await payload.find({
		collection: "events",
		depth: 0,
		where: {
			id: {
				in: Object.keys(submissionsByEvent).map(Number),
			},
		},
		select: {
			name: true,
			settings: {
				isAcceptingBackups: true,
				isAcceptingSubmissions: true,
			},
		},
	});

	const eventNameMap: Record<
		number,
		{
			name: string;
			acceptingSubmissions: boolean;
			acceptingBackups: boolean;
		}
	> = {};
	eventNames.docs.forEach((event) => {
		eventNameMap[event.id] = {
			name: event.name,
			acceptingSubmissions: event.settings?.isAcceptingSubmissions ?? false,
			acceptingBackups: event.settings?.isAcceptingBackups ?? false,
		};
	});

	return (
		<Stack gap="md">
			<Title order={1}>Run Submissions</Title>
			<Accordion>
				{Object.keys(submissionsByEvent).length === 0 ? (
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
					Object.entries(submissionsByEvent).map(([eventId, submissions]) => {
						return (
							<>
								<h3>{eventNameMap[Number(eventId)]?.name ?? "Unknown Event"}</h3>
								{submissions.map((submission) => (
									<Submission
										key={submission.id}
										submission={submission}
										canEdit={
											eventNameMap[Number(eventId)]?.acceptingSubmissions ||
											eventNameMap[Number(eventId)]?.acceptingBackups
										}
									/>
								))}
								<hr />
							</>
						);
					})
				)}
			</Accordion>
		</Stack>
	);
}
