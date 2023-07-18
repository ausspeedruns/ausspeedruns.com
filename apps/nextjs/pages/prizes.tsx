import Head from "next/head";

import styles from "../styles/Prizes.module.scss";
import DiscordEmbed from "../components/DiscordEmbed";
import Button from "../components/Button/Button";

const PoliciesPage = () => {
	return (
		<div className={styles.app}>
			<Head>
				<title>ASM2023 Prizes - AusSpeedruns</title>
				<DiscordEmbed
					title="ASM2023 Prizes - AusSpeedruns"
					description="AusSpeedruns's Prizes"
					pageUrl="/prizes"
				/>
			</Head>
			<main className={styles.content}>
				<h2>Prizes</h2>
				<p>
					<Button actionText="Donate to be in the running!" link="/donate" />
					<br />
					<br />
					<h3>Elgato Streamer Pack</h3>
					<p>
						Minimum $100 Donation, 3 to give away! Consisting of an Elgato Stream Deck Mk2, and an Elgato
						Wave:3 Microphone, this streamer pack is perfect for any content creator get started, or upgrade
						their setup on any platform! To go in the running to win this streamer pack, all you need to do
						is donate at least $100 during ASM2023.
					</p>
					<h3>A night at Adelaide's Rockford Hotel</h3>
					<p>
						Minimum $50 Donation, 1 to give away! Win a night in a Superior King Room at Adelaide's Rockford
						Hotel, complete with a Full Buffet Breakfast for 2, and Car Parking for 1 vehicle. The winner
						will receive a digital coupon that can be used anytime before July 12th, 2024. To go in the
						running for this room at Adelaide's Rockford hotel all you need to do is donate at least $50
						during ASM2023.
					</p>
					<h3>Sonic Origins Plus - Physical Copy</h3>
					<p>
						Minimum $30 Donation, 3 to give away! Comprising of 16 classic Sonic games, this ultimate
						collection is a must have for any Sonic fan. With the 12 Game Gear titles added, along with the
						4 classic titles of Sonic 1, 2, CD, and 3 & Knuckles all revitalised in a new engine, with all
						of Sonic, Tails, Knuckles, and for the first time Amy playable in all these games, these games
						have everything a classic Sonic fan could ask for and more! This prize is available for both PS5
						and Switch consoles, winners will be contacted for their preference. To go in the running to win
						one of these copies all you need to do is donate at least $30 during ASM2023.
					</p>
					<h3>Heavenly Bodies Steam Code</h3>
					<p>
						Minimum $10 Donation, 3 to give away! This space based adventure game by 2pt Interactive will
						have you pull and twist your way through an increasingly precarious range of physically
						simulated stellar scenarios, where without gravity, nothing is still, nothing is secure, and
						nothing is simple. To go in the running to win this game you need to do is donate at least $10
						during ASM2023.
					</p>
					<h3>Speaking Simulator Steam Code</h3>
					<p>
						Minimum $5 Donation, 3 to give away! You'll be in stitches from this game by Affable Games, as
						you learn about the complexity of conversation, as you convince a world of trusting humans that
						you are definitely NOT a robot. Moving you tongue and lips to try and make words come out might
						be a bit more difficult than you thought, hopefully your face doesn't explode along the way. To
						go in the running to win this game all you need to do is donate at least $5 during ASM2023.
					</p>
				</p>
				<a href="https://ausspeedruns.sharepoint.com/:w:/s/Main/ESjl4LUolJFAuZwXyzuwtTAB7cGd6_IfYLi0sxn5iTvPSQ?e=zrRFGO" target="_blank" rel="noopener noreferrer">
					Prizes Terms and Conditions
				</a>
			</main>
		</div>
	);
};

export default PoliciesPage;
