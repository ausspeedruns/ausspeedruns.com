"use client";

import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import styles from "./About.module.scss";

import HerpPAXRexDamosk from "./images/pax-rex-damosk.jpg";
import HeroASM24Group from "./images/asm24-group.jpg";
import HeroPAXGlintOpal from "./images/pax-glint-opal.jpg";
import HeroASM24Cheer from "./images/asm24-cheer.jpg";
import HeroASM24Soap from "./images/asm24-soap.jpg";
import HeroASM24OverShoulder from "./images/asm24-overshoulder.jpg";

const HERO_IMAGES = [
	{ img: HeroASM24OverShoulder, alt: "A photo of ASM2024 taken over the shoulder of a runner." },
	{
		img: HeroASM24Group,
		alt: "The community cheering after completing ASM2024!",
	},
	{
		img: HeroASM24Cheer,
		alt: "ASM2024 attendees cheering during a successful run",
	},
	{
		img: HeroASM24Soap,
		alt: "ZoomieG dressed as a bar of soap, Softman25 dressed as a stack of dollar bills and Astrious dressed as himself, laugh at LiquidWifi at ASM2024",
	},
	{
		img: HerpPAXRexDamosk,
		alt: "Rexaaayyy and Damosk having a laugh",
	},
	{
		img: HeroPAXGlintOpal,
		alt: "Glint and Opallua running Kingdom Hearts at ASAP2022",
	},
];

export function ImageCarousel() {
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
