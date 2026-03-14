import { headers } from "next/headers";
import { getPayload } from "payload";
import configPromise from "#payload-config";
import { Button } from "@mantine/core";
import { ArrowRight, Home, Login } from "pixelarticons/react";

import styles from "./Volunteer.module.css";
import { VolunteerForm } from "./form";

import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Speedrun Submission",
	description: "Submit a run to an AusSpeedruns event",
};

export default async function VolunteerPage() {
	const payload = await getPayload({ config: configPromise });
	const userHeaders = await headers();
	const { user } = await payload.auth({ headers: userHeaders });

	if (!user) {
		return (
			<div className={styles.signIn}>
				<h2>Please sign in to submit games.</h2>
				<Button component="a" href="/login?redirect=/submit-game" rightSection={<Login />}>
					Sign In
				</Button>
				<br />
				<Button component="a" href="/signup" rightSection={<ArrowRight />}>
					Join
				</Button>
			</div>
		);
	}

	if (!user.socials?.Discord) {
		return (
			<div>
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
			discord: user.socials?.Discord ?? "",
			submissions: submissions.map((sub) => ({
				game: sub.game,
				platform: sub.platform,
				techPlatform: sub.techPlatform ?? undefined,
				ageRating: sub.ageRating,
			})),
		},
		events: events.map((event) => ({
			id: event.id,
			shortname: event.shortname,
			submissionInstructions: event.submissionInstructions ?? null,
			startDate: event.timeSettings?.startTime ?? "",
			endDate: event.timeSettings?.endTime ?? "",
			eventTimezone: event.timeSettings?.timezone ?? "",
		})),
	};

	if (data.events.length === 0) {
		return (
			<div>
				<h2>Unfortunately we have no events currently accepting volunteers.</h2>
				<p>Join our Discord to stay up to date!</p>
				<Button component="a" href="/discord">
					Discord
				</Button>
				<Button component="a" href="/" leftSection={<Home />}>
					Home
				</Button>
			</div>
		);
	}

	return (
		<div className={styles.page}>
			<VolunteerForm events={data.events} />
		</div>
	);
}
