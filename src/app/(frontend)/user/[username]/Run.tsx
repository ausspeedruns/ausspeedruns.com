import { Box, Card, Group, Stack, Text, Title } from "@mantine/core";
import styles from "./Run.module.css";
import { getEventLabel } from "./getEventLabel";
import type { Run as RunData } from "#payload-types.ts";
import { getRunCategoryLabel, getRunDisplayName, getYouTubeEmbedUrl } from "#utilities/runDisplay.ts";

interface RunProps {
	run: RunData;
}

export function Run(props: RunProps) {
	const embedUrl = getYouTubeEmbedUrl(props.run.youtube);

	return (
		<Card className={styles.runCard}>
			<Box className={styles.thumbWrap} p="xs">
				{embedUrl && (
					<iframe
						src={embedUrl}
						title="YouTube video player"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen
						style={{ width: "100%", height: "100%", border: "none" }}
					/>
				)}
			</Box>

			<Stack className={styles.cardBody} gap="md" justify="space-between">
				<Group align="flex-start" justify="space-between" wrap="nowrap">
					<div>
						<Title className={styles.runTitle} order={3} textWrap="balance" mb="xs">
							{getRunDisplayName(props.run)}
						</Title>
						<Text className={styles.runMeta}>{[getRunCategoryLabel(props.run), props.run.platform].filter(Boolean).join(" · ")}</Text>
					</div>
					<div className={styles.timeBlock}>
						<Text className={styles.finalTime}>{props.run.time ?? "??:??:??"}</Text>
					</div>
				</Group>

				<Group className={styles.cardFooter} gap="sm" wrap="nowrap" pt="md">
					<Text className={styles.eventLine}>{getEventLabel(props.run)}</Text>
				</Group>
			</Stack>
		</Card>
	);
}