import Head from 'next/head';
import Image from 'next/image';
import DiscordEmbed from '../components/DiscordEmbed';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import styles from '../styles/Schedule.module.scss';

import ASM2022Logo from '../styles/img/ASM2022-Logo.svg';

export default function Schedule() {
	return (
		<div>
			<Head>
				<title>ASM2022 Schedule - AusSpeedruns</title>
				<DiscordEmbed title="ASM2022 Schedule" />
			</Head>
			<Navbar />
			<main className={styles.content}>
				<Image src={ASM2022Logo} width={600} height={150} />
				<h1>ASM2022 Schedule</h1>
				<a href="https://horaro.org/asm2022/schedule" target="_blank" rel="noreferrer">View externally on Horaro</a>
				<div className={styles.iframeContainer}>
					<iframe src="https://horaro.org/asm2022/schedule" />
				</div>
			</main>
			<Footer />
		</div>
	);
}