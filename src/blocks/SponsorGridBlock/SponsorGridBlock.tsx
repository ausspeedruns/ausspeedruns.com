import React from "react";
import type { SponsorGridBlock as SponsorGridBlockProps, Media } from "#/payload-types";
import Image from "next/image";
import { Container, Group, Paper, Stack, Text, Title } from "@mantine/core";
import styles from "./SponsorGridBlock.module.css";

export function SponsorGridBlock(props: SponsorGridBlockProps) {
	const { title, sponsors } = props;

	if (!sponsors || sponsors.length === 0) return null;

	return (
		<Container component="section" size="lg">
			<Stack gap="lg">
				{title && (
					<Title order={2} ta="center">
						{title}
					</Title>
				)}
				<Group justify="center" gap="md">
					{sponsors.map((sponsor, i) => {
						const logo = typeof sponsor.logo === "object" ? (sponsor.logo as Media) : null;
						const content = logo?.url ? (
							<Image
								src={logo.url}
								alt={sponsor.name || "Sponsor logo"}
								width={logo.width || 320}
								height={logo.height || 160}
								className={styles.sponsorImage}
							/>
						) : (
							<Text fw={700} ta="center">
								{sponsor.name}
							</Text>
						);

						return sponsor.link ? (
							<Paper
								key={sponsor.id || i}
								component="a"
								href={sponsor.link}
								target="_blank"
								rel="noopener noreferrer"
								withBorder
								p="lg"
								className={styles.sponsorTile}
								data-link
								title={sponsor.name}
							>
								{content}
							</Paper>
						) : (
							<Paper
								key={sponsor.id || i}
								withBorder
								p="lg"
								className={styles.sponsorTile}
								title={sponsor.name}
							>
								{content}
							</Paper>
						);
					})}
				</Group>
			</Stack>
		</Container>
	);
}
