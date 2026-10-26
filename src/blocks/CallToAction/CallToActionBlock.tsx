import type { CallToActionBlock as CTABlockProps } from "#/payload-types";
import { Box, Container, Flex, Paper, Stack } from "@mantine/core";

import RichText from "#/components/RichText/RichText";
import { CMSLink } from "#/components/Link/CMSLink";

import styles from "./CallToActionBlock.module.css";

export function CallToActionBlock({ links, richText }: CTABlockProps) {
	return (
		<Container component="section" size="lg">
			<Paper withBorder p="md">
				<Flex
					direction={{ base: "column", sm: "row" }}
					justify="space-between"
					align={{ base: "stretch", sm: "center" }}
					gap="xl"
				>
					<Box maw="48rem">
						{richText && <RichText className={styles.richText} data={richText} enableGutter={false} />}
					</Box>
					<Stack gap="xl">
						{(links || []).map(({ link }, i) => {
							return <CMSLink key={i} size="lg" {...link} />;
						})}
					</Stack>
				</Flex>
			</Paper>
		</Container>
	);
}
