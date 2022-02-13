import Head from 'next/head';
import React from 'react';
import styles from '../../styles/Event.ASM2022.module.scss';

import Navbar from '../../components/Navbar/Navbar';
import ASM2022Logo from '../../styles/img/ASM2022-Logo.svg';
import StockPhoto1 from '../../styles/img/StockPhoto1.jpg';
import StockPhoto2 from '../../styles/img/StockPhoto2.jpg';
import StockPhoto3 from '../../styles/img/StockPhoto3.jpg';
import Footer from '../../components/Footer/Footer';

export default function EventPage() {
	return (
		<div className="App">
			<Head>
				<title>ASM2022 - AusSpeedruns</title>
			</Head>
			<Navbar />
			<header className={styles.header}>
				<img src={ASM2022Logo.src} />
			</header>
			<main>
				<div className={styles.contentRow}>
					<div className={styles.intro}>
						<h2>Australian Speedrun Marathon 2022</h2>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ultricies quam eros, vitae congue est auctor
							et. Suspendisse eget libero tempor, egestas velit id, luctus risus. Fusce pharetra ut dolor id vehicula.
							Vestibulum dignissim quam eget euismod ullamcorper. Suspendisse hendrerit massa non lectus pellentesque,
							id tincidunt leo luctus.
						</p>
					</div>
					<img src={StockPhoto1.src} />
				</div>
				<div className={styles.contentRow}>
					<img src={StockPhoto2.src} />
					<div className={styles.moreInfo}>
						<p>
							We will be releasing more information about the event soon. Follow us on Twitter or Join the Discord to be
							notified as soon as possible!
						</p>
					</div>
				</div>
				<div className={styles.informationSection}>
					<h3>Information</h3>
					<div className={styles.information}>
						<span>Dates</span>
						<span>TBA (Winter)</span>
						<span>Location</span>
						<span>Adelaide</span>
						<span>Price</span>
						<span>TBA</span>
						<span>Submission Open Date</span>
						<span>TBA</span>
						<span>Charity</span>
						<span>Beyond Blue</span>
					</div>
				</div>
			</main>
			<img className={styles.footer} src={StockPhoto3.src} />
			<Footer />
		</div>
	);
}
