import Head from 'next/head';
import Image from 'next/image';
import DiscordEmbed from '../components/DiscordEmbed';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import styles from '../styles/Schedule.module.scss';

import ASAP2022Logo from '../styles/img/PAX2022 Logo WhiteBG.png';

const aspectRatio = ASAP2022Logo.width / ASAP2022Logo.height;
const imageHeight = 150;

export default function Schedule() {
	return (
		<div>
			<Head>
				<title>ASAP2022 Schedule - AusSpeedruns</title>
				<DiscordEmbed title="ASAP2022 Schedule" />
			</Head>
			<Navbar />
			<main className={styles.content}>
				<Image src={ASAP2022Logo} width={aspectRatio * imageHeight} height={imageHeight} title="ASAP2022 Logo" alt="ASAP2022 Logo" />
				<h1>ASAP2022 Schedule</h1>
				<a href="https://horaro.org/asap2022/schedule" target="_blank" rel="noreferrer">View externally on Horaro</a>
				<div className={styles.iframeContainer}>
					<iframe src="https://horaro.org/asap2022/schedule" />
				</div>
			</main>
			<Footer />
		</div>
	);
}