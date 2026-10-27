import { headers } from "next/headers";
import { getPayload } from "payload";
import configPromise from "#payload-config";
import { Button } from "@mantine/core";
import { ArrowRight, Home, Login } from "pixelarticons/react";

import styles from "./page.module.css";
import { VolunteerForm } from "./VolunteerForm";

import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Volunteer Submission",
	description: "Submit a volunteer application to an AusSpeedruns event",
};

export default async function VolunteerPage() {
	const payload = await getPayload({ config: configPromise });
	const userHeaders = await headers();
	const { user } = await payload.auth({ headers: userHeaders });

	if (!user) {
		return (
			<div className={styles.signIn}>
				<h2>Please sign in to submit volunteer applications.</h2>
				<div className={styles.actionRow}>
					<Button component="a" href="/login?redirect=/volunteer" rightSection={<Login />}>
						Sign In
					</Button>
					<Button component="a" href="/signup" rightSection={<ArrowRight />}>
						Join
					</Button>
				</div>
			</div>
		);
	}

	if (!user.socials?.discord) {
		return (
			<div className={styles.noEvents}>
				<h2>We require a Discord username to accept volunteer submissions.</h2>
				<p>Please add your Discord username in your profile settings and try again.</p>
				<Button component="a" href="/account/edit" rightSection={<ArrowRight />}>
					Update Profile
				</Button>
			</div>
		);
	}

	const eventsResult = await payload.find({
		collection: "events",
		where: { "settings.isAcceptingVolunteers": { equals: true } },
		pagination: false,
		depth: 0,
	});

	const events = eventsResult.docs.map((event) => ({
		id: event.id,
		shortName: event.shortName,
		startDate: event.timeSettings?.startTime ?? "",
		endDate: event.timeSettings?.endTime ?? "",
		eventTimezone: event.timeSettings?.timezone ?? "",
	}));

	// Only one application per event is allowed, so flag the ones they've already applied to
	const existingApplications =
		events.length > 0
			? await payload.find({
					collection: "volunteers",
					where: {
						and: [{ volunteer: { equals: user.id } }, { event: { in: events.map((event) => event.id) } }],
					},
					pagination: false,
					depth: 0,
					select: { event: true },
				})
			: { docs: [] };

	const appliedEventIds = existingApplications.docs
		.map((application) => (typeof application.event === "object" ? application.event?.id : application.event))
		.filter((id): id is number => typeof id === "number");

	if (events.length === 0) {
		return (
			<div className={styles.noEvents}>
				<h2>Unfortunately we have no events currently accepting volunteers.</h2>
				<p>Join our Discord to stay up to date!</p>
				<div className={styles.actionRow}>
					<Button component="a" href="/discord">
						Discord
					</Button>
					<Button component="a" href="/" leftSection={<Home />}>
						Home
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.page}>
			<VolunteerForm events={events} appliedEventIds={appliedEventIds} />
		</div>
	);
}
