"use client";

import Image from "next/image";
import styles from "./ticket-purchase.module.scss";
import { Box, Button, Skeleton, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useEffect, useState } from "react";

import ImageFakeTicket from "./images/FakeTickets.png";

type PurchaseType = "stripe" | "bank";

type TicketPurchaseProps = {
	canBuy: boolean;
	userId?: string;
	eventAcceptingTickets: boolean;
	event: string;
};

export function TicketPurchase(props: TicketPurchaseProps) {
	const [purchaseType, setPurchaseType] = useState<PurchaseType>("stripe");
	const [genTicketLoading, setGenTicketLoading] = useState(false);
	const [bankTicketsData, setBankTicketsData] = useState<any>(null);
	const [waitForTicket, setWaitForTicket] = useState(false);

	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (genTicketLoading) {
			timeout = setTimeout(() => {
				setWaitForTicket(true);
			}, 2500);
		}
		return () => clearTimeout(timeout);
	}, [genTicketLoading, bankTicketsData?.data.generateTicket]);

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (waitForTicket) {
			interval = setInterval(() => {
				if (bankTicketsData?.data.generateTicket) {
					setGenTicketLoading(false);
				}
			}, 500);
		}
		return () => clearInterval(interval);
	}, [waitForTicket, bankTicketsData?.data.generateTicket]);

	const handlePurchaseType = (_event: React.MouseEvent<HTMLElement>, newPurchase: PurchaseType) => {
		if (newPurchase !== null) {
			setPurchaseType(newPurchase);
		}
	};

	async function generateTicket() {
		if (!props.canBuy) {
			console.error("Tried to generate tickets but auth was not ready");
			return;
		}

		setGenTicketLoading(true);
		const res = await fetch(`/api/tickets/bank?userId=${props.userId}&event=${props.event}`, { method: "POST" });

		console.log(res);

		if (res.status === 200) {
			const data = await res.json();
			console.log(data);
			setBankTicketsData(data);
		} else {
			console.error(res);
		}
	}

	if (!props.eventAcceptingTickets) {
		return <p>Tickets are not currently available for this event.</p>;
	}

	return (
		<div className={styles.product}>
			<div>
				<Image src={ImageFakeTicket} alt="Two ASM2025 Ticket Designs" height="300" />
			</div>
			<div>
				All attendees, including runners and staff must purchase tickets to attend the event.<br />Purchasing a
				ticket before 16th June 2025 will have your name printed on the ticket.
				<p className={styles.cost}>$35</p>
				<div className={styles.purchaseButtons}>
					<ToggleButtonGroup value={purchaseType} exclusive onChange={handlePurchaseType} fullWidth>
						<ToggleButton value="stripe">Stripe</ToggleButton>
						<ToggleButton value="bank">Bank Transfer (Australia Only)</ToggleButton>
					</ToggleButtonGroup>
					{purchaseType === "stripe" ? (
						<Button type="submit" variant="contained" color="primary" disabled={!props.canBuy} fullWidth>
							Purchase Ticket via Stripe
						</Button>
					) : (
						<Button
							variant="contained"
							color="primary"
							fullWidth
							disabled={!props.canBuy}
							onClick={generateTicket}>
							Purchase Ticket via Bank Transfer
						</Button>
					)}
				</div>
				{bankTicketsData?.data.generateTicket && !genTicketLoading && (
					<ASMTicket ticketData={bankTicketsData.data.generateTicket} />
				)}
				{genTicketLoading && !bankTicketsData?.error && <ASMTicketSkeleton />}
			</div>
		</div>
	);
}

type ASMTicketProps = {
	ticketData: {
		ticketID: string;
		totalCost: number;
	};
};

const ASMTicket = (props: ASMTicketProps) => {
	const { totalCost, ticketID } = props.ticketData;
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
			</div>
			<p>
				You <b>MUST</b> send the Ticket ID as the &quot;reference&quot;. Failure to do so will result in your
				ticket marked as not being paid.
			</p>
			<p>The ticket will take up to 7 days to update.</p>
		</Box>
	);
};

const ASMTicketSkeleton: React.FC = () => {
	return (
		<Box className={[styles.generatedTicketsSkeleton, styles.animation].join(" ")} sx={{ boxShadow: 8 }}>
			<div className={styles.ticketID}>
				<Skeleton variant="text" width={100} />
				<Skeleton variant="rectangular" width={240} height={80} />
			</div>
			<div className={styles.informationGrid}>
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
