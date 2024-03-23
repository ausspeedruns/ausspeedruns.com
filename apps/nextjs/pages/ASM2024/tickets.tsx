import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { ThemeProvider } from "@mui/material";
import { useMutation, useQuery, gql } from "urql";

import styles from "../../styles/ASM2023.Tickets.module.scss";
import DiscordEmbed from "../../components/DiscordEmbed";
import { theme } from "../../components/mui-theme";
import { useAuth } from "../../components/auth";

import ASM2024Logo from "../../styles/img/events/asm24/ASM24 SVG.svg";

import { TicketProduct } from "../../components/Ticket/TicketSale";

import TicketOGImage from "../../styles/img/events/asm24/asm23-ticket-og.png";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface BankTicketResponse {
	generateTicket: {
		ticketID: string;
		totalCost: number;
		numberOfTickets: number;
		error?: Record<string, any>;
	};
}

const Tickets = () => {
	const auth = useAuth();
	const [deletedTicket, setDeletedTicket] = useState(false);

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

		if (query.get("cancelled") && query.get("session_id") && !deletedTicket) {
			deleteStripeTicket({ sessionID: query.get("session_id") }).then((res) => {
				if (!res.error) {
					setDeletedTicket(true);
					// console.log('Successfully removed a dead ticket :D');
				} else {
					console.error(res.error);
				}
			});
		}
	}, [deleteStripeTicket, deletedTicket]);

	const [purchasedTicketsRes] = useQuery({
		query: gql`
			query ($userID: ID) {
				tickets(
					where: {
						AND: [{ user: { id: { equals: $userID } } }, { event: { endDate: { gt: $currentTime } } }]
					}
				) {
					ticketID
				}
			}
		`,
		pause: !auth.ready || !auth?.sessionData?.id,
		variables: {
			userID: auth.ready ? auth.sessionData?.id ?? "" : "",
		},
	});

	return (
		<ThemeProvider theme={theme}>
			<div className={styles.app}>
				<Head>
					<title>ASM2024 Tickets - AusSpeedruns</title>
					<DiscordEmbed
						title="ASM2024 Tickets - AusSpeedruns"
						description="Purchase tickets for the Australian Speedrun Marathon 2024!"
						pageUrl="/ASM2024/tickets"
						imageSrc={TicketOGImage.src}
					/>
				</Head>
				<main className={styles.content}>
					<h1>ASM2024 Tickets</h1>
					<Image className={styles.image} src={ASM2024Logo} alt="ASM2024 Logo" />
					{purchasedTicketsRes.data?.tickets.length > 0 && auth.ready && (
						<section className={styles.linkToProfile}>
							<span>
								View your tickets on{" "}
								<Link href={`/user/${auth?.sessionData?.username}#tickets`}>your profile!</Link>
							</span>
						</section>
					)}
					<TicketProduct />
					<hr />
					<section className={styles.fullWidth}>
						<h2>Refund Policy</h2>
						<p>
							AusSpeedruns does not offer any refunds for purchased ASM2024 tickets, except as required by
							Australian law (e.g. the Australian Consumer Law). Individual exceptions may be considered
							on a case by case basis, however we acknowledge our full discretion to not grant exceptions
							that are sought.
						</p>
						<p>Please contact Lacey via the AusSpeedruns Discord for any inquires.</p>
					</section>
				</main>
			</div>
		</ThemeProvider>
	);
};

export default Tickets;
