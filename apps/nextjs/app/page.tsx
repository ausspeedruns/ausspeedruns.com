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
	heroImage: "events/asm25/asm25-post-hero.jpg",
	total: "51,000",
};

const ACMI: AusSpeedrunsEvent = {
	fullName: "ACMI Speedrun Weekend",
	preferredName: "ACMI",
	shortName: "ACMI",
	startDate: "21 June 2025 13:30:00 GMT+0930",
	dates: "June 21 – 22, 2025",
	logo: "events/acmi/logo.svg",
	heroImage: "events/acmi/hero.jpg",
};

const ASAP2025: AusSpeedrunsEvent = {
	fullName: "AusSpeedruns At PAX 2025",
	preferredName: "ASAP2025",
	shortName: "ASAP2025",
	startDate: "10 October 2025 09:00:00 GMT+0100",
	dates: "October 10 - 12, 2025",
	charity: {
		name: "Game On Cancer",
	},
	logo: "events/asap25/asap25-logo.svg",
	heroImage: "events/asap25/asap25-hero.jpg",
	total: "20,000",
};

const ASO2026: AusSpeedrunsEvent = {
	fullName: "AusSpeedruns Open 2026",
	preferredName: "ASO2026",
	shortName: "ASO2026",
	startDate: "24 January 2026 09:00:00 GMT+1100",
	dates: "January 24 - 25, 2026",
	charity: {
		name: "Game On Cancer",
	},
	logo: "events/aso26/aso26-temp.svg",
	heroImage: "events/aso26/sydney.jpg",
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
			<HeroBlock event={ASO2026} tagLine="A Speedrun Event in Sydney? Finally!!" />

			{/* <EventLive event={"ASAP2025"} /> */}

			<LastEventBlock
				tagLine="PAX Aus 2025 was a blast, raising over $20,000 for Game On Cancer!"
				event={ASAP2025}
				backgroundPos="center"
			/>
			<LastEventBlock
				tagLine="The best ASM ever, raising over $50,000 for Game On Cancer!!!!"
				event={ASM2025}
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
