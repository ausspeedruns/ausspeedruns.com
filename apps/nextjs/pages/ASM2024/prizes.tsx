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
					<Button actionText="Donate" link="/donate" openInNewTab iconRight={faChevronRight} />
				</div>
				<p className={styles.prizeToC}>
					Prizes are Australia Only
					<br />
					<a href="https://ausspeedruns.sharepoint.com/:w:/s/Main/Ed4lNYeD4GJFu3j-64V59F4BY45iiOvucDeWwgB_LLxshQ?rtime=p-3mJ2qi3Eg">
						Prizes Terms and Conditions
					</a>
				</p>
				<section className={styles.prizes}>
					<Prize
						name="Fellow Traveller Game Bundle A"
						requirement="$10 Minimum Donation | 2 to give away"
						description="The Pale Beyond, Citizen Sleeper, & Beacon Pines"
					/>
					<Prize
						name="Fellow Traveller Game Bundle B"
						requirement="$10 Minimum Donation | 2 to give away"
						description="Kraken Academy, Paradise Killer, & Genesis Noir"
					/>
					<Prize
						name="Neon Doctrine Game Bundle"
						requirement="$30 Minimum Donation | 2 to give away"
						description="Doors of Insanity, Hazel Sky, The Library of Babel, & The Legend of Tianding"
					/>
					<Prize
						name="Anna Purna Interactive Game Bundle"
						requirement="$50 Minimum Donation | 2 to give away"
						description="Neon White, Thirsty Suitors, The Artful Escape, Stray, Storyteller, & COCOON"
					/>
					<Prize
						name="Fellow Traveller Bundle Complete"
						requirement="$50 Minimum Donation"
						description="The Pale Beyond, Citizen Sleeper, Beacon Pines, Kraken Academy, Paradise Killer, & Genesis Noir"
					/>
				</section>
			</main>
		</div>
	);
};

interface PrizeProps {
	name: string;
	requirement: string;
	description?: string;
}

const Prize = (props: PrizeProps) => {
	return (
		<div className={styles.prize}>
			<h2>{props.name}</h2>
			<p className={styles.requirement}>{props.requirement}</p>
			<p>{props.description}</p>
		</div>
	);
};

export default Incentives;
