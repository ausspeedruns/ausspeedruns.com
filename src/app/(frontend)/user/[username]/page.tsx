import type { Metadata } from "next";
import { Anchor, Badge, Box, Container, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { AtSign, MessageCircle, PlayCircle, Trophy, Tv, Users } from "lucide-react";
import type { Run } from "#/payload-types";

import configPromise from "#payload-config";
import { getPayload } from "payload";
import { notFound } from "next/navigation";
import { cache } from "react";

import styles from "./page.module.css";
import { UserNavigation } from "./user-navigation";

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

	const runs = (user.speedrunData?.runs?.docs ?? []).filter((run): run is Run => typeof run !== "number");
	const historicalRuns = runs.slice(0, 4);
	const upcomingRuns = runs
		.filter((run) => Boolean(run.scheduledTime || run.estimate))
		.slice(0, 3)
		.map((run, index) => ({
			id: run.id,
			date: run.scheduledTime ? formatDate(run.scheduledTime) : "Schedule TBD",
			estimate: run.estimate,
			game: run.game,
			event: getEventLabel(run),
			mode: run.isRace ? "Race" : run.isCoop ? "Co-op" : "Solo Showcase",
			isHighlighted: index === 1,
		}));

	const socialItems = [
		{
			label: "Twitch",
			href: user.socials?.Twitch ? `https://twitch.tv/${user.socials.Twitch}` : undefined,
			icon: Tv,
		},
		{
			label: "Bluesky",
			href: user.socials?.Bluesky ? `https://bsky.app/profile/${user.socials.Bluesky}` : undefined,
			icon: AtSign,
		},
		{
			label: "Discord",
			href: user.socials?.Discord ? `https://discord.com/users/${user.socials.Discord}` : undefined,
			icon: MessageCircle,
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
						<Group className={styles.socialLinks} gap="sm">
							{socialItems.map((item) => {
								const Icon = item.icon;
								return (
									<Anchor
										className={styles.socialPill}
										href={item.href}
										key={item.label}
										rel="noreferrer"
										target="_blank"
									>
										<Icon size={16} />
										<Text>{item.label}</Text>
									</Anchor>
								);
							})}
						</Group>

						<UserNavigation />
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
							<Paper className={styles.emptyState} withBorder>
								<Text c="dimmed">No historical runs available yet.</Text>
							</Paper>
						) : (
							<SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
								{historicalRuns.map((run, index) => (
									<article className={styles.runCard} key={run.id}>
										<Box className={styles.thumbWrap}>
											<div className={styles.overlay}>
												<PlayCircle className={styles.playIcon} size={58} />
											</div>
											<Badge className={styles.cardBadge}>{getEventLabel(run)}</Badge>
										</Box>

										<Stack className={styles.cardBody} gap="md">
											<Group align="flex-start" justify="space-between" wrap="nowrap">
												<div>
													<Title className={styles.runTitle} order={3}>
														{run.game}
													</Title>
													<Text
														className={styles.runMeta}
													>{`${run.category} · ${run.platform}`}</Text>
												</div>
												<div className={styles.timeBlock}>
													<Text className={styles.finalTime}>{run.time || "TBD"}</Text>
													<Text className={styles.timeLabel}>Final time</Text>
												</div>
											</Group>

											<Group className={styles.cardFooter} gap="sm" wrap="nowrap">
												<Box className={styles.trophyBox}>
													{index % 2 === 0 ? <Trophy size={14} /> : <Users size={14} />}
												</Box>
												<Text className={styles.eventLine}>{getEventLabel(run)}</Text>
											</Group>
										</Stack>
									</article>
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
							<Paper className={styles.emptyState} withBorder>
								<Text c="dimmed">No upcoming schedule published.</Text>
							</Paper>
						) : (
							<Stack gap="xs">
								{upcomingRuns.map((run) => (
									<article
										className={`${styles.scheduleItem} ${run.isHighlighted ? styles.scheduleItemHighlight : ""}`}
										key={run.id}
									>
										<div className={styles.scheduleRail} />
										<Group justify="space-between" wrap="nowrap">
											<Text className={styles.scheduleDate}>{run.date}</Text>
											<Badge className={styles.scheduleEstimate} variant="outline">
												EST: {run.estimate}
											</Badge>
										</Group>
										<div>
											<Title className={styles.scheduleTitle} order={4}>
												{run.game}
											</Title>
											<Text className={styles.scheduleEvent}>{run.event}</Text>
										</div>
										<Group justify="space-between" wrap="nowrap">
											<Group className={styles.avatarGroup} gap={0}>
												<Box className={styles.avatarDot} />
												<Box className={styles.avatarDotAlt} />
											</Group>
											<Text className={styles.scheduleMode}>{run.mode}</Text>
										</Group>
									</article>
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
			speedrunData: true,
		},
	});

	return result.docs?.[0] || null;
});

function getEventLabel(run: Run): string {
	if (!run.event || typeof run.event === "number") {
		return "Event Pending";
	}

	return run.event.shortName || run.event.name || "Event Pending";
}

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
