import React, { Fragment } from "react";

import type { Page } from "#/payload-types";

import { ArchiveBlock } from "#/blocks/ArchiveBlock/ArchiveBlock";
import { CallToActionBlock } from "#/blocks/CallToAction/CallToActionBlock";
import { ContentBlock } from "#/blocks/Content/ContentBlock";
import { FormBlock } from "#/blocks/Form/FormBlock";
import { MediaBlock } from "#/blocks/MediaBlock/MediaBlock";
import { ImageCarouselBlock } from "./ImageCarousel/ImageCarousel";
import { EventImagesBlock } from "./EventImagesBlock/EventImagesBlock";

import { EventHeroBlock } from "./EventHeroBlock/EventHeroBlock";
import { LiveStreamBlock } from "./LiveStreamBlock/LiveStreamBlock";
import { DonationTrackerBlock } from "./DonationTrackerBlock/DonationTrackerBlock";
import { SponsorGridBlock } from "./SponsorGridBlock/SponsorGridBlock";
import { CountdownBlock } from "./CountdownBlock/CountdownBlock";
import { FAQBlock } from "./FAQBlock/FAQBlock";
import { ProductBlock } from "./ProductBlock/ProductBlock";
import { PostEventStatsBlock } from "./PostEventStatsBlock/PostEventStatsBlock";

import styles from "./RenderBlocks.module.css";
import { RandomRunBlock } from "./RandomRunBlock/RandomRunBlock";
import { VodHighlightsBlock } from "./VodHighlightsBlock/VodHighlightsBlock";

const blockComponents = {
	archive: ArchiveBlock,
	content: ContentBlock,
	cta: CallToActionBlock,
	formBlock: FormBlock,
	mediaBlock: MediaBlock,
	imageCarousel: ImageCarouselBlock,
	eventImagesBlock: EventImagesBlock,
	eventHeroBlock: EventHeroBlock,
	liveStreamBlock: LiveStreamBlock,
	donationTrackerBlock: DonationTrackerBlock,
	sponsorGridBlock: SponsorGridBlock,
	countdownBlock: CountdownBlock,
	faqBlock: FAQBlock,
	productBlock: ProductBlock,
	postEventStatsBlock: PostEventStatsBlock,
	randomRunBlock: RandomRunBlock,
	vodHighlightsBlock: VodHighlightsBlock,
};

interface RenderBlocksProps {
	blocks: Page["layout"][number][];
}

export function RenderBlocks(props: RenderBlocksProps) {
	const { blocks } = props;

	const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0;

	if (hasBlocks) {
		return (
			<>
				{blocks.map((block, index) => {
					const { blockType } = block;

					if (blockType && blockType in blockComponents) {
						const Block = blockComponents[blockType];

						if (Block) {
							return (
								<div className={styles.blockWrapper} key={index}>
									<Block {...(block as any)} />
								</div>
							);
						}
					}
					return null;
				})}
			</>
		);
	}

	return null;
}
