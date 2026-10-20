import React from "react";
import type { SocialBannerBlock as SocialBannerBlockProps } from "#/payload-types";
import { Container, Stack, Text, Title } from "@mantine/core";
import { Media } from "#/components/Media/Media";
import { HeroButton } from "#/blocks/EventHeroBlock/HeroButton";
import styles from "./SocialBannerBlock.module.css";

export function SocialBannerBlock(props: SocialBannerBlockProps) {
	const { heading, text, buttonLabel, url, platform, backgroundImage } = props;
	if (!url) return null;

	return (
		<section className={styles.container} data-platform={platform ?? "other"} data-stack>
			{backgroundImage && typeof backgroundImage === "object" ? (
				<Media
					className={styles.backdrop}
					pictureClassName={styles.fillPicture}
					imgClassName={styles.backdropImage}
					resource={backgroundImage}
					fill
					size="100vw"
				/>
			) : null}
			<Container size="lg">
				<Stack align="center" gap="sm">
					<Title order={2} ta="center" className={styles.heading}>
						{heading}
					</Title>
					{text ? (
						<Text ta="center" maw="50ch" className={styles.text}>
							{text}
						</Text>
					) : null}
					<div className={styles.button}>
						<HeroButton label={buttonLabel} url={url} primary />
					</div>
				</Stack>
			</Container>
		</section>
	);
}
