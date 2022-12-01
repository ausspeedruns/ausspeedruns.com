import Head from 'next/head';

// Components
import Navbar from '../components/Navbar/Navbar';
import Heroblock from '../components/Heroblock/Heroblock';
import EventDetails from '../components/EventDetails/EventDetails';
import TileGroup from '../components/Tiles/TileGroup';
import Footer from '../components/Footer/Footer';
import { globals } from '../globals';
import DiscordEmbed from '../components/DiscordEmbed';
import Image from "next/image";

import styles from '../styles/index.module.scss';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/Button/Button';
import { EventLive } from '../components/EventLive/EventLive';
import LastEventBlock from '../components/LastEventBlock/LastEventBlock';

import HyperX from '../styles/img/sponsors/HyperX/HyperX Solid White.svg';
import Landfall from '../styles/img/sponsors/Landfall.png';

export default function Home() {
	const {
		events: { previous, current, next },
	} = globals;
	return (
        <div>
			<Head>
				<title>AusSpeedruns</title>
				<DiscordEmbed title="AusSpeedruns" description="Home of the AusSpeedruns events" pageUrl="/" />
			</Head>
			<main>
				{/* {!eventLive && <Heroblock event={current} />}
				{eventLive && <EventLive event={current.preferredName} />} */}
				<LastEventBlock event={current} backgroundPos="center" />
				<LastEventBlock event={previous} />
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
								colorScheme={'secondary'}
								target={'_blank'}
							/>
						</div>
					</div>
				</section>
				{/* <section className={styles.sponsors}>
					<div className={styles.main}>
						<div className={styles.sponsor}>
							<span>Major Partner</span>
							<Image
                                src={HyperX}
                                width={500}
                                height={200}
                                alt="HyperX Logo"
                                style={{
                                    maxWidth: "100%",
                                    height: "auto"
                                }} />
						</div>
					</div>
					<div className={styles.secondary}>
						<div className={styles.sponsor}>
							<span>Minor Partner</span>
							<Image
                                src={Landfall}
                                width={200}
                                height={153}
                                alt="Landfall Games Logo"
                                style={{
                                    maxWidth: "100%",
                                    height: "auto"
                                }} />
						</div>
					</div>
				</section> */}
				<TileGroup
					tiles={[
						{
							title: 'About AusSpeedruns',
							description:
								'Also known as Australian Speedrunners, AusSpeedruns is a not-for-profit organisation that brings together the best speedrunners in Australia to raise money and awareness for charity at events across Australia.',
						},
						{
							title: 'Previous event',
							description: `Our last event was ${previous.fullName}, where our community helped us raise over $${
								previous.total
							} for ${
								previous.charity!.name
							}. We'd like to thank all the members of our community, our sponsors, runners and event staff for helping us run such a successful event.`,
						},
					]}
				/>
			</main>
		</div>
    );
}
