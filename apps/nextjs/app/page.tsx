import Head from "next/head";

// Components
import HeroBlock from "../components/Heroblock/Heroblock";
import { globals } from "../globals";
import DiscordEmbed from "../components/DiscordEmbed";

import styles from "../styles/index.module.scss";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Button from "../components/Button/Button";
import LastEventBlock from "../components/LastEventBlock/LastEventBlock";

import { AusSpeedrunsEvent } from "../types/types";
import { EventLive } from "../components/EventLive/EventLive";
import type { Metadata } from "next";

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
	heroImage: "events/asm23/asm23-hero.jpg",
	total: "35,000",
};

const ASAP2023: AusSpeedrunsEvent = {
	fullName: "AusSpeedruns At PAX 2023",
	preferredName: "ASAP2023",
	shortName: "ASAP2023",
	startDate: "6 October 2023 09:00:00 GMT+0100",
	dates: "October 6 - 8, 2023",
	charity: {
		name: "Game On Cancer",
	},
	logo: "events/asap23/asap23-logo.png",
	heroImage: "events/asap23/asap23-hero.jpg",
	total: "18,007",
};

const ASGX2024: AusSpeedrunsEvent = {
	fullName: "AusSpeedruns × The Game Expo 2024",
	preferredName: "ASGX2024",
	shortName: "ASGX2024",
	startDate: "23 March 2024 09:00:00 GMT+0930",
	dates: "March 23 – 24, 2024",
	charity: {
		name: "Game On Cancer",
	},
	logo: "events/asgx24/asgx-logo-white.png",
	heroImage: "events/asgx24/asgx24-hero.png",
	total: "6,050",
};

const ASDH2024: AusSpeedrunsEvent = {
	fullName: "DreamHack 2024",
	preferredName: "ASDH2024",
	shortName: "ASDH2024",
	startDate: "26 April 2024 09:00:00 GMT+0100",
	dates: "April 26 – 28, 2024",
	charity: {
		name: "Game On Cancer",
	},
	logo: "events/asdh24/DreamHack24Logo.png",
	heroImage: "Dreamhack.jpg",
	total: "10,000",
};

const ASM2024: AusSpeedrunsEvent = {
	fullName: "Australian Speedrun Marathon 2024",
	preferredName: "ASM2024",
	shortName: "ASM2024",
	startDate: "16 July 2024 09:00:00 GMT+0930",
	dates: "July 16 - 21, 2024",
	charity: {
		name: "Game On Cancer",
	},
	logo: "events/asm24/ASM24 SVG.svg",
	heroImage: "events/asm24/ASM24Hero.png",
	total: "30,500",
};

const ASAP2024: AusSpeedrunsEvent = {
	fullName: "AusSpeedruns At PAX 2024",
	preferredName: "ASAP2024",
	shortName: "ASAP2024",
	startDate: "11 October 2024 09:00:00 GMT+0100",
	dates: "October 11 - 13, 2024",
	charity: {
		name: "Game On Cancer",
	},
	logo: "events/asap24/asap24-logo.png",
	heroImage: "events/asap24/asap24-hero.jpg",
	total: "15,000",
};

const ASM2025: AusSpeedrunsEvent = {
	fullName: "Australian Speedrun Marathon 2025",
	preferredName: "ASM2025",
	shortName: "ASM2025",
	startDate: "15 July 2025 09:00:00 GMT+0930",
	dates: "July 15 – 20, 2025",
	charity: {
		name: "Game On Cancer",
	},
	logo: "events/asm25/logo.svg",
	heroImage: "events/asm24/asm24-hero-temp.png",
};

export const metadata: Metadata = {
	description: "Home of the AusSpeedruns events",
	openGraph: {
		title: "AusSpeedruns",
		description: "Home of the AusSpeedruns events",
	},
};

export default function Home() {
	return (
		<>
			{/* <EventLive event={"ASAP2024"} /> */}
			<HeroBlock
				event={ASM2025}
				tagLine="Our 10th Anniversary! Join us for a week of speedrunning and raising money for Game On Cancer!"
				ticketLink="/ASM2025#tickets"
				submitRuns={true}
				schedule={false}
			/>
			<LastEventBlock
				tagLine="AusSpeedruns At PAX 2024 was fantastic, raising over $15,000 for Game On Cancer!"
				event={ASAP2024}
				backgroundPos="center"
			/>
			<LastEventBlock
				tagLine="A stunning 6 days of non-stop speedrunning led us to raise over $30,000 for Game On Cancer!"
				event={ASM2024}
				backgroundPos="center"
			/>
			<LastEventBlock
				tagLine="The turn out for DreamHack Melbourne was incredible and we loved showcasing Australia's fastest gamers there!"
				event={ASDH2024}
				backgroundPos="center"
			/>
			<LastEventBlock
				tagLine="The Game Expo 2024 was awesome and we have now raised over $100,000 for Game On Cancer!"
				event={ASGX2024}
				backgroundPos="center"
			/>
			<section className={styles.archive}>
				<div className={styles.content}>
					<div className={styles.filler}></div>
					<div className={styles.text}>
						<h2>Missed a run?</h2>
						<p>Check our YouTube for runs from previous events.</p>
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
		</>
	);
}
