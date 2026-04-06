import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import configPromise from "#payload-config";
import { getPayload } from "payload";

import type { Event, Media } from "#/payload-types";
import { getMediaUrl } from "#/utilities/getMediaUrl";
import styles from "./events.module.css";

export const metadata: Metadata = {
	title: "Events",
	description: "A list of all of our upcoming and past events.",
};

export default async function Events() {
	const payload = await getPayload({ config: configPromise });
	const result = await payload.find({
		collection: "events",
		depth: 2,
		overrideAccess: false,
		pagination: false,
		sort: "-timeSettings.startTime",
		where: {
			_status: {
				equals: "published",
			},
		},
	});

	const events = result.docs as Event[];
	const now = new Date();
	const upcomingEvents = events.filter((event) => {
		const endTime = event.timeSettings?.endTime ?? event.timeSettings?.startTime;
		return endTime ? new Date(endTime) >= now : false;
	});
	const pastEvents = events.filter((event) => {
		const startTime = event.timeSettings?.startTime ?? event.timeSettings?.endTime;
		return startTime ? new Date(startTime) < now : false;
	});

	return (
		<main className={`container ${styles.main}`}>
			<div className={styles.header}>
				<h1>Events</h1>
			</div>

			{upcomingEvents.length > 0 && (
				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>Upcoming</h2>
					<div className={styles.grid}>
						{upcomingEvents.map((event) => (
							<EventBlock key={event.shortName} event={event} />
						))}
					</div>
				</section>
			)}

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Past</h2>
				<div className={styles.grid}>
					{pastEvents.map((event) => (
						<EventBlock key={event.shortName} event={event} />
					))}
				</div>
			</section>
		</main>
	);
}

interface EventBlockProps {
	event: Event;
}

function EventBlock({ event }: EventBlockProps) {
	const logo = getMediaObject(event.media?.logoDarkMode) ?? getMediaObject(event.media?.logo);
	const heroImage = getMediaObject(event.media?.hero);
	const heroUrl = getMediaUrl(heroImage?.url);

	const dateString =
		event.timeSettings?.startTime && event.timeSettings?.endTime
			? `${new Date(event.timeSettings.startTime).toLocaleDateString()} – ${new Date(
					event.timeSettings.endTime,
				).toLocaleDateString()}`
			: "";

	const raisedString = event.postEvent?.raised ? `$${event.postEvent.raised.toLocaleString()}` : "";

	return (
		<Link href={`${event.shortName}`} className={styles.eventLink}>
			<section
				className={styles.eventSection}
				style={heroUrl ? { backgroundImage: `url("${heroUrl}")` } : undefined}
			>
				<div className={styles.overlay} />
				<div className={styles.content}>
					<div className={styles.logoContainer}>
						{logo?.url ? (
							<Image
								src={getMediaUrl(logo?.url)}
								fill
								alt={`${event.name} logo`}
								sizes="(max-width: 768px) 160px, 200px"
								className={styles.logoImage}
							/>
						) : (
							<h3 className={styles.logoFallback}>{event.shortName}</h3>
						)}
					</div>
					<h3 className={styles.eventName}>{event.name}</h3>
					{(dateString || raisedString) && (
						<p className={styles.eventDetails}>
							{[dateString, raisedString].filter((el) => el).join(" | ")}
						</p>
					)}
				</div>
			</section>
		</Link>
	);
}

function getMediaObject(value?: number | Media | null): Media | null {
	return value && typeof value === "object" ? value : null;
}
