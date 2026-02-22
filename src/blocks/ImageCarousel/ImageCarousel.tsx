"use client";

import type { ImageCarouselBlock as ImageCarouselBlockProps } from "#/payload-types";

import styles from "./ImageCarousel.module.css";
import RichText from "#/components/RichText";
import { Media } from "#/components/Media";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

export function ImageCarouselBlock({ richText, images }: ImageCarouselBlockProps) {
	return (
		<div style={{ position: "relative" }}>
			<Carousel
				className={styles.carousel}
				// centerMode
				// centerSlidePercentage={80}
				autoPlay
				infiniteLoop
				showArrows={false}
				showStatus={false}
				showIndicators={false}
				showThumbs={false}
				interval={5000}
				transitionTime={1500}
			>
				{images?.map((image, i) => {
					return <Media resource={image.media} />;
				})}
			</Carousel>
			{richText && <RichText className={styles.content} data={richText} enableGutter={false} />}
		</div>
	);
}
