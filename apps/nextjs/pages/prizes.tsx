import Head from "next/head";

import styles from "../styles/Prizes.module.scss";
import DiscordEmbed from "../components/DiscordEmbed";
import Button from "../components/Button/Button";

const PoliciesPage = () => {
	return (
		<div className={styles.app}>
			<Head>
				<title>ASGX2024 Prizes - AusSpeedruns</title>
				<DiscordEmbed
					title="ASGX2024 Prizes - AusSpeedruns"
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
					<h3>Sonic Superstars</h3>
					<h5>Steam Code</h5>
					<p>
						Minimum $20 Donation.
					</p>
					<h3>Cult of the Lamb</h3>
					<h5>Steam Code</h5>
					<p>
						Minimum $10 Donation.
					</p>
					<h3>Neon White</h3>
					<h5>Steam Code</h5>
					<p>
						Minimum $10 Donation.
					</p>
					<h3>Cocoon</h3>
					<h5>Steam Code</h5>
					<p>
						Minimum $10 Donation.
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
