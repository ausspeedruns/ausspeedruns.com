import type { ReactNode } from "react";
import { getPayload } from "payload";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { Badge, Box, Card, Container, Divider, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import payloadConfig from "#payload-config";
import type { Incentive, Media } from "#/payload-types";
import { getMediaUrl } from "#/utilities/getMediaUrl";
import { findCanonicalCase } from "#utilities/caseInsensitive.ts";
import { getRunDisplayName, getRunCategoryLabel } from "#utilities/runDisplay.ts";
import { validateIncentiveData, type Goal as GoalData, type War as WarData } from "#utilities/schedule/incentives.ts";
import { Goal } from "./components/Goal";
import { War } from "./components/War";
import type { IncentiveItem } from "./incentiveType";
import styles from "./page.module.css";

// Totals change throughout an event, so regenerate the page at most a minute after it goes stale
export const revalidate = 60;

interface URLProps {
	params: Promise<{
		event?: string;
	}>;
}

function toIncentiveItem(incentive: Incentive): IncentiveItem | null {
	if (validateIncentiveData(incentive.data, incentive.type) !== true || !incentive.data) return null;

	const run = incentive.run && typeof incentive.run === "object" ? incentive.run : null;
	const base = {
		id: incentive.id,
		title: incentive.title,
		// Legacy incentives keep their public blurb in notes
		description: incentive.description || incentive.notes || null,
		isActive: incentive.isActive ?? true,
		run: run
			? {
					name: getRunDisplayName(run),
					category: getRunCategoryLabel(run),
					scheduledTime: run.scheduledTime ?? null,
				}
			: null,
	};

	return incentive.type === "goal"
		? { ...base, type: "goal", data: incentive.data as unknown as GoalData }
		: { ...base, type: "war", data: incentive.data as unknown as WarData };
}

function getScheduledTimeValue(incentive: IncentiveItem): number {
	const parsedTime = incentive.run?.scheduledTime ? Date.parse(incentive.run.scheduledTime) : Number.NaN;
	return Number.isNaN(parsedTime) ? Number.MAX_SAFE_INTEGER : parsedTime;
}

function renderIncentive(incentive: IncentiveItem, highlighted = false) {
	if (incentive.type === "war") {
		return <War key={incentive.id} incentive={incentive} highlighted={highlighted} />;
	}

	return <Goal key={incentive.id} incentive={incentive} highlighted={highlighted} />;
}

function getMediaObject(value?: number | Media | null): Media | null {
	return value && typeof value === "object" && value.url ? value : null;
}

interface SectionProps {
	title: string;
	count?: number;
	accent?: boolean;
	children: ReactNode;
}

function Section({ title, count, accent, children }: SectionProps) {
	return (
		<Box component="section">
			<Group justify="space-between" align="flex-end" wrap="nowrap">
				<Title className={styles.sectionTitle} order={2} c={accent ? "ausSpeedrunsOrange" : undefined}>
					{title}
				</Title>
				{count !== undefined && (
					<Badge color="ausSpeedrunsBlue" variant="outline" flex="none">
						{count}
					</Badge>
				)}
			</Group>
			<Divider mt="sm" mb="lg" />
			{children}
		</Box>
	);
}

function EmptyState({ children }: { children: ReactNode }) {
	return (
		<Card withBorder>
			<Text c="dimmed">{children}</Text>
		</Card>
	);
}

export async function generateMetadata({ params }: URLProps): Promise<Metadata> {
	const { event: eventShortName } = await params;
	const title = eventShortName ? `${eventShortName} Incentives` : "Incentives";
	const description = eventShortName
		? `Incentives for ${eventShortName} on AusSpeedruns`
		: "Incentives for AusSpeedruns events";

	return {
		title,
		description,
		openGraph: { title, description },
	};
}

export default async function EventIncentives({ params }: URLProps) {
	const { event: eventShortName } = await params;

	if (!eventShortName) notFound();

	const payload = await getPayload({ config: payloadConfig });
	const event = await payload
		.find({
			collection: "events",
			depth: 1,
			limit: 1,
			pagination: false,
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
		notFound();
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
				type: true,
				title: true,
				game: true,
				category: true,
				scheduledTime: true,
			},
			games: {
				name: true,
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
		.map((incentive) => toIncentiveItem(incentive as Incentive))
		.filter((incentive): incentive is IncentiveItem => incentive !== null)
		.sort((a, b) => getScheduledTimeValue(a) - getScheduledTimeValue(b));

	const activeIncentives = parsedIncentives.filter((incentive) => incentive.isActive);
	const closedIncentives = parsedIncentives.filter((incentive) => !incentive.isActive);

	const now = Date.now();
	const nextIncentive = activeIncentives.find((incentive) => {
		const time = getScheduledTimeValue(incentive);
		return time >= now && time !== Number.MAX_SAFE_INTEGER;
	});
	const otherActiveIncentives = activeIncentives.filter((incentive) => incentive !== nextIncentive);

	const lightLogo = getMediaObject(event.media?.logo);
	const darkLogo = getMediaObject(event.media?.logoDarkMode);

	return (
		<Container component="main" className={styles.page} size="xl" pt="3rem" pb="4rem" w="100%">
			<Stack component="header" gap="lg" mb="xl">
				{lightLogo && darkLogo ? (
					<>
						<EventLogo logo={lightLogo} alt={`${event.name} logo`} darkHidden />
						<EventLogo logo={darkLogo} alt={`${event.name} logo`} lightHidden />
					</>
				) : (
					<EventLogo logo={lightLogo ?? darkLogo} alt={`${event.name} logo`} />
				)}
				<div>
					<Title
						className={styles.heroTitle}
						order={1}
						ff="Jersey10, var(--mantine-font-family)"
						fw="normal"
						tt="uppercase"
						lts="0.05em"
					>
						Incentives
					</Title>
					<Text c="dimmed">{event.name}</Text>
				</div>
				<Text maw="62ch">
					Push goals over the line and vote in bid wars by mentioning an incentive in your donation message.
				</Text>
				<Divider />
			</Stack>

			<Stack gap="3rem">
				{nextIncentive && (
					<Section title="Up Next" accent>
						{renderIncentive(nextIncentive, true)}
					</Section>
				)}

				<Section title="Open" count={activeIncentives.length} accent>
					{otherActiveIncentives.length > 0 ? (
						<SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
							{otherActiveIncentives.map((incentive) => renderIncentive(incentive))}
						</SimpleGrid>
					) : (
						<EmptyState>
							{nextIncentive ? "No other open incentives." : "No incentives are open right now."}
						</EmptyState>
					)}
				</Section>

				<Section title="Closed" count={closedIncentives.length}>
					{closedIncentives.length > 0 ? (
						<SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
							{closedIncentives.map((incentive) => renderIncentive(incentive))}
						</SimpleGrid>
					) : (
						<EmptyState>No closed incentives for this event.</EmptyState>
					)}
				</Section>
			</Stack>
		</Container>
	);
}

interface EventLogoProps {
	logo: Media | null;
	alt: string;
	darkHidden?: boolean;
	lightHidden?: boolean;
}

function EventLogo({ logo, alt, darkHidden, lightHidden }: EventLogoProps) {
	if (!logo?.url) return null;

	return (
		<Box className={styles.logoContainer} darkHidden={darkHidden} lightHidden={lightHidden}>
			<Image
				src={getMediaUrl(logo.url)}
				fill
				priority
				alt={logo.alt || alt}
				sizes="(max-width: 768px) 80vw, 450px"
				className={styles.logoImage}
			/>
		</Box>
	);
}
