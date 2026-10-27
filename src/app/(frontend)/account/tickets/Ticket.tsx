import { Box } from "@mantine/core";
import { format } from "date-fns";

import styles from "./Ticket.module.css";
import { CheckInCode } from "./CheckInCode";
import { Media } from "#components/Media/Media.tsx";
import { BankTransferDetails } from "#components/BankTransferDetails/BankTransferDetails.tsx";
import type { Event, PaymentSetting } from "#/payload-types";
import { formatCents } from "#utilities/formatCents.ts";

interface TicketProps {
	ticketData: {
		paid: boolean;
		ticketID: string | null;
		method: "bank" | "card";
		taken: boolean;
		event: Event;
		priceInCents: number;
		amountOwedInCents: number;
	};
	bankTransfer?: PaymentSetting["bankTransfer"];
}

export function Ticket(props: TicketProps) {
	const { paid, ticketID, method, taken, event, priceInCents, amountOwedInCents } = props.ticketData;

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
							{format(event.timeSettings?.startTime ?? new Date(), "EEEE d MMM yyyy")} to{" "}
							{format(event.timeSettings?.endTime ?? new Date(), "EEEE d MMM yyyy")}
						</p>
					</div>
					<span className={styles.statusBadge} data-status={status.toLowerCase().replace(" ", "-")}>
						{status}
					</span>
				</div>

				<div className={styles.informationGrid}>
					<div className={styles.gridItem}>
						<span className={styles.label}>Ticket ID</span>
						<span className={styles.value}>{ticketID ?? "Missing ID"}</span>
					</div>
					<div className={styles.gridItem}>
						<span className={styles.label}>Price</span>
						<span className={styles.value}>{formatCents(priceInCents)}</span>
					</div>
				</div>

				{ticketID && <CheckInCode ticketID={ticketID} eventName={event.name} />}

				{method === "bank" && !paid && (
					<div className={styles.bankDetails}>
						<h4>Bank transfer details</h4>
						<BankTransferDetails
							amountInCents={amountOwedInCents}
							reference={ticketID ?? "Missing ID"}
							accountName={props.bankTransfer?.accountName}
							bsb={props.bankTransfer?.bsb}
							accountNumber={props.bankTransfer?.accountNumber}
							instructions={props.bankTransfer?.instructions}
						/>
					</div>
				)}
			</div>
		</Box>
	);
}
