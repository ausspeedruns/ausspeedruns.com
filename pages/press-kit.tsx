import React from 'react';
import Head from 'next/head';

import styles from '../styles/PressKit.module.scss';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { useQuery, gql } from 'urql';
import DiscordEmbed from '../components/DiscordEmbed';

const PressKit = () => {
	const [pressKitResult, pressKitQuery] = useQuery({
		query: gql`
			query {
				events {
					name
					pressKit {
						url
					}
				}
			}
		`,
	});

	return (
		<div className={styles.app}>
			<Head>
				<title>Press Kit - AusSpeedruns</title>
				<DiscordEmbed
					title="Press Kit - AusSpeedruns"
					description="Press Kit for AusSpeedruns and our events"
					pageUrl="/press-kit"
				/>
			</Head>
			<Navbar />
			<main className={styles.content}>
				<h2>Press Kit</h2>
				<p>
					<a target="_blank" rel="noreferrer" href="/AusSpeedruns_Logos.zip" className={styles.ausspeedrunsLogo}>
						AusSpeedruns Logos
					</a>
				</p>
				<div>
					<div className={`${styles.colourBox} ${styles.orange}`} />
					<p>Orange: #CC7722</p>
				</div>
				<div>
					<div className={`${styles.colourBox} ${styles.blue}`} />
					<p>Blue: #437C90</p>
				</div>

				<h3>Event Press Kits</h3>
				<div className={styles.pressKitList}>
					{pressKitResult.data?.events.map((event) => {
						if (!event.pressKit) return;
						return (
							<a target="_blank" rel="noreferrer" href={event.pressKit.url} key={event.name}>
								{event.name}
							</a>
						);
					})}
				</div>
			</main>
			<Footer className={styles.footer} />
		</div>
	);
};

export default PressKit;
