"use client";

import type { EventImagesBlock as EventImagesBlockProps } from "#/payload-types";

import RichText from "#/components/RichText/RichText";
import { Media } from "#/components/Media/Media";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import styles from "./EventImagesBlock.module.css";

export function EventImagesBlock({ richText, images }: EventImagesBlockProps) {
	return (
		<section className={styles.wrapper}>
			{richText && <RichText className={styles.content} data={richText} enableGutter={false} />}

			<Carousel
				className={styles.carousel}
				autoPlay
				infiniteLoop
				showStatus={false}
				showIndicators
				showThumbs={false}
				interval={5000}
				transitionTime={700}
				centerMode
				centerSlidePercentage={80}
			>
				{images?.map((image, index) => {
					const key = image.id ? String(image.id) : `${image.sourceType}-${index}`;
					const caption = image.caption?.trim();

					return (
						<div className={styles.slide} key={key}>
							<div className={styles.mediaFrame}>
								{image.sourceType === "external" && image.externalUrl ? (
									<img
										src={image.externalUrl}
										alt={caption || "Event image"}
										className={styles.externalImage}
										loading="lazy"
									/>
								) : (
									<Media
										className={styles.uploadMedia}
										imgClassName={styles.uploadedImage}
										resource={image.uploadMedia}
									/>
								)}

								{caption && <p className={styles.captionOverlay}>{caption}</p>}
							</div>
						</div>
					);
				})}
			</Carousel>
		</section>
	);
}
