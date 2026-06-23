import { Box, Card, Group, Stack, Text, Title } from "@mantine/core";
import styles from "./run.module.css";
import { getEventLabel } from "./getEventLabel";
import type { Run as RunData } from "#payload-types.ts";

interface RunProps {
	run: RunData;
}

export function Run(props: RunProps) {
	return (
		<Card className={styles.runCard}>
			<Box className={styles.thumbWrap} p="xs">
				<iframe
					src={`https://www.youtube.com/embed/${props.run.youtube}`}
					title="YouTube video player"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					referrerPolicy="strict-origin-when-cross-origin"
					allowFullScreen
					style={{ width: "100%", height: "100%", border: "none" }}
				/>
			</Box>

			<Stack className={styles.cardBody} gap="md" justify="space-between">
				<Group align="flex-start" justify="space-between" wrap="nowrap">
					<div>
						<Title className={styles.runTitle} order={3} textWrap="balance" mb="xs">
							{props.run.game}
						</Title>
						<Text className={styles.runMeta}>{`${props.run.category} · ${props.run.platform}`}</Text>
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