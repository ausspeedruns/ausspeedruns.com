import styles from "../../styles/SignIn.module.scss";

import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Crowd Control",
	description: "Information about Crowd Control",
};

const EVENT = "ASM2025";

const RUNS = ["Super Smash Bros Melee: 19 July, 1:15 PM"] as const;

export default function CrowdControl() {
	return (
		<div>
			<div className={styles.background} />
			<div className={`${styles.content} ${styles.form}`} style={{ padding: "5rem" }}>
				<h1 style={{ marginBottom: "3rem" }}>Crowd Control at {EVENT}</h1>
				<p>
					During {EVENT}, you will have the opportunity on four occasions to use{" "}
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
					{RUNS.map((run, index) => (
						<li key={index}>{run}</li>
					))}
				</ul>
				<h2>How to interact</h2>
				<p>
					The below is a short guide on how to interact with Crowd Control at {EVENT}, being used by
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
						This will link to the Tiltify campaign for {EVENT}. Please note that donations made towards
						{EVENT} <b>WITHOUT</b> having clicked on this link will not provide you with Crowd Control
						Coins.
						<br />
						Donations convert to Crowd Control Coins at a rate of 1c USD to 1 Coin.
					</li>
					<li>
						Fill out your desired donation amount, email, Display Name for us to read out your donation (or
						anonymous if chosen), and then select your payment method.
					</li>
					<li>
						Wait about 30 seconds from your donation going through, return to twitch, then click the coin
						icon to refresh your balance; your coins are now ready to use!
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
					AusSpeedruns wishes you all the best creating some Crowd Control chaos with our runners at {EVENT}!
				</p>
			</div>
		</div>
	);
}
