import React from 'react';
import Head from 'next/head';

import styles from '../styles/Prizes.module.scss';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import DiscordEmbed from '../components/DiscordEmbed';
import Button from '../components/Button/Button';

const PoliciesPage = () => {
	return (
		<div className={styles.app}>
			<Head>
				<title>ASM2022 Prizes - AusSpeedruns</title>
				<DiscordEmbed title="ASM2022 Prizes - AusSpeedruns" description="AusSpeedruns's Prizes" pageUrl="/prizes" />
			</Head>
			<Navbar />
			<main className={styles.content}>
				<h2>Prizes</h2>
				<p>
					<Button actionText="Donate to be in the running!" link="/donate" />
					<br />
					<br />
					<h3>HyperX Cloud Buds</h3>
					<p>
						Minimum $20 Donation, 2 to give away! These are great for travelling, are on a lightweight flexible neckband
						and feature three ear tip sizes, an in-line mic and multi-function button so you can answer calls, control
						tracks, and activate digital assistants. To go in the running to win a pair all you need to do is donate at
						least $20 during ASM2022.{' '}
						<a
							target="_blank"
							href="https://www.hyperxgaming.com/en/headsets/cloud-buds-bluetooth-wireless-headphones"
							rel="noopener noreferrer"
						>
							Link to Headset
						</a>
					</p>
				</p>

				<h2 id="terms">Prize Terms and Conditions</h2>
				<div className={styles.prizeterms}>
					<ol>
						<li>
							The ASAP2022 Prize Giveaway (&apos;the Competition&apos;) is open from the 5th of October to 9th of
							October, 2022, and is for one (1) category of prize. The competition will close specifically at 11:59pm
							ACST, 9th October, 2022
							<ol>
								<li>
									The prize is a set of HyperX Cloud Mix Buds. There are four (4) units of this prize available.
									Shipping will be provided at no cost to the winners, to Australian addresses only.
								</li>
							</ol>
						</li>
						<li>
							In order to be eligible to become a winner of the Competition, a person must make a donation to the
							ASAP2022 fundraiser&apos;s Tiltify page (&apos;the Fundraiser&apos;) before the close of the Competition.
							This page can be found at{' '}
							<a target="_blank" rel="noopener noreferrer" href="https://tiltify.com/@ausspeedruns/asap2022/">
								https://tiltify.com/@ausspeedruns/asap2022/
							</a>
							.
							<ol>
								<li>The prize has a minimum donation amount of $25.</li>
							</ol>
						</li>
						<li>
							A person can have multiple entries into the competition, determined by total donations across the
							Competition&apos;s length, divided by the minimum donation amount, rounded down.
							<ol>
								<li>
									Example: John Doe donates a total of $250 over the course of the Competition&apos;s length. This would
									entitle them to 10 entries into the prize draw
								</li>
							</ol>
						</li>
						<li>
							To determine the winner of the competition, an export of all donations made to the Fundraiser will be made
							on 11th October 2022. Relevant calculations will be made in order to determine how many entries each
							person has in the prize draw, in line with clause 3. Winners will then be drawn on or before 14th October
							2022.
						</li>
						<li>
							A person cannot win more than one unit of the prize. In the event that a set of winners is drawn that
							involves a person winning more than one unit of the prize, the units comprising that person&apos;s second
							and subsequent wins will be re-drawn and a new winner selected for each.
							<ol>
								<li>If required, multiple re-draws will be completed to accommodate this clause.</li>
							</ol>
						</li>
						<li>
							If persons who win the prize cannot supply an Australian address for their prize to be shipped to (noting
							clause 1a), the winner of that unit will be re-drawn and a new winner selected.
							<ol>
								<li>If required, multiple re-draws will be completed to accommodate this clause.</li>
							</ol>
						</li>
						<li>
							Members of the 2022 AusSpeedruns Committee, staff members of Game on Cancer / Cure Cancer, staff members
							of any AusSpeedruns sponsor, and any entity with corporate personhood cannot be winners. If any such
							person is drawn as a winner, the winner of that unit will be re-drawn and a new winner selected.
							<ol>
								<li>If required, multiple re-draws will be completed to accommodate this clause.</li>
							</ol>
						</li>
						<li>
							Once the drawing of winners has been completed, the winner of each unit of the prize draw will be
							contacted via the email that was utilised whilst donating to the Fundraiser, to distribute the prize.
							<ol>
								<li>
									If no response is garnered within 5 days of the email being sent, the win will be considered null and
									void, and a new winner will be drawn. This process will be repeated until all units of the prize have
									been distributed.
								</li>
							</ol>
						</li>
					</ol>
				</div>
				<h2 id="twitter">Twitter Prize Terms and Conditions</h2>
				<div className={styles.prizeterms}>
					<ol>
						<li>
							This AusSpeedruns Cloud Buds Giveaway (&apos;the Competition&apos;) is open from the 7th to 9th October,
							2022, and is for 1 (one) pair of HyperX Cloud Mix Buds Wireless Headphones (&apos;the Cloud Buds&apos;).
							The competition will close specifically at 7:00pm AEDT, 9 October 2022.
						</li>
						<li>
							Shipping will be provided for the Cloud Buds if requested, at no cost to the Winner. Shipping will be
							completed to Australian addresses only.
						</li>
						<li>
							In order to be eligible to become the winner of the Competition (&apos;the Winner&apos;), a person must on
							their Twitter account perform the following actions: Tweet a photo of themselves in the attendance at our
							stage area at PAX Australia 2022, and include all of the following tags in the tweet:
							&quot;@AusSpeedruns&quot;, &quot;#ASAP2022&quot; and &quot;#PAXAUS&quot; Performing these actions will
							entitle a person to 1 (one) entry into the Competition.
						</li>
						<li>A person may have 1 (one) entry into the Competition per day of the Competition.</li>
						<li>
							Members of the 2022 AusSpeedruns Committee, staff members of Game on Cancer / Cure Cancer, staff members
							of any AusSpeedruns sponsor, and any entity with corporate personhood cannot be winners. If any such
							person is drawn as a winner, the winner of that unit will be re-drawn and a new winner selected.
						</li>
						<li>
							On the 10th of October, the Winner will be selected by the AusSpeedruns Committee. The winner will be
							selected at the discretion of the AusSpeedruns Committee based on quality. Criteria include (but are not
							limited to) creativity, appeal and aesthetics.
						</li>
						<li>
							After the winner is selected, a member of the AusSpeedruns Committee member will contact the Winner. The
							Winner must respond with their desired address for the prize to be shipped to, before October 17 at 8PM
							AEDT. If they do not, another Winner will be selected at this time; who will have until October 19 at 8PM
							AEDT to respond. If no response is gained before then, a third Winner will be drawn and contacted, who
							will have until October 21 at 8PM AEDT to respond. If no response is gained again, the Competition will be
							considered null and void.
						</li>
						<li>
							Once the Winner has confirmed their shipping address, the Winner&apos;s tweet will be quote retweeted by
							AusSpeedruns and the Competition concluded.
						</li>
					</ol>
				</div>
			</main>
			<Footer className={styles.footer} />
		</div>
	);
};

export default PoliciesPage;
