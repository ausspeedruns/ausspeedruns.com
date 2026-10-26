import type { BasePayload, RequiredDataFromCollectionSlug } from "payload";

import { buildKitchenSinkArchiveSections } from "./kitchen-sink-sections/archive.ts";
import { buildKitchenSinkCarouselSections } from "./kitchen-sink-sections/carousel.ts";
import {
	buildContentBackgroundImageExamples,
	buildContentLayoutExamples,
	buildContentMediaExamples,
	buildContentRichTextExamples,
	buildContentStylingExamples,
} from "./kitchen-sink-sections/content.ts";
import { buildKitchenSinkCountdownSections } from "./kitchen-sink-sections/countdown.ts";
import { buildKitchenSinkCtaSections } from "./kitchen-sink-sections/cta.ts";
import { buildKitchenSinkDonationTrackerSections } from "./kitchen-sink-sections/donationTracker.ts";
import { buildKitchenSinkEventFeatureSections } from "./kitchen-sink-sections/eventFeature.ts";
import { buildKitchenSinkEventHeroSections } from "./kitchen-sink-sections/eventHero.ts";
import { buildKitchenSinkEventImagesSections } from "./kitchen-sink-sections/eventImages.ts";
import { buildKitchenSinkEventLiveSections } from "./kitchen-sink-sections/eventLive.ts";
import { buildKitchenSinkFaqSections } from "./kitchen-sink-sections/faq.ts";
import { buildKitchenSinkFormSections } from "./kitchen-sink-sections/form.ts";
import {
	type BuiltGroup,
	type KitchenSinkGroup,
	buildExampleLabel,
	buildPageIntro,
	buildSectionHeader,
	stripExampleMeta,
} from "./kitchen-sink-sections/labels.ts";
import { buildKitchenSinkMediaSections } from "./kitchen-sink-sections/media.ts";
import { buildKitchenSinkPostEventStatsSections } from "./kitchen-sink-sections/postEventStats.ts";
import { buildKitchenSinkProductSections } from "./kitchen-sink-sections/product.ts";
import { buildKitchenSinkRandomRunSections } from "./kitchen-sink-sections/randomRun.ts";
import { buildKitchenSinkSocialBannerSections } from "./kitchen-sink-sections/socialBanner.ts";
import { buildKitchenSinkSponsorGridSections } from "./kitchen-sink-sections/sponsorGrid.ts";
import { buildKitchenSinkStatsSections } from "./kitchen-sink-sections/stats.ts";
import { buildKitchenSinkSummarySection } from "./kitchen-sink-sections/summary.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./kitchen-sink-sections/types.ts";
import { buildKitchenSinkVodHighlightsSections } from "./kitchen-sink-sections/vodHighlights.ts";

