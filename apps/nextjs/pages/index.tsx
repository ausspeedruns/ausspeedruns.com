import Head from 'next/head';

// Components
import Navbar from '../components/Navbar/Navbar';
import Heroblock from '../components/Heroblock/Heroblock';
import EventDetails from '../components/EventDetails/EventDetails';
import TileGroup from '../components/Tiles/TileGroup';
import Footer from '../components/Footer/Footer';
import { globals } from '../globals';
import DiscordEmbed from '../components/DiscordEmbed';

import styles from '../styles/index.module.scss';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/Button/Button';
import LastEventBlock from '../components/LastEventBlock/LastEventBlock';

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
				<Heroblock event={next} />
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
			</main>
		</div>
    );
}
