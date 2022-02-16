import React from 'react';
import Head from 'next/head';

import styles from '../styles/Policies.module.scss';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

const PoliciesPage = () => {
	return (
		<div className={`app ${styles.app}`}>
			<Head>
				<title>Policies - AusSpeedruns</title>
			</Head>
			<header className="App-header">
				<Navbar />
			</header>
			<main className={`content ${styles.content}`}>
				<h2>Policies</h2>
				<p>
					<a target='_blank' href="https://docs.google.com/document/d/1xsmquXa8QzhzlZY59W5iTncvxhrPV2h1TZo8UNFZHUM/edit?usp=sharing">
						External link to Google Doc containing all policies.
					</a>
				</p>
			</main>
			<Footer className={styles.footer} />
		</div>
	);
};

export default PoliciesPage;
