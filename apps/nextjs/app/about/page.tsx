import Image from "next/image";
import type { Metadata } from "next";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

import { globals } from "../../globals";
import Button from "../../components/Button/Button";
import { faDiscord, faTwitch, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { ImageCarousel } from "./image-carousel";
import { AnimatedTotal } from "./animated-total";

import styles from "./About.module.scss";

import ASRLogo from "../../styles/img/AusSpeedruns-Logo-Full-White.svg";
import ASMLogo from "./images/ASMLogo.svg";
import DHLogo from "./images/DreamHack_Logo_RGB_WHITE.svg";
import PAXLogo from "./images/PAXLogo.png";
import PAXBackground from "./images/PAX.jpg";
import ASMBackground from "./images/asm.jpg";
import DHBackground from "./images/Dreamhack.jpg";
import AllCharities from "./images/AllCharities.png";

export const metadata: Metadata = {
	title: "About Us",
	description: "About AusSpeedruns",
};

export default function Home() {
	return (
		<main className={styles.aboutUs}>
			{/* Hero Image */}
			<div className={styles.heroContainer}>
				<ImageCarousel />
				<div className={styles.overlay}>
					<Image src={ASRLogo} alt="AusSpeedruns Logo" width={800} />
					Australian Speedrunners coming together for charity
				</div>
			</div>

			{/* Speedrun definition and tagline */}
			<section className={styles.content}>
				<div className={styles.definition}>
					<h2>Speedrun</h2>
					<span className={styles.pronounciation}>/ ˈspiː drʌn /</span>
					<p>
						<span className={styles.noun}>noun</span>
						<span>
							an instance of completing a video game, or level of a game,
							<b> as fast as possible</b>
						</span>
					</p>
				</div>
				<p className={styles.tagline}>
					We are AusSpeedruns.
					<br />A non-profit organisation dedicated to raising money for charity through speedrun marathons.
				</p>
			</section>

			{/* AusSpeedruns description */}
			<section className={styles.description}>
				<p className={[styles.content, styles.tagline].join(" ")}>
					We have been organising speedrun marathons since 2015, starting with AVCon in Adelaide. Since then,
					we have grown to become the largest speedrun marathon organisation in Australia, with a strong and
					dedicated community. In addition to working with conventions such as PAX Australia, DreamHack, The Game Expo,
					AVCon, and Comic Con Australia. We also run our own annual event, the Australian Speedrun Marathon.
				</p>
			</section>

			{/* Events */}
			<div className={styles.events}>
				<div
					className={styles.event}
					style={{
						backgroundImage: `url(${DHBackground.src})`,
					}}>
					<Image src={DHLogo} alt="TGX Logo" height={125} width={500} />
				</div>
				<div
					className={styles.event}
					style={{
						backgroundImage: `url(${ASMBackground.src})`,
					}}>
					<Image src={ASMLogo} alt="ASM Logo" height={125} />
				</div>
				<div
					className={styles.event}
					style={{
						backgroundImage: `url(${PAXBackground.src})`,
					}}>
					<Image src={PAXLogo} alt="PAX Logo" height={125} />
				</div>
			</div>

			{/* Charities */}
			<section className={styles.charities}>
				<div className={styles.amountRaised}>
					<span>So far we have raised over</span>
					<span className={styles.amount}>
						<span className={styles.dollarSymbol}>$</span>
						<AnimatedTotal />
					</span>
					<span>for different charities in Australia.</span>
				</div>
				<Image src={AllCharities} alt="Image collage of charities" height={300} width={800} />
			</section>

			{/* CTA */}
			<section className={styles.callToAction}>
				<p className={[styles.content, styles.tagline].join(" ")}>
					So if you're a fan of playing games as fast as possible and want to make a difference, we encourage
					you to get involved with AusSpeedruns. Whether you're a veteran speedrunner or just picked up your
					first speedgame, we welcome you to join us and be a part of something special. Together, we can make
					a difference while going fast.
				</p>
				<div className={styles.buttons}>
					<Button
						actionText="Join our Discord"
						iconRight={faDiscord}
						colorScheme="secondary lightHover"
						link={globals.socialLinks.discord}
						openInNewTab
					/>
					<Button
						actionText="Follow us on Twitch"
						iconRight={faTwitch}
						colorScheme="secondary lightHover"
						link={globals.socialLinks.twitch}
						openInNewTab
					/>
					<Button
						actionText="Follow us on Twitter"
						iconRight={faTwitter}
						colorScheme="secondary lightHover"
						link={globals.socialLinks.twitter}
						openInNewTab
					/>
				</div>
			</section>

			{/* Contact */}
			<section className={styles.contact}>
				<p className={[styles.content, styles.tagline].join(" ")}>
					<span>
						For any questions please join our{" "}
						<a href={globals.socialLinks.discord} target="_blank" rel="noreferrer">
							{" "}
							Discord{" "}
						</a>
					</span>
				</p>
				<p className={[styles.content, styles.tagline].join(" ")}>
					If you would like to collaborate with us please reach out to
					<a href="mailto:ausspeedruns@ausspeedruns.com">ausspeedruns@ausspeedruns.com</a>
				</p>
			</section>
		</main>
	);
}
