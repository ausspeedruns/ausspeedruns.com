import Head from "next/head";
import Image from "next/image";

// Components
import HeroBlock from "../components/Heroblock/Heroblock";
import { globals } from "../globals";
import DiscordEmbed from "../components/DiscordEmbed";

import styles from "../styles/index.module.scss";
import { faCalendar, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Button from "../components/Button/Button";
import LastEventBlock from "../components/LastEventBlock/LastEventBlock";

import OGImage from "../styles/img/IndexOG.png";
import { AusSpeedrunsEvent } from "../types/types";
import { EventLive } from "../components/EventLive/EventLive";
import ASMMLive from "../components/ASMM/asmm-live";
import DualUpcomingEvent from "../components/DualUpcomingEvent/DualUpcomingEvent";
import { useMediaQuery } from "@mui/material";

import DreamhackLogo from "../styles/img/events/asdh24/DreamHack24Logo.png";

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
	heroImage: "events/asdh24/Dreamhack24Hero.jpg"
};

const ASM2024: AusSpeedrunsEvent = {
	fullName: "Australian Speedrun Marathon 2024",
	preferredName: "ASM2024",
	shortName: "ASM2024",
	startDate: "16 July 2024 09:00:00 GMT+0930",
	dates: "July 16 - 21, 2023",
	charity: {
		name: "Game On Cancer",
	},
	logo: "events/asm24/ASM24 SVG.svg",
	heroImage: "events/asm24/asm24-hero-temp.png",
};

export default function Home() {
	const {
		events: { previous, current, next },
	} = globals;

	const mobileWidth = useMediaQuery("(max-width: 992px)");

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
				{/* <div className={styles.banner}>
					{!mobileWidth && (
						<Image src={DreamhackLogo} height={30} width={371} alt="The Dreamhack Wordmark Logo" />
					)}
					Our Dreamhack schedule just got released!
					<Button
						colorScheme="secondary inverted"
						link="/ASDH2024/schedule"
						iconRight={faCalendar}
						actionText="Dreamhack Schedule"
					/>
				</div> */}
				{/* <EventLive event={"ASGX2024"} /> */}
				{/* <ASMMLive /> */}
				<HeroBlock
					event={ASDH2024}
					schedule
					tagLine="See you at Dreamhack!"
					ticketLink="https://dreamhack.com/australia/"
				/>
				<HeroBlock
					event={ASM2024}
					submitRuns
					tagLine="Tickets are selling and Submissions are open!"
					ticketLink="/ASM2024/tickets"
				/>
				{/* <DualUpcomingEvent
					eventA={{
						event: ASGX2024,
						tagLine: "The Schedule is released!",
						ticketLink: "https://www.thegameexpo.com/",
						schedule: true,
					}}
					eventB={{
						event: ASDH2024,
						tagLine: "Schedule for Dreamhack out soon.",
						ticketLink: "https://dreamhack.com/australia/",
					}}
				/> */}
				<LastEventBlock
					tagLine="The Game Expo 2024 was awesome and we have now raised over $100,000 for Game On Cancer!"
					event={ASGX2024}
					backgroundPos="center"
				/>
				<LastEventBlock
					tagLine="AusSpeedruns At PAX 2023 SMASHED it out of the park over DOUBLING our previous record!"
					event={ASAP2023}
					backgroundPos="center"
				/>
				<LastEventBlock
					tagLine="The Australian Speedrunning community once again came together to put on the best ASM ever to help raise $35,000!!!"
					event={ASM2023}
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
			</main>
		</div>
	);
}