const GROUPS: KitchenSinkGroup[] = [
	{
		name: "Content: Column Layouts",
		blockType: "content",
		description:
			"The Content block lays out rich text in columns that are full, half, one-third or two-thirds width. Columns wrap onto a new row when they don't fit. Before building a custom block, check whether a Content block can already do the job.",
		build: buildContentLayoutExamples,
	},
	{
		name: "Content: Rich Text",
		blockType: "content",
		description: "Everything the rich text editor inside a Content column can do.",
		build: buildContentRichTextExamples,
	},
	{
		name: "Content: Backgrounds & Spacing",
		blockType: "content",
		description:
			"The Block Styling settings: background colour, text colour, vertical padding and full-bleed (edge-to-edge) backgrounds.",
		build: buildContentStylingExamples,
	},
	{
		name: "Content: Background Images",
		blockType: "content",
		description:
			"A background image behind the content, with an optional dark or light overlay to keep the text readable.",
		build: buildContentBackgroundImageExamples,
	},
	{
		name: "Content: Images in Content",
		blockType: "content",
		description:
			"Images placed inside rich text with the Media Block and Upload tools, combined with columns to build image-and-text layouts and galleries.",
		build: buildContentMediaExamples,
	},
	{
		name: "Call to Action",
		blockType: "cta",
		description: "Rich text paired with up to two buttons, each in Default or Outline style.",
		build: buildKitchenSinkCtaSections,
	},
	{
		name: "Media Block",
		blockType: "mediaBlock",
		description: "A single uploaded image shown at the full content width.",
		build: buildKitchenSinkMediaSections,
	},
	{
		name: "Archive",
		blockType: "archive",
		description:
			"A grid of post cards: either the latest posts from the collection (optionally filtered by category) or posts picked by hand.",
		build: buildKitchenSinkArchiveSections,
	},
	{
		name: "Image Carousel",
		blockType: "imageCarousel",
		description: "A rotating gallery of uploaded images, with optional intro text above it.",
		build: buildKitchenSinkCarouselSections,
	},
	{
		name: "Event Images",
		blockType: "eventImagesBlock",
		description:
			"An event photo gallery that can mix uploaded images with images from external URLs, plus a button linking to the full album.",
		build: buildKitchenSinkEventImagesSections,
	},
	{
		name: "Event Hero",
		blockType: "eventHeroBlock",
		description:
			"A large banner for an event, using its logo, artwork and dates, with optional heading overrides, buttons and recap stats.",
		build: buildKitchenSinkEventHeroSections,
	},
	{
		name: "Event Feature",
		blockType: "eventFeatureBlock",
		description:
			"A compact event card, as used on the homepage, with an optional countdown, amount raised and extra buttons.",
		build: buildKitchenSinkEventFeatureSections,
	},
	{
		name: "Event Live",
		blockType: "eventLiveBlock",
		description:
			"The live event view: Twitch stream and chat, current run, upcoming schedule, incentives and sponsors.",
		build: buildKitchenSinkEventLiveSections,
	},
	{
		name: "Donation Tracker",
		blockType: "donationTrackerBlock",
		description: "An event's donation total and incentive progress, either live or as a post-event recap.",
		build: buildKitchenSinkDonationTrackerSections,
	},
	{
		name: "Post-Event Stats",
		blockType: "postEventStatsBlock",
		description:
			"A recap of an event's runs: stat cards and a full run list, calculated from the event or entered by hand.",
		build: buildKitchenSinkPostEventStatsSections,
	},
	{
		name: "VOD Highlights",
		blockType: "vodHighlightsBlock",
		description: "A grid of YouTube VODs from an event's runs.",
		build: buildKitchenSinkVodHighlightsSections,
	},
	{
		name: "Random Run",
		blockType: "randomRunBlock",
		description: "Embeds one random YouTube VOD from an event.",
		build: buildKitchenSinkRandomRunSections,
	},
	{
		name: "All-time Stats",
		blockType: "statsBlock",
		description: "Totals across every AusSpeedruns event, plus any stats entered by hand.",
		build: buildKitchenSinkStatsSections,
	},
	{
		name: "Social Banner",
		blockType: "socialBannerBlock",
		description: "A call-out banner linking to a social channel, with an accent colour set by the platform.",
		build: buildKitchenSinkSocialBannerSections,
	},
	{
		name: "Sponsor Grid",
		blockType: "sponsorGridBlock",
		description: "A grid of sponsor logos with optional links.",
		build: buildKitchenSinkSponsorGridSections,
	},
	{
		name: "Product",
		blockType: "productBlock",
		description: "Merch from the Products collection, with a Stripe purchase button.",
		build: buildKitchenSinkProductSections,
	},
	{
		name: "Countdown",
		blockType: "countdownBlock",
		description: "A live timer counting down to a date, which shows a message once the date has passed.",
		build: buildKitchenSinkCountdownSections,
	},
	{
		name: "FAQ",
		blockType: "faqBlock",
		description: "Expandable questions with rich text answers.",
		build: buildKitchenSinkFaqSections,
	},
	{
		name: "Form",
		blockType: "formBlock",
		description: "Embeds a form from the Forms collection, with optional intro content.",
		build: buildKitchenSinkFormSections,
	},
	{
		name: "Closing Section",
		blockType: "content",
		description: "A Content block that rounds off a page.",
		build: () => [buildKitchenSinkSummarySection()],
	},
];

