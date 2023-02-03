import Head from "next/head";

// Components
import Heroblock from "../components/Heroblock/Heroblock";
import { globals } from "../globals";
import DiscordEmbed from "../components/DiscordEmbed";

import styles from "../styles/index.module.scss";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Button from "../components/Button/Button";
import LastEventBlock from "../components/LastEventBlock/LastEventBlock";

import OGImage from "../styles/img/IndexOG.png";
import { AusSpeedrunsEvent } from "../types/types";

// TODO: Move this stuff to keystone
const ASM2023: AusSpeedrunsEvent = {
	fullName: "Australian Speedrun Marathon 2023",
	preferredName: "ASM2023",
	shortName: "ASM2023",
	startDate: "12 July 2023 09:00:00 GMT+0930",
	dates: "July 12 - 16, 2023",
	charity: {
		name: "Game On Cancer",
	},
	logo: "ASM2023-Logo.png",
	heroImage: "ASM2023Hero.png",
};

export default function Home() {
	const {
		events: { previous, current, next },
	} = globals;
	return (
		<div>
			<Head>
				<title>AusSpeedruns</title>
				<DiscordEmbed
					title="AusSpeedruns"
					description="Home of the AusSpeedruns events"
					pageUrl="/"
					imageSrc={OGImage.src}
				/>
			</Head>
			<main>
				{/* {!eventLive && <Heroblock event={current} />}
				{eventLive && <EventLive event={current.preferredName} />} */}
				<Heroblock event={next} darkText schedule />
				<Heroblock event={ASM2023} tagline="The Australian Speedrun Marathon returns! Tickets and submissions will be announced shortly." />
				<LastEventBlock event={current} backgroundPos="center" />
				<LastEventBlock event={previous} />
				<section className={styles.archive}>
					<div className={styles.content}>
						<div className={styles.filler}></div>
						<div className={styles.text}>
							<h2>Missed a run?</h2>
							<p>
								Check our YouTube for runs from previous events.
							</p>
							<Button
								actionText="Watch again"
								link={globals.socialLinks.youtube}
								iconRight={faChevronRight}
								colorScheme={"secondary"}
								target={"_blank"}
							/>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
