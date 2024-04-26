import Head from "next/head";
import styles from "../../styles/Event.incentives.module.scss";

import DiscordEmbed from "../../components/DiscordEmbed";
import Button from "apps/nextjs/components/Button/Button";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

const Incentives = () => {
	return (
		<div className={styles.app}>
			<Head>
				<title>ASDH2024 Prizes - AusSpeedruns</title>
				<DiscordEmbed title="ASDH2024 Prizes - AusSpeedruns" pageUrl="/ASDH2024/prizes" />
			</Head>
			<main className={styles.content}>
				<h2>Prizes</h2>
				<div className={styles.donate}>
					<Button
						actionText="Donate"
						link="/donate"
						openInNewTab
						iconRight={faChevronRight}
					/>
				</div>
				<p className={styles.prizeToC}>
					Prizes are Australia Only
					<br />
					<a href="https://ausspeedruns.sharepoint.com/:w:/s/Main/ESIuKlHwN6RMlJVOU392dUEBUO-xhJeirw7ZK8joTtbfcg?e=dHCgB3">
						Prizes Terms and Conditions
					</a>
				</p>
				<section className={styles.prizes}>
					<Prize name="Cult of the Lamb Game Code" requirement="$10 Minimum Donation" />
					<Prize name="Doors of Insanity Game Code" requirement="$10 Minimum Donation" />
					<Prize name="Hazel Sky Game Code" requirement="$10 Minimum Donation" />
					<Prize name="The Library of Babel Game Code" requirement="$10 Minimum Donation" />
					<Prize name="2x Turtle Beach Recon 200 gen 2" requirement="DreamHack Sonic 3 Winners" />
					<Prize name="Quokka $50 Gift Card" requirement="DreamHack Crash Team Racing Winner" />
					<Prize name="3x Game On Cancer Swag Bag" requirement="DreamHack Super Monkey Ball Winners" />
				</section>
			</main>
		</div>
	);
};

interface PrizeProps {
	name: string;
	requirement: string;
}

const Prize = (props: PrizeProps) => {
	return (
		<div className={styles.prize}>
			<h2>{props.name}</h2>
			<p>{props.requirement}</p>
		</div>
	);
};

export default Incentives;
