"use client";

import Image from "next/image";
import styles from "./shirt-purchase.module.scss";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Skeleton, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useEffect, useState } from "react";

import ImageShirt from "./images/shirt.jpg";
import ShirtMeasurements from "./images/ShirtMeasurements.png";
import Link from "next/link";

type PurchaseType = "stripe" | "bank";

type ShirtPurchaseProps = {
	canBuy: boolean;
	userId?: string;
	eventAcceptingShirts: boolean;
};

export function ShirtPurchase(props: ShirtPurchaseProps) {
	const [purchaseType, setPurchaseType] = useState<PurchaseType>("stripe");
	const [genShirtLoading, setGenShirtLoading] = useState(false);
	const [bankShirtsData, setBankShirtsData] = useState<any>(null);
	const [waitForShirt, setWaitForShirt] = useState(false);
	const [shirtSize, setShirtSize] = useState<"s" | "m" | "l" | "xl" | "xl2" | "xl3" | "xl4">("m");

	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (genShirtLoading) {
			timeout = setTimeout(() => {
				setWaitForShirt(true);
			}, 2500);
		}
		return () => clearTimeout(timeout);
	}, [genShirtLoading, bankShirtsData?.data.generateShirt]);

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (waitForShirt) {
			interval = setInterval(() => {
				if (bankShirtsData?.data.generateShirt) {
					setGenShirtLoading(false);
				}
			}, 500);
		}
		return () => clearInterval(interval);
	}, [waitForShirt, bankShirtsData?.data.generateShirt]);

	const handlePurchaseType = (_event: React.MouseEvent<HTMLElement>, newPurchase: PurchaseType) => {
		if (newPurchase !== null) {
			setPurchaseType(newPurchase);
		}
	};

	async function generateShirt() {
		if (!props.canBuy) {
			console.error("Tried to generate shirts but auth was not ready");
			return;
		}

		setGenShirtLoading(true);
		const res = await fetch(`/api/shirts/bank?userId=${props.userId}&size=${shirtSize}`, { method: "POST" });

		if (res.status === 200) {
			const data = await res.json();
			console.log(data);
			setBankShirtsData(data);
		} else {
			console.error(res);
		}
	}

	if (!props.eventAcceptingShirts) {
		return <p>Shirts are not currently available for this event.</p>;
	}

	return (
		<div>
			<div className={styles.product}>
				<div>
					<Image src={ImageShirt} alt="ASM2025 Shirt Design" height="300" />
				</div>
				<div>
					<p>
						Selling out June 18th 23:59 ACST.
					</p>
					<p>
						Please note that all ASM2025 Shirt purchases{" "}
						<b>must be collected at the ASM2025 event</b>. No shipping will be offered.
					</p>
					<p>
						Design by{" "}
						<a href="https://twitter.com/Genba_96" target="_blank" rel="noopener noreferrer">
							Genba
						</a>
						.
					</p>
					<p>
						Please note that any shirt ordered using the bank transfer method will be considered
						cancelled if payment is not cleared in the AusSpeedruns bank account before June 18
						ACST 23:59.
					</p>

					<h2>Size</h2>
					<div className={styles.preferences}>
						<ToggleButtonGroup
							fullWidth
							size="small"
							exclusive
							value={shirtSize}
							onChange={(e, value) => (value !== null ? setShirtSize(value) : undefined)}>
							<ToggleButton value="s">S</ToggleButton>
							<ToggleButton value="m">M</ToggleButton>
							<ToggleButton value="l">L</ToggleButton>
							<ToggleButton value="xl">XL</ToggleButton>
							<ToggleButton value="xl2">2XL</ToggleButton>
							<ToggleButton value="xl3">3XL</ToggleButton>
							<ToggleButton value="xl4">4XL</ToggleButton>
						</ToggleButtonGroup>
						<br />
						<br />
					</div>
					<input type="hidden" name="size" value={shirtSize} />
					<p className={styles.cost}>$30</p>
					<div className={styles.purchaseButtons}>
						<ToggleButtonGroup value={purchaseType} exclusive onChange={handlePurchaseType} fullWidth>
							<ToggleButton value="stripe">Stripe</ToggleButton>
							<ToggleButton value="bank">Bank Transfer (Australia Only)</ToggleButton>
						</ToggleButtonGroup>
						{!props.userId && (
							<p>
								You must be logged in to purchase a shirt. <Link href="/signin">Sign In</Link>
							</p>
						)}
						{purchaseType === "stripe" ? (
							<Button type="submit" variant="contained" color="primary" disabled={!props.canBuy} fullWidth>
								Purchase Shirt via Stripe
							</Button>
						) : (
							<Button
								variant="contained"
								color="primary"
								fullWidth
								disabled={!props.canBuy}
								onClick={generateShirt}>
								Purchase Shirt via Bank Transfer
							</Button>
						)}
					</div>
					{bankShirtsData?.data.generateShirt && !genShirtLoading && (
						<ASMShirt shirtData={bankShirtsData.data.generateShirt} />
					)}
					{genShirtLoading && !bankShirtsData?.error && <ASMShirtSkeleton />}
				</div>
			</div>
			<Accordion>
				<AccordionSummary>
					<h3>Shirt Sizing Guide</h3>
				</AccordionSummary>
				<AccordionDetails>
					<h2>Garment Sizing</h2>
					<div className={styles.sizing}>
						<div className={styles.image}>
							<Image
								src={ShirtMeasurements}
								alt="Shirt with markers showing where the width and length are measured from"
							/>
						</div>
						<table>
							<tbody>
								<tr>
									<th>Size</th>
									<th>
										Width (cm)
										<span>Chest width at underarm</span>
									</th>
									<th>
										Length (cm)
										<span>Shoulder point at neck to hem</span>
									</th>
								</tr>
								<tr>
									<td>S</td>
									<td>46</td>
									<td>71</td>
								</tr>
								<tr>
									<td>M</td>
									<td>51</td>
									<td>74</td>
								</tr>
								<tr>
									<td>L</td>
									<td>56</td>
									<td>76</td>
								</tr>
								<tr>
									<td>XL</td>
									<td>61</td>
									<td>79</td>
								</tr>
								<tr>
									<td>2XL</td>
									<td>66</td>
									<td>81</td>
								</tr>
								<tr>
									<td>3XL</td>
									<td>71</td>
									<td>84</td>
								</tr>
								<tr>
									<td>4XL</td>
									<td>76</td>
									<td>86</td>
								</tr>
							</tbody>
						</table>
					</div>
				</AccordionDetails>
			</Accordion>
		</div>
	);
}

