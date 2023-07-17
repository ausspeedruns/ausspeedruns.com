import { RefObject, useEffect, useRef, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import anime from "animejs";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

import DiscordEmbed from "../components/DiscordEmbed";
import { globals } from "../globals";
import Button from "../components/Button/Button";
import {
	faDiscord,
	faTwitch,
	faTwitter,
} from "@fortawesome/free-brands-svg-icons";

import styles from "../styles/about.module.scss";
import ASRLogo from "../styles/img/AusSpeedruns-Logo-Full-White.svg";
import ASMLogo from "../styles/img/about/ASMLogo.svg";
import TGXLogo from "../styles/img/about/TGXLogo.png";
import PAXLogo from "../styles/img/about/PAXLogo.png";
import PAXBackground from "../styles/img/about/IMG_5264.jpg";
import ASMBackground from "../styles/img/about/IMG_4740.jpg";
import TGXBackground from "../styles/img/about/37702952_1429746967125476_8025977769395486720_n.jpg";
import AllCharities from "../styles/img/about/AllCharities.png";

import HeroImage1 from "../styles/img/about/IMG_5192.jpg";
import HeroImage2 from "../styles/img/about/IMG_9785.jpg";
import HeroImage3 from "../styles/img/about/IMG_4289.jpg";
import HeroImage4 from "../styles/img/about/IMG_5053.jpg";
import HeroImage5 from "../styles/img/about/IMG_5837.jpg";

const HERO_IMAGES = [
	{ img: HeroImage1, alt: "Rexaaayyy and Damosk having a laugh" },
	{
		img: HeroImage2,
		alt: "The community cheering after ASM2022 for having raised $24,500!",
	},
	{
		img: HeroImage3,
		alt: "DaMidg, Paladinight and LaceyStripes running Kingdom Hearts at ASM2022",
	},
	{
		img: HeroImage4,
		alt: "Glint and Opallua running Kingdom Hearts at ASAP2022",
	},
	{
		img: HeroImage5,
		alt: "Clockdistrict running Spyro at ASM2022 with Bored_Banana and Prophetblack commentating",
	},
	{
		img: ASMBackground,
		alt: "The crowd watches Paracusia run Super Mario 64 at ASM2022"
	},
];

function useOnScreen(ref: RefObject<HTMLElement>) {
	const [isIntersecting, setIntersecting] = useState(false);

	let observer: IntersectionObserver | null = null;

	// const observer = useMemo(
	// 	() =>
	// 		new IntersectionObserver(([entry]) =>
	// 			setIntersecting(entry.isIntersecting),
	// 		),
	// 	[ref],
	// );

	useEffect(() => {
		if (ref.current) {
			observer = new IntersectionObserver(([entry]) =>
				setIntersecting(entry.isIntersecting),
			);
			observer.observe(ref.current);
		}
		return () => observer?.disconnect();
	}, []);

	return isIntersecting;
}

function padZerosLocaleString(num: number, zeros: number): string {
	const numString = num.toString();
	const paddedString = "0".repeat(zeros - numString.length) + numString;
	return (
		paddedString.slice(0, -3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
		"," +
		paddedString.slice(-3)
	);
}

const AMOUNT_RAISED = 145000; // $145,000

export default function Home() {
	const amountRef = useRef<HTMLSpanElement>(null);
	const amountVisible = useOnScreen(amountRef);
	const [amountAnimated, setAmountAnimated] = useState(false);

	useEffect(() => {
		if (!amountAnimated && amountVisible) {
			setAmountAnimated(true);
			anime({
				targets: amountRef.current,
				innerText: [0, AMOUNT_RAISED],
				easing: "easeOutQuart",
				round: true,
				delay: 100,
				duration: 3000,
				update: function (a) {
					if (a.animations.length > 0 && amountRef.current) {
						const value = a.animations[0].currentValue;
						const formattedNumber = padZerosLocaleString(
							parseInt(value),
							6,
						);
						amountRef.current.innerText = formattedNumber;
					}
				},
			});
		}
	}, [amountVisible, amountAnimated]);

	return (
		<div>
			<Head>
				<title>About Us - AusSpeedruns</title>
				<DiscordEmbed
					title="AusSpeedruns"
					description="About AusSpeedruns"
					pageUrl="/"
				/>
			</Head>
			<main className={styles.aboutUs}>
				{/* Hero Image */}
				<div className={styles.heroContainer}>
					<Carousel
						className={styles.carousel}
						autoPlay
						infiniteLoop
						showArrows={false}
						showStatus={false}
						showIndicators={false}
						showThumbs={false}
						interval={5000}
						transitionTime={1500}>
						{HERO_IMAGES.map((image, i) => {
							return (
								<Image key={i} src={image.img} alt={image.alt} fill />
							);
						})}
					</Carousel>

					<div className={styles.overlay}>
						<Image
							src={ASRLogo}
							alt="AusSpeedruns Logo"
							width={800}
						/>
						Australian Speedrunners coming together for charity
					</div>
				</div>

				{/* Speedrun definition and tagline */}
				<section className={styles.content}>
					<div className={styles.definition}>
						<h2>Speedrun</h2>
						<span className={styles.pronounciation}>
							/ ˈspiː drʌn /
						</span>
						<p>
							<span className={styles.noun}>noun</span>
							<span>
								an instance of completing a video game, or level
								of a game,
								<b> as fast as possible</b>
							</span>
						</p>
					</div>
					<p className={styles.tagline}>
						We are AusSpeedruns.
						<br />A non-profit organisation dedicated to raising
						money for charity through speedrun marathons.
					</p>
				</section>

				{/* AusSpeedruns description */}
				<section className={styles.description}>
					<p className={[styles.content, styles.tagline].join(" ")}>
						We have been organising speedrun marathons since 2015,
						starting with AVCon in Adelaide. Since then, we have
						grown to become the largest speedrun marathon
						organisation in Australia, with a strong and dedicated
						community. In addition to working with conventions such
						as PAX Australia, The Game Expo, AVCon, and Comic Con
						Australia, we also run our own annual event, the
						Australian Speedrun Marathon.
					</p>
				</section>

				{/* Events */}
				<div className={styles.events}>
					<div
						className={styles.event}
						style={{
							backgroundImage: `url(${TGXBackground.src})`,
						}}>
						<Image src={TGXLogo} alt="TGX Logo" height={125} />
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
							<span ref={amountRef}>
								{(AMOUNT_RAISED).toLocaleString()}
							</span>
						</span>
						<span>for different charities in Australia.</span>
					</div>
					<Image
						src={AllCharities}
						alt="Image collage of charities"
						height={300}
						width={800}
					/>
				</section>

				{/* CTA */}
				<section className={styles.callToAction}>
					<p className={[styles.content, styles.tagline].join(" ")}>
						So if you're a fan of playing games as fast as possible
						and want to make a difference, we encourage you to get
						involved with AusSpeedruns. Whether you're a veteran
						speedrunner or just picked up your first speedgame, we
						welcome you to join us and be a part of something
						special. Together, we can make a difference while going
						fast.
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
							<a
								href={globals.socialLinks.discord}
								target="_blank"
								rel="noreferrer">
								{" "}
								Discord{" "}
							</a>
						</span>
					</p>
					<p className={[styles.content, styles.tagline].join(" ")}>
						If you would like to collaborate with us please reach
						out to
						<a href="mailto:ausspeedruns@ausspeedruns.com">
							ausspeedruns@ausspeedruns.com
						</a>
					</p>
				</section>
			</main>
		</div>
	);
}
