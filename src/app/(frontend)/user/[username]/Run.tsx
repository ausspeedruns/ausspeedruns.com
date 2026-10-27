import { AspectRatio, Box, Card, Divider, Group, Stack, Text, Title } from "@mantine/core";
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
		<Card padding="sm" withBorder>
			<AspectRatio ratio={16 / 9} mb="md">
				{embedUrl && (
					<iframe
						className={styles.video}
						src={embedUrl}
						title="YouTube video player"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen
					/>
				)}
			</AspectRatio>

			<Stack gap="md" justify="space-between" flex={1}>
				<Group align="flex-start" justify="space-between" wrap="nowrap">
					<Box miw={0}>
						<Title order={3} textWrap="balance" mb="xs">
							{getRunDisplayName(props.run)}
						</Title>
						<Text c="dimmed">{[getRunCategoryLabel(props.run), props.run.platform].filter(Boolean).join(" · ")}</Text>
					</Box>
					<Text c="ausSpeedrunsOrange" ta="right" flex="none">
						{props.run.time ?? "??:??:??"}
					</Text>
				</Group>

				<div>
					<Divider mb="md" />
					<Text c="dimmed" truncate>
						{getEventLabel(props.run)}
					</Text>
				</div>
			</Stack>
		</Card>
	);
}
