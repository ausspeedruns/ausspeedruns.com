import { getPayload } from "payload";
import type { Metadata } from "next";
import Image from "next/image";
import { Badge, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import payloadConfig from "#payload-config";
import { Goal } from "./components/Goal";
import { War } from "./components/War";
import { Goal as GoalSchema, War as WarSchema } from "./incentiveType";
import styles from "./page.module.css";
import type z from "zod";
import type { Media } from "#/payload-types";
import { getMediaUrl } from "#/utilities/getMediaUrl";
import { findCanonicalCase } from "#utilities/caseInsensitive.ts";
import { permanentRedirect } from "next/navigation";

interface URLProps {
	params: Promise<{
		event?: string;
	}>;
}

type WarIncentive = z.infer<typeof WarSchema>;
type GoalIncentive = z.infer<typeof GoalSchema>;
type IncentiveItem = WarIncentive | GoalIncentive;

function parseIncentive(incentive: unknown): IncentiveItem | null {
	const warParse = WarSchema.safeParse(incentive);
	if (warParse.success) {
		return warParse.data;
	}

	const goalParse = GoalSchema.safeParse(incentive);
	if (goalParse.success) {
		return goalParse.data;
	}

	return null;
}

function getScheduledTimeValue(incentive: IncentiveItem): number {
	const parsedTime = Date.parse(incentive.run.scheduledTime);
	return Number.isNaN(parsedTime) ? Number.MAX_SAFE_INTEGER : parsedTime;
}

function renderIncentive(incentive: IncentiveItem) {
	if (incentive.type === "war") {
		return <War key={incentive.id} {...incentive} />;
	}

	return <Goal key={incentive.id} {...incentive} />;
}

function getMediaObject(value?: number | Media | null): Media | null {
	return value && typeof value === "object" ? value : null;
}

export async function generateMetadata({ params }: URLProps): Promise<Metadata> {
	const { event: eventShortName } = await params;

	return {
		title: eventShortName ? `${eventShortName} Incentives` : "Incentives",
		description: eventShortName
			? `Incentives for ${eventShortName} on AusSpeedruns`
			: "Incentives for AusSpeedruns events",
		openGraph: {
			title: eventShortName ? `${eventShortName} Incentives` : "Incentives",
			description: eventShortName
				? `Incentives for ${eventShortName} on AusSpeedruns`
				: "Incentives for AusSpeedruns events",
		},
	};
}

export default async function EventSchedule({ params }: URLProps) {
	const { event: eventShortName } = await params;

	if (!eventShortName) {
		return <div>No event specified.</div>;
	}

	const payload = await getPayload({ config: payloadConfig });
	const event = await payload
		.find({
			collection: "events",
			depth: 1,
			where: {
				shortName: {
					equals: eventShortName,
				},
			},
			select: {
				id: true,
				name: true,
				media: {
					logo: true,
					logoDarkMode: true,
				},
			},
		})
		.then((res) => res.docs[0]);

	if (!event) {
		const canonical = await findCanonicalCase({
			payload,
			collection: "events",
			field: "shortName",
			value: eventShortName,
		});
		if (canonical) permanentRedirect(`/incentives/${encodeURIComponent(canonical)}`);

		return (
			<div>
				<h1>Event not found</h1>
				<p>The specified event could not be found.</p>
			</div>
		);
	}

	const incentives = await payload.find({
		collection: "incentives",
		depth: 2,
		pagination: false,
		where: {
			event: {
				equals: event.id,
			},
		},
		populate: {
			runs: {
				game: true,
				category: true,
				scheduledTime: true,
			},
		},
		select: {
			title: true,
			type: true,
			description: true,
			notes: true,
			isActive: true,
			data: true,
			run: true,
		},
	});

	const parsedIncentives = incentives.docs
		.map((incentive) => parseIncentive(incentive))
		.filter((incentive): incentive is IncentiveItem => incentive !== null)
		.sort((a, b) => getScheduledTimeValue(a) - getScheduledTimeValue(b));

	const activeIncentives = parsedIncentives.filter((incentive) => incentive.isActive);
	const inactiveIncentives = parsedIncentives.filter((incentive) => !incentive.isActive);

	const now = Date.now();
	const nextIncentive =
		activeIncentives.find((incentive) => getScheduledTimeValue(incentive) >= now) ?? activeIncentives[0] ?? null;
	const logo = getMediaObject(event.media?.logoDarkMode) ?? getMediaObject(event.media?.logo);

	return (
		<div className={styles.page}>
			<Paper component="header" className={styles.hero} withBorder radius={0}>
				{logo?.url ? (
					<div className={styles.logoContainer}>
						<Image
							src={getMediaUrl(logo.url)}
							fill
							alt={logo.alt || `${event.name} logo`}
							sizes="(max-width: 800px) 160px, 240px"
							className={styles.logoImage}
						/>
					</div>
				) : null}
				<Text className={styles.kicker}>Donation Incentives</Text>
				<Title order={1} className={styles.title}>
					{event.name}
				</Title>
				<Text className={styles.subtitle}>
					Track progress for goals and wars. Active incentives are shown first, with inactive incentives
					archived at the bottom.
				</Text>

				<SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" className={styles.stats}>
					<div className={styles.statCard}>
						<Text className={styles.statLabel}>Active</Text>
						<Text className={styles.statValue}>{activeIncentives.length}</Text>
					</div>
					<div className={styles.statCard}>
						<Text className={styles.statLabel}>Inactive</Text>
						<Text className={styles.statValue}>{inactiveIncentives.length}</Text>
					</div>
					<div className={styles.statCard}>
						<Text className={styles.statLabel}>Total</Text>
						<Text className={styles.statValue}>{parsedIncentives.length}</Text>
					</div>
				</SimpleGrid>
			</Paper>

			{nextIncentive ? (
				<section className={styles.section}>
					<Group justify="space-between" align="center" wrap="wrap">
						<Title order={2} className={styles.sectionTitle}>
							Next Incentive
						</Title>
						<Badge radius={0} variant="light" color="blue">
							Spotlight
						</Badge>
					</Group>
					<div className={styles.nextIncentive}>{renderIncentive(nextIncentive)}</div>
				</section>
			) : null}

			<section className={styles.section}>
				<Group justify="space-between" align="center" wrap="wrap">
					<Title order={2} className={styles.sectionTitle}>
						Active Incentives
					</Title>
					<Badge radius={0} variant="light" color="lime">
						{activeIncentives.length}
					</Badge>
				</Group>
				{activeIncentives.length > 0 ? (
					<Stack gap="sm" className={styles.incentiveList}>
						{activeIncentives.map((incentive) => renderIncentive(incentive))}
					</Stack>
				) : (
					<Text className={styles.emptyState}>No active incentives are available right now.</Text>
				)}
			</section>

			<section className={styles.section}>
				<Group justify="space-between" align="center" wrap="wrap">
					<Title order={2} className={styles.sectionTitle}>
						Inactive Incentives
					</Title>
					<Badge radius={0} variant="light" color="gray">
						{inactiveIncentives.length}
					</Badge>
				</Group>
				{inactiveIncentives.length > 0 ? (
					<Stack gap="sm" className={styles.incentiveList}>
						{inactiveIncentives.map((incentive) => renderIncentive(incentive))}
					</Stack>
				) : (
					<Text className={styles.emptyState}>No inactive incentives for this event.</Text>
				)}
			</section>
		</div>
	);
}
