import React from "react";
import type { EventHeroBlock as EventHeroBlockProps, Event } from "#/payload-types";
import { Media } from "#/components/Media/Media";
import styles from "./EventHeroBlock.module.css";

export function EventHeroBlock(props: EventHeroBlockProps) {
	const { event, heading } = props;
	if (!event) return null;
	const e = event as Event;
	const logo = e.media?.logo;
	return (
		<div className={styles.container}>
			{logo ? (
				<div className={styles.logoWrap}>
					<Media className={styles.logo} resource={logo} />
				</div>
			) : null}
			<h1>{heading || e.name}</h1>
			{e.timeSettings?.startTime && <p>Starts: {new Date(e.timeSettings.startTime).toLocaleDateString()}</p>}
			<div className={styles.buttonGroup}>
				{e.settings?.isAcceptingSubmissions && <button>Submit Run</button>}
				{e.settings?.isAcceptingVolunteers && <button>Volunteer</button>}
			</div>
		</div>
	);
}