/**
 * Kitchen Sink Page
 *
 * Demonstrates every page layout block in as many configurations as
 * possible. The page opens with an introduction listing every section; each
 * section starts with a header describing the block, and each example has a
 * label explaining what it demonstrates. Only the examples' own content is
 * lorem ipsum.
 *
 * Blocks that need related data (events, products, forms) fall back to a
 * placeholder explaining what's missing.
 */
export async function kitchenSinkPage(
	payload: BasePayload,
	now: Date = new Date(),
): Promise<RequiredDataFromCollectionSlug<"pages">> {
	const { context, metaImage } = await buildContext(payload, now);

	const groups: BuiltGroup[] = GROUPS.map((group) => ({ group, examples: group.build(context) })).filter(
		({ examples }) => examples.length > 0,
	);

	const layout = [
		buildPageIntro(groups),
		...groups.flatMap((built, groupIndex) => [
			buildSectionHeader(built, groupIndex + 1),
			...built.examples.flatMap((example, exampleIndex) => {
				const label = buildExampleLabel(example, groupIndex + 1, exampleIndex + 1);
				return label ? [label, stripExampleMeta(example)] : [stripExampleMeta(example)];
			}),
		]),
	] satisfies KitchenSinkLayoutBlock[] as RequiredDataFromCollectionSlug<"pages">["layout"];

	return {
		slug: "kitchen-sink",
		_status: "published",
		title: "Kitchen Sink",
		meta: {
			description:
				"A demonstration of every block type and configuration available in the AusSpeedruns page builder.",
			image: metaImage,
			title: "Kitchen Sink — Every Block & Configuration",
		},
		layout,
	};
}

async function buildContext(
	payload: BasePayload,
	now: Date,
): Promise<{ context: KitchenSinkSectionContext; metaImage?: number }> {
	const nowIso = now.toISOString();

	const mediaItems = (await payload.find({ collection: "media", depth: 0, limit: 12, sort: "-createdAt" })).docs;
	const img = (index: number) => (mediaItems.length === 0 ? undefined : mediaItems[index % mediaItems.length]?.id);

	const anyEvent = (await payload.find({ collection: "events", depth: 0, limit: 1 })).docs[0];

	const upcomingEvent = (
		await payload.find({
			collection: "events",
			depth: 0,
			limit: 1,
			sort: "timeSettings.startTime",
			where: { "timeSettings.startTime": { greater_than_equal: nowIso } },
		})
	).docs[0];

	const recentPastEvents = (
		await payload.find({
			collection: "events",
			depth: 0,
			limit: 10,
			sort: "-timeSettings.startTime",
			where: { "timeSettings.startTime": { less_than: nowIso } },
		})
	).docs;
	// Prefer a past event with a raised total so recap/results blocks have something to show
	const pastEvent = recentPastEvents.find((event) => event.postEvent?.raised) ?? recentPastEvents[0];

	const pastEventId = pastEvent?.id ?? anyEvent?.id;

	const vodRuns = pastEventId
		? (
				await payload.find({
					collection: "runs",
					depth: 0,
					limit: 12,
					sort: "scheduledTime",
					where: { and: [{ event: { equals: pastEventId } }, { youtube: { exists: true } }] },
				})
			).docs.filter((run) => Boolean(run.youtube))
		: [];

	const products = (await payload.find({ collection: "products", depth: 0, limit: 6 })).docs;
	const categories = (await payload.find({ collection: "categories", depth: 0, limit: 3 })).docs;
	const forms = (await payload.find({ collection: "forms", depth: 0, limit: 1 })).docs;
	const posts = (await payload.find({ collection: "posts", depth: 0, limit: 6, sort: "-publishedAt" })).docs;

	return {
		metaImage: mediaItems[0]?.id,
		context: {
			now,
			mediaItems,
			img,
			upcomingEventId: upcomingEvent?.id ?? anyEvent?.id,
			pastEventId,
			vodRunIds: vodRuns.map((run) => run.id),
			productIds: products.map((product) => product.id),
			categoryIds: categories.map((category) => category.id),
			formId: forms[0]?.id,
			posts,
		},
	};
}
