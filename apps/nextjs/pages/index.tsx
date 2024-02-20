import Head from "next/head";

// Components
import HeroBlock from "../components/Heroblock/Heroblock";
import { globals } from "../globals";
import DiscordEmbed from "../components/DiscordEmbed";

import styles from "../styles/index.module.scss";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Button from "../components/Button/Button";
import LastEventBlock from "../components/LastEventBlock/LastEventBlock";

import OGImage from "../styles/img/IndexOG.png";
import { AusSpeedrunsEvent } from "../types/types";
import { EventLive } from "../components/EventLive/EventLive";
import ASMMLive from "../components/ASMM/asmm-live";
import DualUpcomingEvent from "../components/DualUpcomingEvent/DualUpcomingEvent";

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
	heroImage: "events/asdh24/Dreamhack24Hero.jpg",
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
				{/* <EventLive event={"ASAP2023"} /> */}
				{/* <ASMMLive /> */}
				{/* <div
					style={{
						background: "#CC7722",
						color: "white",
						height: 100,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						gap: 16,
					}}>
					We've just announced the Australian Speedruns Marathon Marathon! A walkathon we will be conducting
					during ASM2023
					<Button colorScheme="secondary inverted" link="/asmm" actionText="Learn more" />
				</div> */}
				{/* <HeroBlock
					event={ASAP2023}
					ticketLink="https://aus.paxsite.com/"
					schedule
					tagLine="We're going to PAX! Schedule has been released!"
				/> */}
				<DualUpcomingEvent
					eventA={{
						event: ASGX2024,
						tagLine: "The Schedule is released!",
						ticketLink: "https://www.thegameexpo.com/",
						schedule: true,
					}}
					eventB={{
						event: ASDH2024,
						tagLine: "Game Submissions for Dreamhack are Open!",
						submitRuns: true,
						ticketLink: "https://dreamhack.com/australia/"
					}}
				/>
				<LastEventBlock
					tagLine="AusSpeedruns At PAX 2023 SMASHED it out of the park over DOUBLING our previous record!"
					event={ASAP2023}
					backgroundPos="center"
					// overrideHeight='800px'
				/>
				<LastEventBlock
					tagLine="The Australian Speedrunning community once again came together to put on the best ASM ever to help raise $35,000!!!"
					event={ASM2023}
					backgroundPos="center"
					// overrideHeight='800px'
				/>
				<LastEventBlock
					tagLine="We had an incredible time showcasing speedruns at the very first TGX!"
					event={next}
					backgroundPos="center"
				/>
				<LastEventBlock
					tagLine="We smashed our donation record and put on 3 jam packed days of speedrunning."
					event={current}
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
