import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Box, Button, Skeleton, ThemeProvider, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { UseMutationResponse, useQuery, gql } from "urql";

import styles from "../../styles/Store.module.scss";
import DiscordEmbed from "../../components/DiscordEmbed";
import { theme } from "../../components/mui-theme";
import { useAuth } from "../../components/auth";

import ASM2023Logo from "../../styles/img/ASM2023-Logo.png";
import ASM2023Shirt from "../../styles/img/ASM2023ShirtMockup.png";
import ShirtMeasurements from "../../styles/img/ShirtMeasurements.png";

const Shirt = () => {
	const auth = useAuth();
	const [shirtSize, setShirtSize] = useState<any[]>([]);
	const [shirtSizeConfirm, setShirtConfirm] = useState("");

	const [profileQueryRes] = useQuery({
		query: gql`
			query Profile($userId: ID!) {
				user(where: { id: $userId }) {
					verified
					shirts(where: { created: { gt: "2023-01-01T00:00:00.000Z" } }) {
						notes
						shirtID
					}
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

	async function updateShirtSize(index) {
		if (!auth.ready) {
			console.error("Tried to generate tickets but auth was not ready");
			return;
		}

		console.log(shirtSize, index, shirtSize[index])

		const res = await fetch(
			`/api/set_shirt_size?shirtID=${shirtsNeedingSizes[index].shirtID}&size=${shirtSize[index]}`,
		);
		// generateBankTickets({ userID: auth.sessionData.id, numberOfTickets: noOfTickets });
		if (res.status === 200) {
			const data = await res.json();
			setShirtConfirm(`Set ${data.shirtID} size!`);
		} else {
			console.error(res);
		}
	}

	const shirtsNeedingSizes =
		(profileQueryRes.data?.user.shirts.filter((shirt) => shirt.notes[0] == "#") as Record<string, any>[]) ?? [];
	console.log(shirtsNeedingSizes);

	function handleSizeChange(index, size) {
		let nextSizes = shirtSize;

		if (nextSizes.length < shirtsNeedingSizes.reduce((acc, cur) => acc + parseInt(cur.notes[1], 10), 0)) {
			nextSizes = [...Array(shirtsNeedingSizes.reduce((acc, cur) => acc + parseInt(cur.notes[1], 10), 0))];
		}

		nextSizes = nextSizes.map((shirt, i) => {
			if (i === index) {
				// Increment the clicked counter
				return size;
			} else {
				// The rest haven't changed
				return shirt;
			}
		});

		setShirtSize(nextSizes);
	}

	return (
		<ThemeProvider theme={theme}>
			<div className={styles.app}>
				<Head>
					<title>ASM2023 Shirt - AusSpeedruns</title>
					<DiscordEmbed
						title="ASM2023 Shirt Size - AusSpeedruns"
						description="Select your shirt size"
						pageUrl="/ASM2023/shirt-size"
					/>
				</Head>
				<main className={styles.content}>
					<div className={styles.image}>
						<Image src={ASM2023Logo} alt="ASM2023 Logo" />
					</div>
					<section className={styles.itemContent}>
						<div className={styles.imageContainer}>
							<Image src={ASM2023Shirt} alt="Shirt design" />
						</div>
						<div>
							<h1>ASM2023 Shirt</h1>
							<p>
								Selling out June 15th ACST.
								{/* <br /> */}
								{/* Time remaining: {returnTimeRemaining(currentTime, selloutDate)}. */}
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
								cancelled if payment is not cleared in the AusSpeedruns bank account before June 15
								ACST.
							</p>

							<h2>
								Shirt
								{shirtsNeedingSizes.length > 1 && <>s</>}
							</h2>
							{shirtsNeedingSizes.map((shirt, i) => {
								return (
									<>
										<div className={styles.preferences}>
											<h3>ID: {shirt.shirtID}</h3>
											<ToggleButtonGroup
												fullWidth
												size="small"
												exclusive
												value={shirtSize[i]}
												onChange={(e, value) =>
													value !== null ? handleSizeChange(i, value) : undefined
												}>
												<ToggleButton value="m">M</ToggleButton>
												<ToggleButton value="l">L</ToggleButton>
												<ToggleButton value="xl">XL</ToggleButton>
												<ToggleButton value="xl2">2XL</ToggleButton>
												<ToggleButton value="xl3">3XL</ToggleButton>
												<ToggleButton value="xl4">4XL</ToggleButton>
											</ToggleButtonGroup>
											<br />
											<br />
											<Button
												variant="contained"
												color="primary"
												fullWidth
												disabled={!shirtSize[i]}
												onClick={() => updateShirtSize(i)}>
												Set Shirt Size
											</Button>
										</div>
									</>
								);
							})}
							<h3>{shirtSizeConfirm}</h3>
						</div>
					</section>
					<hr />
					<h2>Garment Sizing</h2>
					<div className={styles.sizing}>
						<div className={styles.image}>
							<Image
								src={ShirtMeasurements}
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
						</table>
					</div>
				</main>
			</div>
		</ThemeProvider>
	);
};

export default Shirt;
