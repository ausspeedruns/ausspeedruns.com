import type { Metadata } from "next";
import { Button, Card, Container, Divider, Grid, GridCol, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Bluesky, Video } from "pixelarticons/react";
import type { Run as RunType } from "#/payload-types";
import { headers } from "next/headers";
import config from "#payload-config";

import configPromise from "#payload-config";
import { getPayload } from "payload";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import styles from "./page.module.css";
import { UserNavigation } from "./UserNavigation";
import { Run } from "./Run";
import { getEventLabel } from "./getEventLabel";
import { UpcomingRun } from "./UpcomingRun";
import { countedRunsWhere, getRunDisplayName } from "#utilities/runDisplay.ts";
import { findCanonicalCase } from "#utilities/caseInsensitive.ts";

type Args = {
	params: Promise<{
		username: string;
	}>;
};

export default async function UserPage({ params: paramsPromise }: Args) {
	const { username } = await paramsPromise;
	const decodedUsername = decodeURIComponent(username);
	const user = await queryUserByUsername(decodedUsername);
	const payload = await getPayload({ config });

	if (!user) {
		const canonical = await findCanonicalCase({
			payload,
			collection: "users",
			field: "username",
			value: decodedUsername,
			overrideAccess: true,
		});
		if (canonical) permanentRedirect(`/user/${encodeURIComponent(canonical)}`);
		notFound();
	}

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
			game: getRunDisplayName(run),
			event: getEventLabel(run),
			mode: run.isRace ? "Race" : run.isCoop ? "Co-op" : "",
			isHighlighted: index === 1,
		}));

	const socialItems = [
		{
			label: "Twitch",
			href: user.socials?.twitch ? `https://twitch.tv/${user.socials.twitch}` : undefined,
			icon: Video,
		},
		{
			label: "Bluesky",
			href: user.socials?.bluesky ? `https://bsky.app/profile/${user.socials.bluesky}` : undefined,
			icon: Bluesky,
		},
	].filter((item) => item.href);

	return (
		<Container component="article" size="xl" pt="3rem" pb="4rem">
			<Stack component="section" gap="lg" mb="md">
				<div>
					<Title
						className={styles.heroTitle}
						order={1}
						ff="Jersey10, var(--mantine-font-family)"
						fw="normal"
						tt="uppercase"
						lts="0.05em"
					>
						{user.username}
					</Title>
					{user.pronouns && <Text c="dimmed">{user.pronouns}</Text>}
				</div>

				<Divider />

				{(socialItems.length > 0 || auth.user?.id === user.id) && (
					<>
						<div>
							{socialItems.length > 0 && (
								<Group gap="sm">
									{socialItems.map((item) => {
										const Icon = item.icon;
										return (
											<Button
												leftSection={<Icon width={16} height={16} />}
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
							)}

							{auth.user?.id === user.id && <UserNavigation />}
						</div>

						<Divider />
					</>
				)}
			</Stack>

			<Grid gap="xl" align="flex-start">
				<GridCol component="section" span={{ base: 12, lg: 8 }}>
					<Title className={styles.sectionTitle} order={2} c="ausSpeedrunsOrange">
						Runs
					</Title>
					<Divider mt="sm" mb="lg" />

					{historicalRuns.length === 0 ? (
						<Card withBorder>
							<Text c="dimmed">No runs.</Text>
						</Card>
					) : (
						<SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
							{historicalRuns.map((run) => (
								<Run key={run.id} run={run} />
							))}
						</SimpleGrid>
					)}
				</GridCol>

				<GridCol component="aside" span={{ base: 12, lg: 4 }}>
					<Title className={styles.sectionTitle} order={2}>
						Upcoming
					</Title>
					<Divider mt="sm" mb="lg" />

					{upcomingRuns.length === 0 ? (
						<Card withBorder>
							<Text c="dimmed">No upcoming runs scheduled.</Text>
						</Card>
					) : (
						<Stack gap="xs">
							{upcomingRuns.map((run) => (
								<UpcomingRun key={run.id} run={run} />
							))}
						</Stack>
					)}
				</GridCol>
			</Grid>
		</Container>
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
			and: [{ runners: { contains: userId } }, countedRunsWhere],
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
