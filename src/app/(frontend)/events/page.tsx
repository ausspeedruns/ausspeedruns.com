import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import configPromise from "@payload-config";
import { getPayload } from "payload";

import type { Event, Media } from "@/payload-types";
import { getMediaUrl } from "@/utilities/getMediaUrl";

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
		select: {
			name: true,
			shortname: true,
			timeSettings: true,
			postEvent: true,
			media: true,
			settings: true,
		},
		where: {
			"settings.isPublished": {
				equals: true,
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
		<main className="container pt-24 pb-24">
			<div className="prose dark:prose-invert max-w-none">
				<h1>Events</h1>
			</div>

			<section className="mt-8">
				<h2 className="text-2xl font-semibold">Upcoming</h2>
				<div className="mt-4 grid gap-6 md:grid-cols-2">
					{upcomingEvents.map((event) => (
						<EventBlock key={event.shortname} event={event} />
					))}
				</div>
			</section>

			<section className="mt-12">
				<h2 className="text-2xl font-semibold">Past</h2>
				<div className="mt-4 grid gap-6 md:grid-cols-2">
					{pastEvents.map((event) => (
						<EventBlock key={event.shortname} event={event} />
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
	const logo = getMediaObject(event.media?.darkModeLogo) ?? getMediaObject(event.media?.logo);
	const heroImage = getMediaObject(event.media?.heroImage);
	const heroUrl = getMediaUrl(heroImage?.url);

	const dateString =
		event.timeSettings?.startTime && event.timeSettings?.endTime
			? `${new Date(event.timeSettings.startTime).toLocaleDateString()} – ${new Date(
					event.timeSettings.endTime,
				).toLocaleDateString()}`
			: "";

	const raisedString = event.postEvent?.raised ? `$${event.postEvent.raised.toLocaleString()}` : "";

	return (
		<Link
			href={`${event.shortname}`}
			className="group block overflow-hidden rounded-2xl border border-border bg-card"
		>
			<section
				className="relative flex min-h-[260px] flex-col justify-end bg-cover bg-center p-6 text-white"
				style={heroUrl ? { backgroundImage: `url("${heroUrl}")` } : undefined}
			>
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
				<div className="relative z-10">
					<div className="relative mb-4 h-16 w-40">
						{logo?.url ? (
							<Image
								src={getMediaUrl(logo.url)}
								fill
								alt={`${event.name} logo`}
								sizes="(max-width: 768px) 160px, 200px"
								className="object-contain"
							/>
						) : (
							<h3 className="text-xl font-semibold">{event.shortname}</h3>
						)}
					</div>
					<h3 className="text-2xl font-semibold">{event.name}</h3>
					{(dateString || raisedString) && (
						<p className="mt-2 text-sm text-white/80">
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
