"use client";

import type { EventImagesBlock as EventImagesBlockProps } from "#/payload-types";

import RichText from "#/components/RichText/RichText";
import { Media } from "#/components/Media/Media";

import { ActionIcon, Button, Container, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { ChevronLeft, ChevronRight, ExternalLink } from "pixelarticons/react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import styles from "./EventImagesBlock.module.css";

export function EventImagesBlock({ title, richText, images, galleryUrl, galleryLabel }: EventImagesBlockProps) {
	const validImages = (images ?? []).filter((image) =>
		image.sourceType === "external" ? Boolean(image.externalUrl) : Boolean(image.uploadMedia),
	);

	if (validImages.length === 0 && !galleryUrl) return null;

	return (
		<Container component="section" size="lg">
			<Stack align="center" gap="lg">
				{title ? (
					<Title order={2} ta="center">
						{title}
					</Title>
				) : null}
				{richText && <RichText className={styles.content} data={richText} enableGutter={false} />}

				{validImages.length > 0 ? (
					<Carousel
						className={styles.carousel}
						autoPlay
						infiniteLoop
						stopOnHover
						swipeable
						emulateTouch
						showStatus={false}
						showIndicators={validImages.length > 1}
						showThumbs={false}
						interval={6000}
						transitionTime={600}
						renderArrowPrev={(onClick, hasPrev, label) =>
							hasPrev && validImages.length > 1 ? (
								<ActionIcon
									variant="filled"
									color="dark"
									radius="xl"
									size="xl"
									className={`${styles.arrow} ${styles.arrowPrev}`}
									onClick={onClick}
									aria-label={label}
								>
									<ChevronLeft width={22} height={22} />
								</ActionIcon>
							) : null
						}
						renderArrowNext={(onClick, hasNext, label) =>
							hasNext && validImages.length > 1 ? (
								<ActionIcon
									variant="filled"
									color="dark"
									radius="xl"
									size="xl"
									className={`${styles.arrow} ${styles.arrowNext}`}
									onClick={onClick}
									aria-label={label}
								>
									<ChevronRight width={22} height={22} />
								</ActionIcon>
							) : null
						}
						renderIndicator={(onClick, isSelected, index, label) => (
							<li className={styles.indicatorItem} key={index}>
								<UnstyledButton
									className={styles.indicator}
									data-active={isSelected || undefined}
									onClick={onClick}
									aria-label={`${label} ${index + 1}`}
									aria-current={isSelected ? "true" : undefined}
								/>
							</li>
						)}
					>
						{validImages.map((image, index) => {
							const key = image.id ? String(image.id) : `${image.sourceType}-${index}`;
							const caption = image.caption?.trim();

							return (
								<figure className={styles.slide} key={key}>
									<div className={styles.mediaFrame}>
										{image.sourceType === "external" && image.externalUrl ? (
											<img
												src={image.externalUrl}
												alt={caption || "Event photo"}
												className={styles.image}
												loading="lazy"
											/>
										) : (
											<Media
												className={styles.uploadMedia}
												pictureClassName={styles.uploadMedia}
												imgClassName={styles.image}
												resource={image.uploadMedia}
												fill
												size="(max-width: 1200px) 100vw, 1200px"
											/>
										)}
									</div>
									{caption ? (
										<Text
											component="figcaption"
											size="sm"
											c="dimmed"
											ta="center"
											className={styles.caption}
										>
											{caption}
										</Text>
									) : null}
								</figure>
							);
						})}
					</Carousel>
				) : null}

				{galleryUrl ? (
					<Button
						component="a"
						href={galleryUrl}
						target="_blank"
						rel="noopener noreferrer"
						variant="outline"
						size="md"
						rightSection={<ExternalLink width={16} height={16} />}
					>
						{galleryLabel || "View the full photo gallery"}
					</Button>
				) : null}
			</Stack>
		</Container>
	);
}
