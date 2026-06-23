import type { BasePayload, RequiredDataFromCollectionSlug } from "payload";

import { buildKitchenSinkArchiveSections } from "./kitchen-sink-sections/archive.ts";
import { buildKitchenSinkCarouselSection } from "./kitchen-sink-sections/carousel.ts";
import { buildKitchenSinkContentSections } from "./kitchen-sink-sections/content.ts";
import { buildKitchenSinkCountdownSection } from "./kitchen-sink-sections/countdown.ts";
import { buildKitchenSinkCtaSection } from "./kitchen-sink-sections/cta.ts";
import { buildKitchenSinkDonationTrackerSection } from "./kitchen-sink-sections/donationTracker.ts";
import { buildKitchenSinkEventHeroSection } from "./kitchen-sink-sections/eventHero.ts";
import { buildKitchenSinkFaqSection } from "./kitchen-sink-sections/faq.ts";
import { buildKitchenSinkFormSection } from "./kitchen-sink-sections/form.ts";
import { buildKitchenSinkHero } from "./kitchen-sink-sections/hero.ts";
import { buildKitchenSinkLiveStreamSection } from "./kitchen-sink-sections/liveStream.ts";
import { buildKitchenSinkMediaSection } from "./kitchen-sink-sections/media.ts";
import { buildKitchenSinkSponsorGridSection } from "./kitchen-sink-sections/sponsorGrid.ts";
import { buildKitchenSinkSummarySection } from "./kitchen-sink-sections/summary.ts";
import type { KitchenSinkSectionContext } from "./kitchen-sink-sections/types.ts";

/**
 * Kitchen Sink Page
 *
 * This page demonstrates EVERY block type available in the page builder,
 * in as many configurations as possible. Use this as a reference for what
 * is possible when building pages in the CMS.
 *
 * Hero types: highImpact is used on this page.
 * (mediumImpact and lowImpact work identically but without the full-bleed image.)
 */
export async function kitchenSinkPage(payload: BasePayload): Promise<RequiredDataFromCollectionSlug<"pages">> {
	const mediaItems = (
		await payload.find({
			collection: "media",
			limit: 10,
			sort: "-createdAt",
		})
	).docs;

	const img = (index: number) => {
		if (mediaItems.length === 0) {
			return undefined;
		}

		return mediaItems[index % mediaItems.length]?.id;
	};

	const events = (await payload.find({ collection: "events", limit: 1 })).docs;
	const forms = (await payload.find({ collection: "forms", limit: 1 })).docs;
	const posts = (await payload.find({ collection: "posts", limit: 3 })).docs;

	const context: KitchenSinkSectionContext = {
		mediaItems,
		img,
		eventId: events[0]?.id,
		formId: forms[0]?.id,
		posts,
	};

	const hero = buildKitchenSinkHero(context) as RequiredDataFromCollectionSlug<"pages">["hero"];
	const layout = [
		...buildKitchenSinkContentSections(context),
		buildKitchenSinkCtaSection(),
		...buildKitchenSinkMediaSection(context),
		...buildKitchenSinkArchiveSections(context),
		...buildKitchenSinkCarouselSection(context),
		buildKitchenSinkEventHeroSection(context),
		buildKitchenSinkLiveStreamSection(),
		buildKitchenSinkDonationTrackerSection(context),
		buildKitchenSinkSponsorGridSection(context),
		buildKitchenSinkCountdownSection(),
		buildKitchenSinkFaqSection(),
		buildKitchenSinkFormSection(context),
		buildKitchenSinkSummarySection(),
	] as RequiredDataFromCollectionSlug<"pages">["layout"];

	return {
		slug: "kitchen-sink",
		_status: "published",
		title: "Kitchen Sink",
		meta: {
			description:
				"A comprehensive demonstration of every block type and configuration available in the AusSpeedruns page builder. Use this as a reference for your team.",
			image: img(0),
			title: "Kitchen Sink — Every Block & Configuration",
		},
		hero,
		layout,
	};
}