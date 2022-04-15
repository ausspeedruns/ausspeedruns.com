import { Box } from '@mui/material';
import React from 'react';

import styles from './Ticket.module.scss';

interface Props {
	ticketData: {
		ticketID: string;
		totalCost: number;
		paid: boolean;
		numberOfTickets: number;
		method: 'bank' | 'stripe';
		taken: boolean;
		event?: {
			shortname: string;
		};
	};
}

const Ticket: React.FC<Props> = (props: Props) => {
	const { numberOfTickets, paid, ticketID, totalCost, method, taken, event } = props.ticketData;

	let status = 'Unpaid';
	if (taken) {
		status = 'Picked up';
	} else if (paid) {
		status = 'Paid';
	}

	return (
		<Box className={styles.ticket} sx={{ boxShadow: 8 }}>
			<div className={styles.ticketID}>
				<span>Ticket ID</span>
				<span className={styles.label}>{ticketID}</span>
			</div>
			<div className={styles.informationGrid}>
				{event?.shortname && (
					<>
						<span>Event</span>
						<span>{event.shortname}</span>
					</>
				)}
				{method === 'bank' && !paid && (
					<>
						<span>BSB</span>
						<span>085-005</span>
						<span>Account #</span>
						<span>30-192-8208</span>
						<span>Amount</span>
						<span>${totalCost}</span>
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
						You <b>MUST</b> send the Ticket ID as the "reference". Failure to do so will result in your ticket not being
						paid.
					</p>
				</>
			)}
		</Box>
	);
};

export default Ticket;
