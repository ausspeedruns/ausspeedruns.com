import React from "react";
import type { EventHeroBlock as EventHeroBlockProps, Event } from "#/payload-types";
import styles from "./EventHeroBlock.module.css";

export function EventHeroBlock(props: EventHeroBlockProps) {
	const { event, heading } = props;
	if (!event) return null;
	const e = event as Event;
	return (
		<div className={styles.container}>
			<h1>{heading || e.name}</h1>
			{e.timeSettings?.startTime && <p>Starts: {new Date(e.timeSettings.startTime).toLocaleDateString()}</p>}
			<div className={styles.buttonGroup}>
				{e.settings?.isAcceptingSubmissions && <button>Submit Run</button>}
				{e.settings?.isAcceptingVolunteers && <button>Volunteer</button>}
			</div>
		</div>
	);
}
