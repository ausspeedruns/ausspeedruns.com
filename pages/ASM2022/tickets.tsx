import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { Box, Button, TextField, ThemeProvider } from '@mui/material';
import { useMutation, useQuery } from 'urql';
import { gql } from '@keystone-6/core';

import styles from '../../styles/ASM2022.Tickets.module.scss';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import DiscordEmbed from '../../components/DiscordEmbed';
import { theme } from '../../components/mui-theme';
import { useAuth } from '../../components/auth';

import ASM2022Logo from '../../styles/img/ASM2022-Logo.svg';

const stripePromise = loadStripe(
	'pk_test_51J5TzBKT8G4cNWT5xLEWYnNaZYaHYunLI5yYQ8TqbYdffm8Iwxp20YjShZKXAZOukignMZNtmXFxMHWl9la17mVL00YAz9Qg4s'
);

const Tickets = () => {
	const auth = useAuth();
	const [noOfTickets, setNoOfTickets] = useState(1);
	const [deletedTicket, setDeletedTicket] = useState(false);
	const [stripeID, setStripeID] = useState<string>();

	const [getTicketIDRes, getTicketID] = useQuery({
		query: gql`
			query ($stripeID: String) {
				tickets(where: { stripeID: { equals: $stripeID } }) {
					id
				}
			}
		`,
		pause: !stripeID,
		variables: { stripeID },
	});

	const [deleteStripeTicketRes, deleteStripeTicket] = useMutation(gql`
		mutation ($rawID: ID) {
			deleteTicket(where: { id: $rawID }) {
				__typename
			}
		}
	`);

	useEffect(() => {
		// Check to see if this is a redirect back from Checkout
		const query = new URLSearchParams(window.location.search);

		// console.log(query.get('cancelled'), query.get('session_id'), deletedTicket, getTicketIDRes);

		if (query.get('cancelled') && !deletedTicket) {
			setStripeID(query.get('session_id'));

			if (getTicketIDRes.data?.tickets.length !== 1) {
				// Got either 0 or too many
				return;
			}

			deleteStripeTicket({ rawID: getTicketIDRes.data.tickets[0].id }).then((res) => {
				if (!res.error) {
					setDeletedTicket(true);
					console.log('Successfully removed a dead ticket :D');
				} else {
					console.log(res.error);
				}
			});
		}
	}, [getTicketIDRes, deleteStripeTicket, deletedTicket]);

	const [generateBankTicketsRes, generateBankTickets] = useMutation(gql`
		mutation ($userID: ID, $numberOfTickets: Int) {
			createTicket(data: { user: { connect: { id: $userID } }, numberOfTickets: $numberOfTickets, method: bank }) {
				ticketID
				totalCost
				numberOfTickets
			}
		}
	`);

	function generateTickets() {
		if (!auth.ready) {
			console.error('Tried to generate tickets but auth was not ready');
			return;
		}

		generateBankTickets({ userID: auth.sessionData.id, numberOfTickets: noOfTickets });
	}

	// console.log(generateBankTicketsRes);
	const successfulTicket = !generateBankTicketsRes.error && generateBankTicketsRes?.data?.createTicket.ticketID;

	let accId = '';
	if (auth.ready) {
		accId = auth.sessionData.id;
	}

	return (
		<ThemeProvider theme={theme}>
			<div className={styles.app}>
				<Head>
					<title>ASM2022 Tickets - AusSpeedruns</title>
					<DiscordEmbed
						title="ASM2022 Tickets - AusSpeedruns"
						description="Purchase tickets for the Australian Speedrun Marathon 2022!"
						pageUrl="/ASM2022/tickets"
					/>
				</Head>
				<Navbar />
				<main className={styles.content}>
					{/* <h1>ASM2022 Tickets</h1> */}
					<div className={styles.image}>
						<Image objectFit="contain" src={ASM2022Logo} alt="ASM2022 Logo" />
					</div>
					<section>
						<h3>Ticket Information</h3>
						<p>Ticket to ASM2022 taking place in Adelaide, July 13-17.</p>
						<p>All attendees, including runners and staff must purchase tickets to attend the event.</p>
						<p>
							We have two methods to buy a ticket for ASM. Stripe and Bank Transfer. Paying with Stripe will cost
							slightly extra due to a processing fee.
						</p>
					</section>
					<form action={`/api/checkout_ticket?account=${accId}`} method="POST" className={styles.form}>
						<section>
							<h2>Stripe</h2>
							<p>Clicking on checkout will redirect you to the stripe checkout. </p>
						</section>
						<section>
							<Button type="submit" role="link" variant="contained" color="primary" fullWidth>
								Checkout $35.80
							</Button>
						</section>
					</form>

					<section>
						<h2>Bank Transfer</h2>
					</section>
					<section>
						<div className={styles.bankTransferButton}>
							<TextField
								type="number"
								inputProps={{ min: 1 }}
								value={noOfTickets}
								onChange={(e) => setNoOfTickets(parseInt(e.target.value))}
								style={{ maxWidth: 70 }}
								size="small"
							></TextField>
							<Button
								variant="contained"
								color="primary"
								fullWidth
								disabled={isNaN(noOfTickets)}
								onClick={generateTickets}
							>
								Generate {noOfTickets > 1 && noOfTickets} Ticket{noOfTickets > 1 && 's'} $
								{isNaN(noOfTickets) ? '∞' : noOfTickets * 35}
							</Button>
						</div>
						{successfulTicket && <ASMTicket ticketData={generateBankTicketsRes.data.createTicket} />}
					</section>
				</main>
				<Footer className={styles.footer} />
			</div>
		</ThemeProvider>
	);
};

interface ASMTicketProps {
	ticketData: {
		ticketID: string;
		totalCost: number;
		numberOfTickets: number;
	};
}

const ASMTicket: React.FC<ASMTicketProps> = (props: ASMTicketProps) => {
	console.log(props);
	const { totalCost, ticketID, numberOfTickets } = props.ticketData;
	return (
		<Box className={styles.generatedTickets} sx={{ boxShadow: 8 }}>
			<div className={styles.ticketID}>
				<span>Ticket ID</span>
				<span className={styles.label}>{ticketID}</span>
			</div>
			<div className={styles.informationGrid}>
				<span>BSB</span>
				<span>085-005</span>
				<span>Account #</span>
				<span>30-192-8208</span>
				<span>Ticket ID</span>
				<span>{ticketID}</span>
				<span>Amount</span>
				<span>${totalCost}</span>
				<span>Number of tickets</span>
				<span>{numberOfTickets}</span>
			</div>
			<p>
				You <b>MUST</b> send the Ticket ID as the &quot;reference&quot;. Failure to do so will result in your ticket not
				being paid.
			</p>
		</Box>
	);
};

export default Tickets;