type ASMShirtProps = {
	shirtData: {
		shirtID: string;
		size: string;
		paid: boolean;
	};
};

export function ASMShirt(props: ASMShirtProps) {
	const { shirtID, size, paid } = props.shirtData;

	return (
		<Box className={styles.generatedTickets} sx={{ boxShadow: 8 }}>
			<div className={styles.ticketID}>
				<span>Shirt ID</span>
				<span className={styles.label}>{shirtID}</span>
			</div>
			<div className={styles.informationGrid}>
				<span>BSB</span>
				<span>085-005</span>
				<span>Account #</span>
				<span>30-192-8208</span>
				<span>Shirt ID</span>
				<span>{shirtID}</span>
				<span>Shirt Size</span>
				<span>{size.toUpperCase()}</span>
				<span>Amount</span>
				<span>$30 AUD</span>
				<span>Status</span>
				<span>{paid ? "Paid" : "Unpaid"}</span>
			</div>
			{!paid && (
				<>
					<p>
						You <b>MUST</b> send the Shirt ID as the &quot;reference&quot;. Failure to do so will result in your
						shirt marked as not being paid.
					</p>
					<p>The shirt may take up to 7 days to update.</p>
				</>
			)}
		</Box>
	);
};

const ASMShirtSkeleton = () => {
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
