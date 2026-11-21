import { Box } from "@mantine/core";
import { format } from "date-fns";
import { tz } from "@date-fns/tz";

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

	const dateOptions = { in: tz(event.timeSettings?.timezone || "Australia/Melbourne") };
	const startDate = format(event.timeSettings?.startTime ?? new Date(), "EEEE d MMM yyyy", dateOptions);
	const endDate = format(event.timeSettings?.endTime ?? new Date(), "EEEE d MMM yyyy", dateOptions);

	const logo = event.media?.logo;
	const logoDarkMode = event.media?.logoDarkMode;
	const logoAlt = `${event.shortName} logo`;

	return (
		<Box className={styles.ticket}>
			<div className={styles.imageSection}>
				{logo && logoDarkMode ? (
					<>
						<Box className={styles.logoWrapper} darkHidden>
							<Media resource={logo} alt={logoAlt} imgClassName={styles.eventLogo} fill />
						</Box>
						<Box className={styles.logoWrapper} lightHidden>
							<Media resource={logoDarkMode} alt={logoAlt} imgClassName={styles.eventLogo} fill />
						</Box>
					</>
				) : logo || logoDarkMode ? (
					<Media resource={logo || logoDarkMode} alt={logoAlt} imgClassName={styles.eventLogo} fill />
				) : (
					<div className={styles.placeholderLogo}>{event.shortName}</div>
				)}
			</div>
			<div className={styles.infoSection}>
				<div className={styles.header}>
					<div>
						<h3>{event.name} Ticket</h3>
						<p>
							{startDate === endDate ? startDate : `${startDate} to ${endDate}`}
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
