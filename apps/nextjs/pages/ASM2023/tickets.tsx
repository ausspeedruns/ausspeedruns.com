import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
	Button,
	Card,
	CardActionArea,
	CardContent,
	ThemeProvider,
} from "@mui/material";
import { useMutation, useQuery, gql } from "urql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

import styles from "../../styles/ASM2023.Tickets.module.scss";
import DiscordEmbed from "../../components/DiscordEmbed";
import { theme } from "../../components/mui-theme";
import { useAuth } from "../../components/auth";

import ASM2023Logo from "../../styles/img/ASM2023-Logo.png";
import ASM2023Ticket from "../../styles/img/asm2023-tickets-card.png";
import ASM2023Bundle from "../../styles/img/asm2023-tickets-bundle-card.png";

import { TicketProduct } from "../../components/Ticket/TicketSale";
import { BundleProduct } from "../../components/Ticket/BundleSale";

import TicketOGImage from '../../styles/img/ogImages/TicketImage.png';

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
	const [selectedProduct, setSelectedProduct] = useState<
		"" | "ticket" | "bundle"
	>("");

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

	const [purchasedTicketsRes] = useQuery({
		query: gql`
			query ($userID: ID) {
				tickets(where: {
					AND: [
					  { user: { id: { equals: $userID } } }
					  { event: { endDate: { gt: $currentTime } } }
					]
				  }) {
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
					<title>ASM2023 Tickets - AusSpeedruns</title>
					<DiscordEmbed
						title="ASM2023 Tickets - AusSpeedruns"
						description="Purchase tickets for the Australian Speedrun Marathon 2023!"
						pageUrl="/ASM2023/tickets"
						imageSrc={TicketOGImage.src}
					/>
				</Head>
				<main className={styles.content}>
					<h1>ASM2023 Tickets</h1>
					<Image
						className={styles.image}
						src={ASM2023Logo}
						alt="ASM2023 Logo"
					/>
					{purchasedTicketsRes.data?.tickets.length > 0 &&
						auth.ready && (
							<section className={styles.linkToProfile}>
								<span>
									View your tickets on{" "}
									<Link
										href={`/user/${auth?.sessionData?.username}#tickets`}>
										your profile!
									</Link>
								</span>
							</section>
						)}
					{selectedProduct !== "" && (
						<Button
							className={styles.back}
							onClick={() => setSelectedProduct("")}>
							<FontAwesomeIcon icon={faChevronLeft} />
							Back
						</Button>
					)}
					{selectedProduct === "" && (
						<div className={styles.productSelection}>
							<Card className={styles.card}>
								<CardActionArea
									onClick={() =>
										setSelectedProduct("ticket")
									}>
									<Image
										src={ASM2023Ticket}
										alt="Image showing ASM tickets"
									/>
									<CardContent>
										<h2 style={{ textAlign: "center" }}>
											ASM2023 Ticket
										</h2>
										<h3 style={{ textAlign: "center" }}>
											$25
										</h3>
									</CardContent>
								</CardActionArea>
							</Card>
							<Card className={styles.card}>
								<CardActionArea
									onClick={() =>
										setSelectedProduct("bundle")
									}>
									<Image
										src={ASM2023Bundle}
										alt="Image showing ASM tickets and a shirt"
									/>
									<CardContent>
										<h2 style={{ textAlign: "center" }}>
											Ticket + Shirt Bundle
										</h2>
										<h3 style={{ textAlign: "center" }}>
											$50
										</h3>
									</CardContent>
								</CardActionArea>
							</Card>
						</div>
					)}
					{selectedProduct === "ticket" && <TicketProduct />}
					{selectedProduct === "bundle" && <BundleProduct />}
					<hr />
					<section className={styles.fullWidth}>
						<h2>Refund Policy</h2>
						<p>
							AusSpeedruns does not offer any refunds for
							purchased ASM2023 tickets, except as required by
							Australian law (e.g. the Australian Consumer Law).
							Individual exceptions may be considered on a case by
							case basis, however we acknowledge our full
							discretion to not grant exceptions that are sought.
						</p>
						<p>
							Please contact Sten via the AusSpeedruns Discord for
							any inquires.
						</p>
					</section>
				</main>
			</div>
		</ThemeProvider>
	);
};

export default Tickets;
