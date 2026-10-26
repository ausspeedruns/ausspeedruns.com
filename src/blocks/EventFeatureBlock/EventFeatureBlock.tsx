import React from "react";
import type { EventFeatureBlock as EventFeatureBlockProps } from "#/payload-types";
import { Container, Group, Stack, Text, Title } from "@mantine/core";
import { Media } from "#/components/Media/Media";
import { formatCurrency, formatEventDateRange, resolveEvent } from "#/utilities/events/postEventData";
import { HeroButton } from "#/blocks/EventHeroBlock/HeroButton";
import { EventCountdown } from "./EventCountdown";
import styles from "./EventFeatureBlock.module.css";

export async function EventFeatureBlock(props: EventFeatureBlockProps) {
	const { description, showDates = true, showCountdown, showRaised = true, buttonLabel, buttonUrl, extraLinks } = props;
	const event = await resolveEvent(props.event);
	if (!event) return null;

	const logo = event.media?.logoDarkMode ?? event.media?.logo;
	const hero = event.media?.hero;
	const dateRange = showDates ? formatEventDateRange(event) : null;
	const startTime = event.timeSettings?.startTime;
	const countdownTarget = showCountdown && startTime && new Date(startTime) > new Date() ? startTime : null;
	const raised = showRaised && event.postEvent?.raised ? formatCurrency(event.postEvent.raised) : null;

	const buttons = [
		{ label: buttonLabel || event.shortName, url: buttonUrl || `/${event.shortName}` },
		...(extraLinks ?? []).filter((link) => link.label && link.url),
	];

	return (
		<section className={styles.container} data-full-bleed>
			{hero ? (
				<Media
					className={styles.backdrop}
					pictureClassName={styles.fillPicture}
					imgClassName={styles.backdropImage}
					resource={hero}
					fill
					size="100vw"
				/>
			) : null}
			<Container size="lg" className={styles.inner}>
				<Stack gap="xs" className={styles.text}>
					<Title order={2} className={styles.heading}>
						{event.name}
					</Title>
					{dateRange ? (
						<Text fw={600} className={styles.dates}>
							{dateRange}
						</Text>
					) : null}
					{countdownTarget ? <EventCountdown startTime={countdownTarget} /> : null}
					{description ? (
						<Text maw="40ch" className={styles.description}>
							{description}
						</Text>
					) : null}
					<Group gap="sm" mt="md">
						{buttons.map((button, index) => (
							<HeroButton
								key={`${button.url}-${index}`}
								label={button.label}
								url={button.url}
								primary={index === 0}
							/>
						))}
					</Group>
				</Stack>
				<Stack align="center" gap="md" className={styles.visual}>
					{logo ? (
						<Media
							className={styles.logoWrap}
							imgClassName={styles.logo}
							resource={logo}
							size="(max-width: 768px) 80vw, 480px"
						/>
					) : null}
					{raised ? (
						<Text className={styles.raised} aria-label={`${raised} raised`}>
							{raised}
						</Text>
					) : null}
				</Stack>
			</Container>
		</section>
	);
}
