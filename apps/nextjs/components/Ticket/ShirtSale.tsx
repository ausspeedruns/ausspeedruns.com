import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Box, Button, Skeleton, ThemeProvider, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { UseMutationResponse, useQuery, gql } from "urql";

import styles from "../styles/Store.module.scss";
import DiscordEmbed from "../DiscordEmbed";
import theme from "../../mui-theme";
import { useAuth } from "../auth";
import ASMShirt from "../ShirtOrder/ShirtOrder";

import ASM2023Logo from "../styles/img/ASM2023-Logo.svg";
import ShirtBlue from "../styles/img/ShirtBlue.png";
import ShirtMeasurements from "../styles/img/ShirtMeasurements.png";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const selloutDate = new Date(Date.UTC(2022, 5, 17, 4, 30, 0, 0));

console.log(selloutDate.toLocaleString());
console.log(new Date().toLocaleString());
function returnTimeRemaining(currentTime: Date, endDate: Date) {
	const remainingTime = new Date(endDate.getTime() - currentTime.getTime());
	return `${Math.round(
		remainingTime.getTime() / 86400000,
	)} days, ${remainingTime.getHours()} hours, ${remainingTime.getMinutes()} mins, ${remainingTime.getSeconds()} seconds`;
}

interface BankShirtResponse {
	generateShirt: {
		shirtID: string;
		size: string;
		colour: "blue" | "purple";
		paid: boolean;
		error?: Record<string, any>;
	};
}

