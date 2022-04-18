import { Box } from '@mui/material';
import React, { useEffect } from 'react';
import JSBarcode from 'jsbarcode';

import styles from './Ticket.module.scss';
import Image from 'next/image';

interface Props {
	ticketData: {
		ticketID: string;
		totalCost: number;
		paid: boolean;
		numberOfTickets: number;
		method: 'bank' | 'stripe';
		taken: boolean;
		event: {
			shortname: string;
			logo: {
				url: string;
				width: number;
				height: number;
			};
		};
	};
}

const LOGO_HEIGHT = 50;

const Ticket: React.FC<Props> = (props: Props) => {
	const { numberOfTickets, paid, ticketID, totalCost, method, taken, event } = props.ticketData;

	let status = 'Unpaid';
	if (taken) {
		status = 'Picked up';
	} else if (paid) {
		status = 'Paid';
	}

	useEffect(() => {
		if (!paid) return;
		JSBarcode(`#ticketBarcode-${ticketID}`, ticketID, { displayValue: false });
	}, [ticketID, paid]);

	const aspectRatio = event.logo.width / event.logo.height;

	return (
		<Box className={styles.ticket} sx={{ boxShadow: 8 }}>
			<div className={styles.ticketID}>
				<Image
					src={event.logo.url}
					title={event.shortname}
					width={LOGO_HEIGHT * aspectRatio}
					height={LOGO_HEIGHT}
					alt={`${event.shortname} logo`}
					className={styles.eventLogo}
				/>
				{paid && <canvas id={`ticketBarcode-${ticketID}`}></canvas>}
				<span>Ticket ID</span>
				<span className={styles.label}>{ticketID}</span>
			</div>
			<div className={styles.informationGrid}>
				<>
					<span>Event</span>
					<span>{event.shortname}</span>
				</>
				{method === 'bank' && !paid && (
					<>
						<span>BSB</span>
						<span>085-005</span>
						<span>Account #</span>
						<span>30-192-8208</span>
						<span>Amount</span>
						<span>${totalCost} AUD</span>
					</>
				)}
				<span>Ticket ID</span>
				<span>{ticketID}</span>
				<span>Number of tickets</span>
				<span>{numberOfTickets}</span>
				<span>Status</span>
				<span>{status}</span>
			</div>
			{method === 'bank' && !paid && (
				<>
					<p>Currently unpaid. Allow 7 days for the ticket to be updated.</p>
					<p>
						You <b>MUST</b> send the Ticket ID as the &quot;reference&quot;. Failure to do so will result in your ticket not being
						paid.
					</p>
				</>
			)}
		</Box>
	);
};

export default Ticket;
