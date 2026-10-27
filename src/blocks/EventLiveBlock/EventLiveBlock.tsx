import React, { Fragment } from "react";
import Link from "next/link";
import { Title } from "@mantine/core";
import type { EventLiveBlock as EventLiveBlockProps, Media as MediaDoc } from "#/payload-types";
import { getMediaUrl } from "#/utilities/getMediaUrl";
import { Media } from "#/components/Media/Media";
import { formatEventDateRange, resolveEvent } from "#/utilities/events/postEventData";
import { getEventLiveData } from "#/utilities/events/liveData";
import { EventLiveClient } from "./EventLive.client";
import styles from "./EventLiveBlock.module.css";

type Sponsor = NonNullable<EventLiveBlockProps["majorSponsors"]>[number];

function SponsorLogos({ sponsors, tier }: { sponsors: Sponsor[]; tier: "major" | "minor" }) {
	return (
		<ul className={styles.sponsorList} data-tier={tier}>
			{sponsors.map((sponsor, index) => {
				const image = (
					<Media
						resource={sponsor.logo}
						alt={sponsor.name ?? undefined}
						imgClassName={styles.sponsorLogo}
						size={tier === "major" ? "280px" : "180px"}
					/>
				);
				const isExternal = sponsor.url ? /^https?:\/\//.test(sponsor.url) : false;
				return (
					<li key={sponsor.id ?? index}>
						{sponsor.url ? (
							<a
								href={sponsor.url}
								className={styles.sponsorLink}
								{...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
							>
								{image}
							</a>
						) : (
							image
						)}
					</li>
				);
			})}
		</ul>
	);
}

const asMedia = (value: number | MediaDoc | null | undefined): MediaDoc | null =>
	value && typeof value === "object" ? value : null;

/** Block background → event hero → CSS pattern (rendered when this returns null). */
function renderBackdrop(
	background: EventLiveBlockProps["background"],
	eventHero: number | MediaDoc | null | undefined,
) {
	const custom = asMedia(background?.image);
	const image = custom ?? asMedia(eventHero);
	if (!image?.url) return null;

	if (custom && background?.mode === "tile") {
		return (
			<div
				className={styles.backdrop}
				key="backdrop"
				data-mode="tile"
				style={{
					backgroundImage: `url("${getMediaUrl(image.url, image.updatedAt)}")`,
					backgroundSize: background.tileSize ? `${background.tileSize}px auto` : undefined,
				}}
			/>
		);
	}

	return (
		<Media
			key="backdrop"
			className={styles.backdrop}
			pictureClassName={styles.fillPicture}
			imgClassName={styles.backdropImage}
			resource={image}
			fill
			size="100vw"
		/>
	);
}

const withLogo = (sponsors: Sponsor[] | null | undefined) =>
	(sponsors ?? []).filter((sponsor) => sponsor.logo && typeof sponsor.logo === "object");

export async function EventLiveBlock(props: EventLiveBlockProps) {
	const { location, donateUrl } = props;
	const event = await resolveEvent(props.event);
	if (!event) return null;

	const initialData = await getEventLiveData(event.id);
	const logo = event.media?.logoDarkMode ?? event.media?.logo;
	const dateRange = formatEventDateRange(event);
	const majorSponsors = withLogo(props.majorSponsors);
	const minorSponsors = withLogo(props.minorSponsors);

	const backdrop = renderBackdrop(props.background, event.media?.hero);

	const eventInfo = (
		<Fragment key="event-info">
			<Title order={2} className={styles.eventName}>
				<Link href={`/${event.shortName}`} className={styles.eventLogo}>
					{logo ? (
						<Media
							resource={logo}
							alt={event.name}
							imgClassName={styles.eventLogoImage}
							size="(max-width: 768px) 80vw, 480px"
							priority
						/>
					) : (
						event.name
					)}
				</Link>
			</Title>
			{dateRange || location ? (
				<p className={styles.eventMeta}>
					{dateRange ? <span>{dateRange}</span> : null}
					{location ? <span>{location}</span> : null}
				</p>
			) : null}
		</Fragment>
	);

	return (
		<EventLiveClient
			eventId={event.id}
			shortName={event.shortName}
			initialData={initialData}
			renderedAt={Date.now()}
			raised={event.postEvent?.raised}
			donateUrl={donateUrl}
			backdrop={backdrop}
			eventInfo={eventInfo}
			majorSponsors={
				majorSponsors.length > 0 ? (
					<SponsorLogos key="major-sponsors" sponsors={majorSponsors} tier="major" />
				) : null
			}
			minorSponsors={
				minorSponsors.length > 0 ? (
					<section
						key="minor-sponsors"
						className={styles.minorSponsors}
						aria-labelledby="event-live-sponsors"
					>
						<Title order={3} size="h4" id="event-live-sponsors" ta="center" mb="md">
							Thank you to our sponsors
						</Title>
						<SponsorLogos sponsors={minorSponsors} tier="minor" />
					</section>
				) : null
			}
		/>
	);
}
