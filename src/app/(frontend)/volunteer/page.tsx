import { headers } from "next/headers";
import { getPayload } from "payload";
import configPromise from "#payload-config";
import { Button } from "@mantine/core";
import { ArrowRight, Home, Login } from "pixelarticons/react";

import styles from "./Volunteer.module.css";
import { VolunteerForm } from "./form";

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
				<Button component="a" href={`/user/${user.username}/edit`}>
					Update Profile
				</Button>
			</div>
		);
	}

	// Query events that are accepting submissions or backups
	const eventsResult = await payload.find({
		collection: "events",
		where: {
			or: [{ "settings.isAcceptingVolunteers": { equals: true } }],
		},
		pagination: false,
	});

	// Query user's existing submissions (sorted by newest first)
	const submissionsResult = await payload.find({
		collection: "submissions",
		where: {
			runner: { equals: user.id },
		},
		sort: "-createdAt",
		pagination: false,
	});

	const events = eventsResult.docs;
	const submissions = submissionsResult.docs;

	// Map to the shape expected by child components
	const data = {
		user: {
			verified: true, // PayloadCMS auth: true handles email; adjust if you add email verification
			dateOfBirth: user.dateOfBirth,
			discord: user.socials?.discord ?? "",
			submissions: submissions.map((sub) => ({
				game: sub.game,
				platform: sub.platform,
				techPlatform: sub.techPlatform ?? undefined,
				ageRating: sub.ageRating,
			})),
		},
		events: events.map((event) => ({
			id: event.id,
			shortName: event.shortName,
			submissionInstructions: event.submissionInstructions ?? null,
			startDate: event.timeSettings?.startTime ?? "",
			endDate: event.timeSettings?.endTime ?? "",
			eventTimezone: event.timeSettings?.timezone ?? "",
		})),
	};

	if (data.events.length === 0) {
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
			<VolunteerForm events={data.events} />
		</div>
	);
}
