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
					<h3>HyperX Cloud II Headset</h3>
					<p>
						Minimum $40 Donation, 2 to give away! These headsets have been designed for comfort, performance, and
						durability, not to mention a very immersive gaming experience. To go in the running to win one of 2 pairs all you need to do is donate at least
						$40 during ASM2022.{' '}
						<a
							target="_blank"
							href="https://row.hyperx.com/collections/gaming-headsets/products/hyperx-cloud-ii?variant=40209424646349"
							rel="noopener noreferrer"
						>
							Link to Headset
						</a>
					</p>
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
					<h3>Landfall Games Bundle</h3>
					<p>
						Minimum $10 Donation, 8 to give away! Game bundle with Totally Accurate Battle Simulator, Clustertruck and
						Knightfall.
					</p>
				</p>

				<h2>Prize Terms and Conditions</h2>
				<div className={styles.prizeterms}>
					<ol>
						<li>
							The ASM2022 Prize Giveaway (&apos;the Competition&apos;) is open from the 1st of July to 19th July, 2022, and is for
							three (3) categories of prizes; A, B, and C. The competition will close specifically at 11:59pm ACST, 19th
							July, 2022
							<ol>
								<li>
									Prize A is the Landfall Games Bundle. Prize A consists of a Steam Game Code for the games Totally
									Accurate Battle Simulator, Clustertruck and Knightfall. There are eight (8) units available of Prize
									A.
								</li>
								<li>
									Prize B is a set of HyperX Cloud Earbuds. There are two (2) units available of Prize B. Shipping will
									be provided at no cost to the winners of Prize B, to Australian addresses only.
								</li>
								<li>
									Price C is a HyperX Cloud II Headset. There are two (2) units available of Prize C. Shipping will be
									provided at no cost to the winners of Prize C, to Australian addresses only.
								</li>
							</ol>
						</li>
						<li>
							In order to be eligible to become a winner of the Competition, a person must make a donation to the
							Australian Speedrun Marathon 2022 fundraiser’s Tiltify page (“the Fundraiser’) before the close of the
							Competition. This page can be found at{' '}
							<a
								target="_blank"
								rel="noopener noreferrer"
								href="https://tiltify.com/@ausspeedruns/aus-speedrun-marathon-2022/"
							>
								https://tiltify.com/@ausspeedruns/aus-speedrun-marathon-2022/
							</a>
							. Each prize category has a minimum donation:
							<ol>
								<li>To be eligible to win Prize A, a minimum donation of $10 must be made</li>
								<li> To be eligible to win Prize B, a minimum donation of $20 must be made</li>
								<li>To be eligible to win Prize C, a minimum donation of $40 must be made</li>
								<li>
									A donation of a higher amount automatically creates an entry into lower value categories. For example,
									a donation of $20 will make that person eligible for Prizes A and B within that one donation
								</li>
							</ol>
						</li>
						<li>
							A person can have multiple entries into the competition, determined by total donations across the
							Competition’s length, divided by the minimum donation amount, rounded down.
							<ol>
								<li>
									Example: John Doe donates a total of $150 over the course of the Competition’s length. This would
									entitle them to 15 entries into Prize A, 7 entries into Prize B, and 3 entries into Prize C
								</li>
							</ol>
						</li>
						<li>
							To determine the winner of the competition, an export of all donations made to the Fundraiser will be made
							on 20th July 2022. Relevant calculations will be made in order to determine how many entries each person
							has into each category of prizing, in line with clause 3. Winners will then be drawn on or before 24th
							July 2022.
						</li>
						<li>
							A person cannot win more than one unit of each prize category. In the event that a set of winners is drawn
							that involves a person winning more than one unit of a prize category, the units comprising that person’s
							second and subsequent wins in that category will be re-drawn and a new winner selected for each.
							<ol>
								<li>If required, multiple re-draws will be completed to accommodate this clause. </li>
								<li>
									Example: The prizes are drawn and Jane Doe has been selected to win 3 units of Prize A. Jane Doe would
									be allotted one unit of Prize A, with 2 units of Prize A being re-drawn. If Jane Doe were to be
									selected a second time within the re-draw, that unit would be re-drawn once again
								</li>
							</ol>
						</li>
						<li>
							If persons who win Prize B or C cannot supply an Australian address for their prize to be shipped to
							(noting clause 1b and 1c), the winner of that unit will be re-drawn and a new winner selected.
							<ol>
								<li> If required, multiple re-draws will be completed to accommodate this clause. </li>
							</ol>
						</li>
						<li>
							Members of the 2022 AusSpeedruns Committee, staff members of Game on Cancer / Cure Cancer, staff members
							of any AusSpeedruns sponsor, and any entity with corporate personhood cannot be winners. If any such
							person is drawn as a winner, the winner of that unit will be re-drawn and a new winner selected.
							<ol>
								<li>If required, multiple re-draws will be completed to accommodate this clause. </li>
							</ol>
						</li>
						<li>
							Once the drawing of winners has been completed, the winner of each unit of Prizes A, B and C will be
							contacted via the email that was utilised whilst donating to the Fundraiser, to distribute the prize.
							<ol>
								<li>
									Once the drawing of winners has been completed, the winner of each unit of Prizes A, B and C will be
									contacted via the email that was utilised whilst donating to the Fundraiser, to distribute the prize.{' '}
								</li>
							</ol>
						</li>
					</ol>
				</div>
			</main>
			<Footer className={styles.footer} />
		</div>
	);
};

export default PoliciesPage;
