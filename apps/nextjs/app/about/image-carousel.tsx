"use client";

import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import styles from "./About.module.scss";

import HeroImage1 from "./images/IMG_5192.jpg";
import HeroImage2 from "./images/IMG_9785.jpg";
import HeroImage3 from "./images/IMG_4289.jpg";
import HeroImage4 from "./images/IMG_5053.jpg";
import ASMBackground from "./images/IMG_9222-edited.jpg";

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
		img: ASMBackground,
		alt: "The crowd watches Paracusia run Super Mario 64 at ASM2022",
	},
];

export default function ImageCarousel() {
	return (
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
				return <Image key={i} src={image.img} alt={image.alt} fill />;
			})}
		</Carousel>
	);
}