const Store = () => {
	const auth = useAuth();
	const [shirtSize, setShirtSize] = useState("m");
	const [genShirtLoading, setGenShirtLoading] = useState(false);
	const [waitForShirt, setWaitForShirt] = useState(false);
	const [bankShirtData, setBankShirtData] = useState<UseMutationResponse<BankShirtResponse, object>[0]>();
	const [currentTime, setCurrentTime] = useState(new Date());

	const [profileQueryRes, profileQuery] = useQuery({
		query: gql`
			query Profile($userId: ID!) {
				user(where: { id: $userId }) {
					verified
				}
				event(where: { shortname: "ASM2023" }) {
					acceptingShirts
				}
			}
		`,
		variables: {
			userId: auth.ready ? auth.sessionData?.id ?? "" : "",
		},
		pause: !auth.ready || !auth?.sessionData?.id,
	});

	const successfulShirt = Boolean(bankShirtData) && !Boolean(bankShirtData?.error);

	const disableBuying =
		!auth.ready ||
		(auth.ready && !auth.sessionData) ||
		!profileQueryRes.data?.user?.verified ||
		!profileQueryRes.data?.event.acceptingShirts;
	const disableBank = disableBuying || genShirtLoading || successfulShirt;

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 500);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (genShirtLoading) {
			timeout = setTimeout(() => {
				setWaitForShirt(true);
			}, 2500);
		}
		return () => clearTimeout(timeout);
	}, [genShirtLoading, successfulShirt]);

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (waitForShirt) {
			interval = setInterval(() => {
				if (successfulShirt) {
					setGenShirtLoading(false);
				}
			}, 500);
		}
		return () => clearInterval(interval);
	}, [waitForShirt, successfulShirt]);

	async function generateShirt() {
		if (!auth.ready) {
			console.error("Tried to generate tickets but auth was not ready");
			return;
		}

		if (disableBuying) return;

		setGenShirtLoading(true);
		const res = await fetch(
			`/api/create_bank_shirt?account=${auth.ready ? auth?.sessionData?.id : ""}&colour=blue&size=${shirtSize}`,
		);
		// generateBankTickets({ userID: auth.sessionData.id, numberOfTickets: noOfTickets });
		if (res.status === 200) {
			setBankShirtData(await res.json());
		} else {
			console.log(res);
		}
	}

	let accId = "";
	if (auth.ready) {
		accId = auth.sessionData?.id ?? "";
	}

	let accUsername = "";
	if (auth.ready) {
		accUsername = auth.sessionData?.username ?? "";
	}

	if (bankShirtData?.error) console.error(bankShirtData.error);

	return (
		<ThemeProvider theme={theme}>
			<div className={styles.app}>
				<Head>
					<title>ASM2023 Shirt - AusSpeedruns</title>
					<DiscordEmbed
						title="ASM2023 Shirt - AusSpeedruns"
						description="Purchase the ASM2023 shirt!"
						pageUrl="/ASM2023/shirt"
					/>
				</Head>
				<main className={styles.content}>
					{/* <h1>ASM2023 Tickets</h1> */}
					<div className={styles.image}>
						<Image src={ASM2023Logo} alt="ASM2023 Logo" />
					</div>
					<section className={styles.itemContent}>
						<div className={styles.imageContainer}>
							<Image src={ShirtBlue} alt="Shirt design" />
						</div>
						<div>
							<h2>ASM2023 Shirt</h2>
							<p>
								Selling out June 17th ACST.
								<br />
								Time remaining: {returnTimeRemaining(currentTime, selloutDate)}.
							</p>
							<p>The official shirt for the Australian Speedrun Marathon 2023.</p>
							<p>
								Please note that all ASM2023 Shirt purchases{" "}
								<b>must be collected at the ASM2023 event</b>. No shipping will be offered.
							</p>
							<p>
								Design by{" "}
								<a href="https://twitter.com/elsaiyanz" target="_blank" rel="noopener noreferrer">
									Saiyanz
								</a>
								.
							</p>
							<p>
								Please note that any shirt ordered using the bank transfer method will be considered
								cancelled if payment is not cleared in the AusSpeedruns bank account before June 17
								ACST.
							</p>

							<h2>Size</h2>
							<div className={styles.preferences}>
								<ToggleButtonGroup
									fullWidth
									size="small"
									exclusive
									value={shirtSize}
									onChange={(e, value) => (value !== null ? setShirtSize(value) : undefined)}>
									<ToggleButton value="xs">XS</ToggleButton>
									<ToggleButton value="s">S</ToggleButton>
									<ToggleButton value="m">M</ToggleButton>
									<ToggleButton value="l">L</ToggleButton>
									<ToggleButton value="xl">XL</ToggleButton>
									<ToggleButton value="xl2">2XL</ToggleButton>
									<ToggleButton value="xl3">3XL</ToggleButton>
								</ToggleButtonGroup>
								<br />
								<br />
								{/* <h2>Colour</h2>
								<ToggleButtonGroup
									size="small"
									fullWidth
									exclusive
									value={shirtColour}
									onChange={(e, value) => (value !== null ? setShirtColour(value) : undefined)}
								>
									<ToggleButton value="blue">Blue</ToggleButton>
									<ToggleButton value="purple">Purple</ToggleButton>
								</ToggleButtonGroup> */}
							</div>

							{auth.ready && !auth?.sessionData && (
								<section className={styles.loginError}>
									You must be logged in and email verified to purchase shirts.
								</section>
							)}
							{auth.ready && auth?.sessionData && !profileQueryRes.data?.user?.verified && (
								<section className={styles.loginError}>
									Your email must be verified to purchase shirts.
								</section>
							)}
							<div className={styles.paymentMethod}>
								<form
									action={`/api/checkout_shirt?account=${accId}&colour=blue&size=${shirtSize}&username=${accUsername}`}
									method="POST">
									<Button
										type="submit"
										role="link"
										variant="contained"
										color="primary"
										fullWidth
										disabled={disableBuying}>
										Stripe Checkout $30.50
									</Button>
								</form>
							</div>
							<div className={styles.paymentMethod}>
								<Button
									variant="contained"
									color="primary"
									fullWidth
									disabled={disableBank}
									onClick={generateShirt}>
									(AUS ONLY) Bank transfer $30
								</Button>
							</div>
						</div>
					</section>
					{bankShirtData?.error && (
						<p>It seems like there was an error. Please try again or let Clubwho know on Discord!</p>
					)}
					{successfulShirt && !genShirtLoading && bankShirtData?.data && <ASMShirt shirtData={bankShirtData.data.generateShirt} />}
					{genShirtLoading && !bankShirtData?.error && <ASMShirtSkeleton />}
					<hr />
					<h2>Garment Sizing</h2>
					<div className={styles.sizing}>
						<div className={styles.image}>
							<Image
								src={ShirtMeasurements}
								layout="responsive"
								alt="Shirt with markers showing where the width and length are measured from"
							/>
						</div>
						<table>
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
								<td>XS</td>
								<td>41</td>
								<td>66</td>
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
								<td>77</td>
							</tr>
							<tr>
								<td>XL</td>
								<td>61</td>
								<td>79</td>
							</tr>
							<tr>
								<td>2XL</td>
								<td>66</td>
								<td>83</td>
							</tr>
							<tr>
								<td>3XL</td>
								<td>71</td>
								<td>85</td>
							</tr>
						</table>
					</div>
					<hr />
					<section className={styles.fullWidth}>
						<h2>Refund Policy</h2>
						<p>
							AusSpeedruns does not offer any refunds for purchased ASM2023 shirts, except as required by
							Australian law (e.g. the Australian Consumer Law). Individual exceptions may be considered
							on a case by case basis, however we acknowledge our full discretion to not grant exceptions
							that are sought.
						</p>
						<p>Please contact Sten via the AusSpeedruns Discord for any inquires.</p>
					</section>
				</main>
			</div>
		</ThemeProvider>
	);
};

const ASMShirtSkeleton: React.FC = () => {
	return (
		<Box className={[styles.generatedShirtSkeleton, styles.animation].join(" ")} sx={{ boxShadow: 8 }}>
			<Skeleton variant="rectangular" width={80} height={80} />
			<div className={styles.ticketID}>
				<Skeleton variant="rectangular" width={240} height={30} />
				<Skeleton variant="text" />
				<Skeleton variant="text" />
			</div>
			<div className={styles.informationGrid}>
				<Skeleton variant="rectangular" height={80} />
				<Skeleton variant="text" />
				<Skeleton variant="text" />
				<Skeleton variant="text" />
			</div>
		</Box>
	);
};

export default Store;
