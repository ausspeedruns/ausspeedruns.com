import Head from "next/head";
import { ThemeProvider } from "@mui/material";

import styles from "../styles/SignIn.module.scss";
import { theme } from "../components/mui-theme";
import DiscordEmbed from "../components/DiscordEmbed";

export default function CrowdControl() {
	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>Crowd Control - AusSpeedruns</title>
				<DiscordEmbed
					title="Crowd Control - AusSpeedruns"
					description="Information about Crowd Control"
					pageUrl="/crowd-control"
				/>
			</Head>
			<div className={styles.background} />
			<div className={`${styles.content} ${styles.form}`} style={{ padding: "5rem" }}>
				<h1 style={{ marginBottom: "3rem" }}>Crowd Control at ASM2023</h1>
				<p>
					During ASM2023, you will have the opportunity on four occasions to use{" "}
					<a target="_blank" rel="noopener noreferrer" href="https://crowdcontrol.live/">
						Crowd Control
					</a>
					, a Warp World product, to interact with our runners whilst they showcase their skills. Crowd
					Control lets you interact with the event in all kinds of zany ways, like making the player fall
					asleep, giving or taking items, increasing or decreasing movement speed, and much more!
				</p>
				<p>
					This will be occurring at the following start times (ACST); see the{" "}
					<a href="/schedule" target="_blank" rel="noopener noreferrer">
						schedule
					</a>{" "}
					to see start times for your local time zone.
				</p>
				<h2>Runs</h2>
				<ul>
					<li>Hollow Knight: 12 July, 2:05 PM</li>
					<li>Celeste: 14 July, 2:45 PM</li>
					<li>The Elder Scrolls V: Skyrim: 15 July, 1:35 PM</li>
					<li>Minecraft: 16 July, 3:40 PM</li>
				</ul>
				<h2>How to interact</h2>
				<p>
					The below is a short guide on how to interact with Crowd Control at ASM2023, being used by
					AusSpeedruns in “Charity Mode”, meaning ALL Crowd Control donations go towards Game On Cancer, an
					initiative of Cure Cancer, our charity of choice for this event.
				</p>
				<ol className={styles.spacedList}>
					<li>
						First, you will need to acquire “Crowd Control Coins”. Click on the Crowd Control logo, which is
						an overlay within the twitch stream.
					</li>
					<li>Go to “Donate”, then click “Donate to Cure Cancer”.</li>
					<li>
						This will link to the Tiltify campaign for ASM2023. Please note that donations made towards
						ASM2023 <b>WITHOUT</b> having clicked on this link will not provide you with Crowd Control Coins.
						<br/>Donations convert to Crowd Control Coins at a rate of 1c USD to 1 Coin.
					</li>
					<li>
						Fill out your desired donation amount,
						email, Display Name for us to read out your donation (or anonymous if chosen), and then select
						your payment method.
					</li>
					<li>
						Wait about 30 seconds from your donation going through, return to twitch, then click the coin icon to refresh your
						balance; your coins are now ready to use!
					</li>
					<li>Click the “Effects” tab and have fun! </li>
				</ol>
				<p>
					We note at this point that pricing, price scaling, and cooldown decisions have been made in the
					context of the charity element of this event, as well as the consideration that this is a scheduled
					event, which needs to run at least generally to a set of timings. We further note that Crowd Control
					is not directly affiliated with AusSpeedruns, and any errors you encounter as users should be
					addressed to Crowd Control / Warp World.
				</p>
				<p>
					AusSpeedruns wishes you all the best creating some Crowd Control chaos with our runners at ASM2023!
				</p>
			</div>
		</ThemeProvider>
	);
}
