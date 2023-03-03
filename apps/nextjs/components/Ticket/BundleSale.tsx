import { useState, useEffect } from "react";
import styles from "./TicketSale.module.scss";
import Image from "next/image";
import { Box, Button, Skeleton, TextField } from "@mui/material";
import { UseMutationResponse, useQuery, gql, useMutation } from "urql";
import { useAuth } from "../auth";

import ASM2023Bundle from "../../styles/img/asm2023-tickets-bundle.png";

interface BankTicketResponse {
	generateTicket: {
		ticketID: string;
		totalCost: number;
		numberOfTickets: number;
		error?: Record<string, any>;
	};
}

interface QUERY_PROFILE_RESULTS {
	user?: {
		verified: boolean;
	};
	event: {
		acceptingTickets: boolean;
	}
}

const TICKET_PRICE = 50;

export function BundleProduct() {
	const auth = useAuth();
	const [noOfTickets, setNoOfTickets] = useState(1);
	const [deletedTicket, setDeletedTicket] = useState(false);
	const [genTicketLoading, setGenTicketLoading] = useState(false);
	const [waitForTicket, setWaitForTicket] = useState(false);
	const [bankTicketsData, setBankTicketsData] =
		useState<UseMutationResponse<BankTicketResponse, object>[0]>(null);

	const [profileQueryRes] = useQuery<QUERY_PROFILE_RESULTS>({
		query: gql`
			query Profile($userId: ID) {
				user(where: { id: $userId }) {
					verified
				}
				event(where: {shortname: "ASM2023"}) {
				  acceptingTickets
				}
			}
		`,
		variables: {
			userId: auth.ready ? auth.sessionData?.id : "",
		},
		pause: !auth.ready || !auth?.sessionData?.id,
	});

	const successfulTicket =
		Boolean(bankTicketsData) && !Boolean(bankTicketsData.error);
	const disableBuying =
		!auth.ready ||
		(auth.ready && !auth.sessionData) ||
		!profileQueryRes.data?.user?.verified ||
		!profileQueryRes.data.event.acceptingTickets;
	const disableBank =
		disableBuying ||
		isNaN(noOfTickets) ||
		noOfTickets <= 0 ||
		genTicketLoading ||
		successfulTicket;

	const [, deleteStripeTicket] = useMutation(gql`
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

		if (
			query.get("cancelled") &&
			query.get("session_id") &&
			!deletedTicket
		) {
			deleteStripeTicket({ sessionID: query.get("session_id") }).then(
				(res) => {
					if (!res.error) {
						setDeletedTicket(true);
						// console.log('Successfully removed a dead ticket :D');
					} else {
						console.error(res.error);
					}
				},
			);
		}
	}, [deleteStripeTicket, deletedTicket]);

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
			console.error("Tried to generate tickets but auth was not ready");
			return;
		}

		if (disableBuying) return;

		setGenTicketLoading(true);
		const res = await fetch(
			`/api/create_bank_bundle?account=${
				auth.ready ? auth?.sessionData.id : ""
			}&bundles=${noOfTickets}`,
		);

		if (res.status === 200) {
			setBankTicketsData(await res.json());
		} else {
			console.error(res);
		}
	}

	const accId = auth.ready ? auth.sessionData?.id : "";
	const accUsername = auth.ready ? auth.sessionData?.username : "";

	if (bankTicketsData?.error) console.error(bankTicketsData.error);

	return (
		<div className={styles.product}>
			<Image
				alt="3D Render showing ASM2023 ticket and an ASM2023 placeholder shirt"
				src={ASM2023Bundle}
				className={styles.productImage}
			/>
			<div className={styles.information}>
				<section>
					<h2>Ticket + Shirt Bundle Information</h2>
					<p>
						Ticket to ASM2023 taking place in Adelaide and ASM2023
						shirt.
					</p>
					<p>Total price: ${TICKET_PRICE} AUD.</p>
					<p>
						All attendees, including runners and staff must purchase
						tickets to attend the event. Volunteers will receive a
						$15 rebate administered on site at ASM2023.
					</p>
					<p>
						We will have personalised tickets if you purchase before
						<i>
							<b> TBA</b>
						</i>
						.
					</p>
				</section>
				<hr />
				<p className={styles.shirtWarning}>
					SHIRT SIZES WILL BE DETERMINED AT A LATER DATE
				</p>
				<hr />
				{auth.ready && !auth?.sessionData && (
					<section className={styles.loginError}>
						You must be logged in and email verified to purchase
						tickets.
					</section>
				)}
				{auth.ready &&
					auth?.sessionData &&
					!profileQueryRes.data?.user?.verified && (
						<section className={styles.loginError}>
							Your email must be verified to purchase tickets.
						</section>
					)}
				<section className={styles.paymentMethod}>
					<h2>Stripe</h2>
					<p>
						Clicking on checkout will redirect you to the stripe
						checkout.{" "}
					</p>
					<form
						action={`/api/checkout_bundle?account=${accId}&username=${accUsername}`}
						method="POST">
						<Button
							type="submit"
							role="link"
							variant="contained"
							color="primary"
							fullWidth
							disabled={disableBuying}>
							Checkout ${TICKET_PRICE} each
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
							onChange={(e) =>
								setNoOfTickets(parseInt(e.target.value))
							}
							size="small"
							color="secondary"
							label="Number of bundles"
							disabled={disableBank}
						/>
						<Button
							variant="contained"
							color="primary"
							fullWidth
							disabled={disableBank}
							onClick={generateTickets}>
							Generate {noOfTickets > 1 && noOfTickets} Bundle
							{noOfTickets > 1 && "s"} $
							{isNaN(noOfTickets) || noOfTickets <= 0
								? "∞"
								: noOfTickets * TICKET_PRICE}
						</Button>
					</div>
					{bankTicketsData?.error && (
						<p>
							It seems like there was an error. Please try again
							or let Clubwho know on Discord!
						</p>
					)}
					{successfulTicket && !genTicketLoading && (
						<ASMTicket
							ticketData={bankTicketsData.data.generateTicket}
							extraCost={noOfTickets * 25}
						/>
					)}
					{genTicketLoading && !bankTicketsData?.error && (
						<ASMTicketSkeleton />
					)}
				</section>
			</div>
		</div>
	);
}

interface ASMTicketProps {
	ticketData: {
		ticketID: string;
		totalCost: number;
		numberOfTickets: number;
	};
	extraCost?: number;
}

const ASMTicket = (props: ASMTicketProps) => {
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
				<span>${totalCost + (props.extraCost ?? 0)} AUD</span>
				<span>Number of tickets</span>
				<span>{numberOfTickets}</span>
			</div>
			<p>
				You <b>MUST</b> send the Ticket ID as the &quot;reference&quot;.
				Failure to do so will result in your ticket marked as not being
				paid.
			</p>
			<p>The ticket will take up to 7 days to update.</p>
		</Box>
	);
};

const ASMTicketSkeleton: React.FC = () => {
	return (
		<Box
			className={[styles.generatedTicketsSkeleton, styles.animation].join(
				" ",
			)}
			sx={{ boxShadow: 8 }}>
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
