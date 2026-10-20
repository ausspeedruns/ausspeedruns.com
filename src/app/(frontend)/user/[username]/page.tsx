import type { Metadata } from "next";
import { Button, Card, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { AtSign, Tv } from "lucide-react";
import type { Run as RunType } from "#/payload-types";
import { headers } from "next/headers";
import config from "#payload-config";

import configPromise from "#payload-config";
import { getPayload } from "payload";
import { notFound } from "next/navigation";
import { cache } from "react";

import styles from "./page.module.css";
import { UserNavigation } from "./user-navigation";
import { Run } from "./run";
import { getEventLabel } from "./getEventLabel";
import { UpcomingRun } from "./upcoming-run";
import { getGameName } from "#utilities/runDisplay.ts";

type Args = {
	params: Promise<{
		username: string;
	}>;
};

export default async function UserPage({ params: paramsPromise }: Args) {
	const { username } = await paramsPromise;
	const decodedUsername = decodeURIComponent(username);
	const user = await queryUserByUsername(decodedUsername);

	if (!user) {
		notFound();
	}

	const payload = await getPayload({ config });
	const userHeaders = await headers();
	const auth = await payload.auth({ headers: userHeaders });

	const currentTime = new Date();
	const runs = await queryRunsByUser(user.id);
	const historicalRuns = runs.filter((run) => !run.scheduledTime || new Date(run.scheduledTime) < currentTime);
	const upcomingRuns = runs
		.filter((run) => run.scheduledTime && new Date(run.scheduledTime) >= currentTime)
		.map((run, index) => ({
			id: run.id,
			date: run.scheduledTime ? formatDate(run.scheduledTime) : "Schedule TBD",
			estimate: run.estimate,
			game: getGameName(run.game),
			event: getEventLabel(run),
			mode: run.isRace ? "Race" : run.isCoop ? "Co-op" : "",
			isHighlighted: index === 1,
		}));

	const socialItems = [
		{
			label: "Twitch",
			href: user.socials?.twitch ? `https://twitch.tv/${user.socials.twitch}` : undefined,
			icon: Tv,
		},
		{
			label: "Bluesky",
			href: user.socials?.bluesky ? `https://bsky.app/profile/${user.socials.bluesky}` : undefined,
			icon: AtSign,
		},
	].filter((item) => item.href);

	return (
		<article className={styles.page}>
			<Container className={styles.main} size="xl">
				<section className={styles.heroSection}>
					<div className={styles.titleBlock}>
						<Title className={styles.heroTitle} order={1}>
							{user.username}
						</Title>
						{user.pronouns && <Text className={styles.pronouns}>{user.pronouns}</Text>}
					</div>

					<div className={styles.quickPanel}>
						<Group gap="sm">
							{socialItems.map((item) => {
								const Icon = item.icon;
								return (
									<Button
										leftSection={<Icon size={16} />}
										key={item.label}
										component="a"
										href={item.href}
										target="_blank"
										rel="noreferrer"
									>
										{item.label}
									</Button>
								);
							})}
						</Group>

						{auth.user?.id === user.id && <UserNavigation />}
					</div>
				</section>

				<div className={styles.contentGrid}>
					<section className={styles.historySection}>
						<div className={styles.sectionHeader}>
							<Title className={styles.sectionTitle} order={2}>
								Runs
							</Title>
						</div>

						{historicalRuns.length === 0 ? (
							<Card className={styles.emptyState}>
								<Text c="dimmed">No runs.</Text>
							</Card>
						) : (
							<SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
								{historicalRuns.map((run) => (
									<Run key={run.id} run={run} />
								))}
							</SimpleGrid>
						)}
					</section>

					<aside className={styles.upcomingSection}>
						<div className={styles.sectionHeader}>
							<Title className={styles.sectionTitleAlt} data-text="Upcoming" order={2}>
								Upcoming
							</Title>
						</div>

						{upcomingRuns.length === 0 ? (
							<Card className={styles.emptyState}>
								<Text c="dimmed">No upcoming runs scheduled.</Text>
							</Card>
						) : (
							<Stack gap="xs">
								{upcomingRuns.map((run) => (
									<UpcomingRun key={run.id} run={run} />
								))}
							</Stack>
						)}
					</aside>
				</div>
			</Container>
		</article>
	);
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
	const { username } = await paramsPromise;
	const decodedUsername = decodeURIComponent(username);
	const user = await queryUserByUsername(decodedUsername);

	if (!user) {
		return {
			title: "User Not Found",
		};
	}

	return {
		title: `${user.username} | AusSpeedruns`,
		description: `${user.username}'s profile on AusSpeedruns`,
	};
}

const queryUserByUsername = cache(async (username: string) => {
	const payload = await getPayload({ config: configPromise });

	const result = await payload.find({
		collection: "users",
		limit: 1,
		pagination: false,
		overrideAccess: true,
		where: {
			username: {
				equals: username,
			},
		},
		select: {
			username: true,
			name: true,
			pronouns: true,
			state: true,
			socials: true,
		},
	});

	return result.docs?.[0] || null;
});

const queryRunsByUser = cache(async (userId: string): Promise<RunType[]> => {
	const payload = await getPayload({ config: configPromise });

	const result = await payload.find({
		collection: "runs",
		pagination: false,
		overrideAccess: true,
		depth: 1,
		sort: "-scheduledTime",
		where: {
			runners: {
				contains: userId,
			},
		},
		populate: {
			games: { name: true },
			events: { name: true, shortName: true },
		},
	});

	return result.docs as RunType[];
});

function formatDate(value: string): string {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "Schedule TBD";
	}

	return new Intl.DateTimeFormat("en-AU", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
}
