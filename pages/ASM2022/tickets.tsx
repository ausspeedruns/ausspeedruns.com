import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Box, Button, CircularProgress, Skeleton, TextField, ThemeProvider, Tooltip } from '@mui/material';
import { useMutation, UseMutationResponse, useQuery } from 'urql';
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

interface BankTicketResponse {
	generateTicket: {
		ticketID: string,
		totalCost: number,
		numberOfTickets: number,
		error?: Record<string, any>,
	}
}

const bankTicketsFetcher = async (url: string) => {
	const res = await fetch(url)
	const data = await res.json()

	if (res.status !== 200) {
		throw new Error(data.message)
	}
	return data
}

const Tickets = () => {
	const auth = useAuth();
	const [noOfTickets, setNoOfTickets] = useState(1);
	const [deletedTicket, setDeletedTicket] = useState(false);
	const [genTicketLoading, setGenTicketLoading] = useState(false);
	const [waitForTicket, setWaitForTicket] = useState(false);
	const [bankTicketsData, setBankTicketsData] = useState<UseMutationResponse<BankTicketResponse, object>[0]>(undefined);

	const [profileQueryRes, profileQuery] = useQuery({
		query: gql`
			query Profile($userId: ID!) {
				user(where: { id: $userId }) {
					verified
				}
			}
		`,
		variables: {
			userId: auth.ready ? auth.sessionData?.id ?? '' : '',
		},
		pause: !auth.ready || !auth?.sessionData?.id,
	});

	const successfulTicket = Boolean(bankTicketsData) && !Boolean(bankTicketsData.error);
	const disableBuying = !auth.ready || (auth.ready && !auth.sessionData) || !profileQueryRes.data?.user?.verified;
	const disableBank = disableBuying || isNaN(noOfTickets) || noOfTickets <= 0 || genTicketLoading || successfulTicket;

	const [deleteStripeTicketRes, deleteStripeTicket] = useMutation(gql`
		mutation ($sessionID: String) {
			deleteTicket(where: { stripeID: $sessionID }) {
				__typename
			}
		}
	`);

	useEffect(() => {
		// Check to see if this is a redirect back from Checkout
		const query = new URLSearchParams(window.location.search);

		// console.log(query.get('cancelled'), query.get('session_id'), deletedTicket, getTicketIDRes);

		if (query.get('cancelled') && query.get('session_id') && !deletedTicket) {
			deleteStripeTicket({ sessionID: query.get('session_id') }).then((res) => {
				if (!res.error) {
					setDeletedTicket(true);
					// console.log('Successfully removed a dead ticket :D');
				} else {
					console.error(res.error);
				}
			});
		}
	}, [deleteStripeTicket, deletedTicket]);

	const [purchasedTicketsRes, purchasedTickets] = useQuery({
		query: gql`
			query ($userID: ID) {
				tickets(where: { user: { id: { equals: $userID } } }) {
					ticketID
				}
			}
		`,
		pause: !auth.ready || !auth?.sessionData?.id,
		variables: {
			userID: auth.ready ? auth.sessionData?.id ?? '' : '',
		},
	});


	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (genTicketLoading) {
			timeout = setTimeout(() => {
				setWaitForTicket(true);
			}, 2500);
		}
		return () => clearTimeout(timeout);
	}, [genTicketLoading, successfulTicket]);

	useEffect(() => {
		let interval: NodeJS.Timer;
		if (waitForTicket) {
			interval = setInterval(() => {
				if (successfulTicket) {
					setGenTicketLoading(false);
				}
			}, 500);
		}
		return () => clearInterval(interval);
	}, [waitForTicket, successfulTicket]);

	async function generateTickets() {
		if (!auth.ready) {
			console.error('Tried to generate tickets but auth was not ready');
			return;
		}

		if (disableBuying) return;

		setGenTicketLoading(true);
		const res = await fetch(`/api/create_bank_ticket?account=${auth.ready ? auth?.sessionData.id : ''}&tickets=${noOfTickets}&event=ASM2022`)
		// generateBankTickets({ userID: auth.sessionData.id, numberOfTickets: noOfTickets });
		if (res.status === 200) {
			setBankTicketsData(await res.json());
		} else {
			console.log(res);
		}
	}

	let accId = '';
	if (auth.ready) {
		accId = auth.sessionData?.id;
	}

	let accUsername = '';
	if (auth.ready) {
		accUsername = auth.sessionData?.username;
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
					{purchasedTicketsRes.data?.tickets.length > 0 && auth.ready && (
						<section className={styles.linkToProfile}>
							<span>
								View your tickets on <Link href={`/user/${auth.sessionData.username}#tickets`}>your profile!</Link>
							</span>
						</section>
					)}
					<section className={styles.fullWidth}>
						<h2>Ticket Information</h2>
						<p>Ticket to ASM2022 taking place in Adelaide, July 13-17.</p>
						<p>Ticket price: $35 AUD.</p>
						<p>All attendees, including runners and staff must purchase tickets to attend the event.</p>
						<p>
							We have two methods to buy a ticket for ASM. Stripe and Bank Transfer. Paying with Stripe will cost
							slightly extra due to a processing fee.
						</p>
					</section>
					<hr />
					{auth.ready && !auth?.sessionData && (
						<section className={styles.loginError}>
							You must be logged in and email verified to purchase tickets.
						</section>
					)}
					{auth.ready && auth?.sessionData && !profileQueryRes.data?.user?.verified && (
						<section className={styles.loginError}>Your email must be verified to purchase tickets.</section>
					)}
					<section className={styles.paymentMethod}>
						<h2>Stripe</h2>
						<p>Clicking on checkout will redirect you to the stripe checkout. </p>
						<form action={`/api/checkout_ticket?account=${accId}&username=${accUsername}&event=ASM2022`} method="POST">
							<Button
								type="submit"
								role="link"
								variant="contained"
								color="primary"
								fullWidth
								disabled={disableBuying}
							>
								Checkout $35.50 each
							</Button>
						</form>
					</section>
					<section className={styles.paymentMethod}>
						<h2>Bank Transfer (Australia Only)</h2>
						<div className={styles.bankTransferButton}>
							<TextField
								type="number"
								inputProps={{ min: 1 }}
								value={noOfTickets}
								onChange={(e) => setNoOfTickets(parseInt(e.target.value))}
								// style={{ maxWidth: 70 }}
								size="small"
								color="secondary"
								label="Number of tickets"
							></TextField>
							{/* <Tooltip title={successfulTicket ? "Refresh the page if you need to generate more" : undefined} arrow> */}
							<Button
								variant="contained"
								color="primary"
								fullWidth
								disabled={disableBank}
								onClick={generateTickets}
							>
								Generate {noOfTickets > 1 && noOfTickets} Ticket{noOfTickets > 1 && 's'} $
								{isNaN(noOfTickets) || noOfTickets <= 0 ? '∞' : noOfTickets * 35}
							</Button>
							{/* </Tooltip> */}
						</div>
						{bankTicketsData?.error && <p>It seems like there was an error. Please try again or let Clubwho know on Discord!</p>}
						{successfulTicket && !genTicketLoading && (
							<ASMTicket ticketData={bankTicketsData.data.generateTicket} />
						)}
						{genTicketLoading && !bankTicketsData?.error && <ASMTicketSkeleton />}
					</section>
					<hr />
					<section className={styles.fullWidth}>
						<h2>Refund Policy</h2>
						<p>
							AusSpeedruns does not offer any refunds for purchased ASM2022 tickets, except as required by Australian
							law (e.g. the Australian Consumer Law), and as per our{' '}
							<a
								target="_blank"
								rel="noreferrer"
								href="https://ausspeedruns.sharepoint.com/:w:/s/Main/EWHKLtTIsUROj6JbarbggWgBZTwBVK-FCRPNH19vf4dJAA?rtime=UxFMYhYh2kg"
							>
								COVID Policy
							</a>
							. Individual exceptions may be considered on a case by case basis, however we acknowledge our full
							discretion to not grant exceptions that are sought.
						</p>
						<p>Please contact Sten via the AusSpeedruns Discord for any inquries.</p>
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
				<span>${totalCost} AUD</span>
				<span>Number of tickets</span>
				<span>{numberOfTickets}</span>
			</div>
			<p>
				You <b>MUST</b> send the Ticket ID as the &quot;reference&quot;. Failure to do so will result in your ticket
				marked as not being paid.
			</p>
			<p>The ticket will take up to 7 days to update.</p>
		</Box>
	);
};

const ASMTicketSkeleton: React.FC = () => {
	return (
		<Box className={[styles.generatedTicketsSkeleton, styles.animation].join(' ')} sx={{ boxShadow: 8 }}>
			<div className={styles.ticketID}>
				<Skeleton variant="text" width={100} />
				<Skeleton variant="rectangular" width={240} height={80} />
			</div>
			<div className={styles.informationGrid}>
				<Skeleton variant="text" />
				<Skeleton variant="text" />
				<Skeleton variant="text" />
				<Skeleton variant="text" />
				<Skeleton variant="text" />
			</div>
			<p>
				<Skeleton variant="rectangular" height={80} />
			</p>
			<p>
				<Skeleton variant="text" />
			</p>
		</Box>
	);
};

export default Tickets;
