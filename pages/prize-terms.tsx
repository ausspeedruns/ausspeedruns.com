import React from 'react';
import Head from 'next/head';

import styles from '../styles/Policies.module.scss';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import DiscordEmbed from '../components/DiscordEmbed';

const PoliciesPage = () => {
	return (
		<div className={styles.app}>
			<Head>
				<title>Policies - AusSpeedruns</title>
				<DiscordEmbed title="Policies - AusSpeedruns" description="AusSpeedruns's policies" pageUrl="/policies" />
			</Head>
			<Navbar />
			<main className={styles.content}>
				<h2>Prize Terms and Conditions</h2>
			</main>
			<Footer className={styles.footer} />
		</div>
	);
};

export default PoliciesPage;
