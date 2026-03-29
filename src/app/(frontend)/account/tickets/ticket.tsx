import { Box } from "@mantine/core";
import dayjs from "dayjs";

import styles from "./ticket.module.css";
import { Media } from "#components/Media/Media.tsx";
import type { Event } from "#/payload-types";

interface TicketProps {
	ticketData: {
		paid: boolean;
		ticketID: string;
		method: "bank" | "card";
		taken: boolean;
		event: Event;
		priceInCents: number;
	};
}

export function Ticket(props: TicketProps) {
	const { paid, ticketID, method, taken, event } = props.ticketData;

	let status = "Unpaid";
	if (taken) {
		status = "Picked up";
	} else if (paid) {
		status = "Paid";
	}

	return (
		<Box className={styles.ticket}>
			<div className={styles.imageSection}>
				{event.media?.logo ? (
					<Media
						resource={event.media.logo}
						alt={`${event.shortName} logo`}
						imgClassName={styles.eventLogo}
						fill
					/>
				) : (
					<div className={styles.placeholderLogo}>{event.shortName}</div>
				)}
			</div>
			<div className={styles.infoSection}>
				<div className={styles.header}>
					<div>
						<h3>{event.name} Ticket</h3>
						<p>
							{dayjs(event.timeSettings?.startTime).format("dddd DD/MM/YYYY")} -{" "}
							{dayjs(event.timeSettings?.endTime).format("dddd DD/MM/YYYY")}
						</p>
					</div>
					<span className={styles.statusBadge} data-status={status.toLowerCase().replace(" ", "-")}>
						{status}
					</span>
				</div>

				<div className={styles.informationGrid}>
					<div className={styles.gridItem}>
						<span className={styles.label}>Ticket ID</span>
						<span className={styles.value}>{ticketID}</span>
					</div>
					{method === "card" && (
						<div className={styles.gridItem}>
							<span className={styles.label}>Price</span>
							<span className={styles.value}>
								${(props.ticketData.priceInCents / 100).toFixed(2)} AUD
							</span>
						</div>
					)}
				</div>

				{method === "bank" && !paid && (
					<div className={styles.bankDetails}>
						<h4>Bank Transfer Details</h4>
						<div className={styles.bankGrid}>
							<span>BSB</span>
							<span className={styles.value}>085-005</span>
							<span>Account #</span>
							<span className={styles.value}>30-192-8208</span>
							<span>Reference</span>
							<span className={styles.value}>{ticketID}</span>
							<span>Amount</span>
							<span className={styles.value}>
								${(props.ticketData.priceInCents / 100).toFixed(2)} AUD
							</span>
						</div>
						<p className={styles.warning}>
							<b>Important:</b> You must send the Ticket ID as the reference. Failure to do so will result
							in your ticket being marked as not paid.
						</p>
						<p className={styles.note}>Currently unpaid. Allow 7 days for the ticket to be updated.</p>
					</div>
				)}
			</div>
		</Box>
	);
}
