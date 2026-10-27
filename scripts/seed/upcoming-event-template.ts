import type { BasePayload, RequiredDataFromCollectionSlug } from "payload";

import type { FAQBlock } from "../../src/payload-types.ts";
import {
	BOLD,
	headingNode,
	linkNode,
	listNode,
	paragraphNode,
	richText as buildRichText,
	textNode,
} from "./richTextHelpers.ts";

type PageData = RequiredDataFromCollectionSlug<"pages">;
type LayoutBlock = PageData["layout"][number];

type RichTextValue = NonNullable<FAQBlock["faqs"]>[number]["answer"];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// The helpers type children loosely; the shapes they build are valid Lexical nodes
const richText = (...children: object[]) => buildRichText(...children) as unknown as RichTextValue;

const customLink = (label: string, url: string, appearance: "default" | "outline" = "default") => ({
	link: { type: "custom" as const, label, url, appearance, newTab: /^https?:\/\//.test(url) },
});

const faq = (question: string, ...answer: object[]) => ({ question, answer: richText(...answer) });

/**
 * Draft page holding the standard pre-event layout. Editors duplicate it in the
 * admin when setting up a new event page (e.g. /ASO2027) and swap the event.
 * Uses the next upcoming event, falling back to the most recent one. Returns
 * null when there are no events, since most event blocks require one.
 */
export async function upcomingEventTemplatePage(
	payload: BasePayload,
	now: Date = new Date(),
): Promise<PageData | null> {
	const nowIso = now.toISOString();

	const upcoming = (
		await payload.find({
			collection: "events",
			depth: 0,
			limit: 1,
			sort: "timeSettings.startTime",
			where: { "timeSettings.startTime": { greater_than_equal: nowIso } },
		})
	).docs[0];

	const event =
		upcoming ??
		(await payload.find({ collection: "events", depth: 0, limit: 1, sort: "-timeSettings.startTime" })).docs[0];

	if (!event) {
		payload.logger.warn("Skipping upcoming event template page: no events exist.");
		return null;
	}

	const eventProductIds = (event.products ?? []).map((product) =>
		typeof product === "object" ? product.id : product,
	);
	const ticketProductIds =
		eventProductIds.length > 0
			? eventProductIds
			: (await payload.find({ collection: "products", depth: 0, limit: 3 })).docs.map((product) => product.id);

	const startTime = event.timeSettings?.startTime ?? new Date(now.getTime() + 30 * MS_PER_DAY).toISOString();
	const scheduleUrl = event.shortName ? `/schedule/${event.shortName}` : "/events";

	const layout: LayoutBlock[] = [
		{
			blockName: "Pre-event: Hero",
			blockType: "eventHeroBlock",
			event: event.id,
			subheading: "Australia's speedrunning charity marathon",
			showDates: true,
			showRecapStats: false,
			links: [
				{ label: "Schedule", url: scheduleUrl },
				{ label: "Submit a run", url: "/submit-game" },
				{ label: "Volunteer", url: "/volunteer" },
			],
		},
		{
			blockName: "Pre-event: Countdown",
			blockType: "countdownBlock",
			title: "Event Starts In",
			targetDate: startTime,
			finishedMessage: "The event has started!",
		},
		{
			blockName: "Pre-event: About & Where/When",
			blockType: "content",
			columns: [
				{
					size: "half",
					enableLink: false,
					richText: richText(
						headingNode("About the event", "h2"),
						paragraphNode([
							textNode(
								"Runners from across Australia come together to play their favourite games as fast as possible, live on Twitch, raising money for charity.",
							),
						]),
						paragraphNode([
							textNode("Replace this with a description of the event and the charity it supports."),
						]),
					),
				},
				{
					size: "half",
					enableLink: false,
					richText: richText(
						headingNode("Where & when", "h2"),
						listNode("bullet", [
							[textNode("Venue: ", BOLD), textNode("Venue name, City")],
							[textNode("Dates: ", BOLD), textNode("Event dates")],
							[
								textNode("Stream: ", BOLD),
								linkNode("twitch.tv/ausspeedruns", "https://www.twitch.tv/ausspeedruns", true),
							],
						]),
					),
				},
			],
		},
		{
			blockName: "Pre-event: Submissions & Volunteers CTA",
			blockType: "cta",
			richText: richText(
				headingNode("Want to be part of it?", "h2"),
				paragraphNode([
					textNode(
						"Submit a run to show off your skills on stream, or volunteer to help make the event happen.",
					),
				]),
			),
			links: [customLink("Submit a run", "/submit-game"), customLink("Volunteer", "/volunteer", "outline")],
		},
		...(ticketProductIds.length > 0
			? [
					{
						blockName: "Pre-event: Tickets",
						blockType: "productBlock" as const,
						title: "Tickets",
						products: ticketProductIds,
						showDescription: true,
						showVariants: true,
						ctaLabel: "Buy tickets",
					},
				]
			: []),
		{
			blockName: "Pre-event: FAQ",
			blockType: "faqBlock",
			title: "Frequently Asked Questions",
			faqs: [
				faq(
					"Can I attend in person?",
					paragraphNode([
						textNode("Yes! Grab a ticket above and come along to watch the runs live at the venue."),
					]),
				),
				faq(
					"Can I watch online?",
					paragraphNode([
						textNode("Every run is streamed live on "),
						linkNode("Twitch", "https://www.twitch.tv/ausspeedruns", true),
						textNode(" and uploaded to "),
						linkNode("YouTube", "https://www.youtube.com/@AusSpeedruns", true),
						textNode(" afterwards."),
					]),
				),
				faq(
					"How do I donate?",
					paragraphNode([
						textNode("Donations open when the event starts. Every dollar goes to the event's charity."),
					]),
				),
				faq(
					"How do I submit a run?",
					paragraphNode([
						textNode("Head to the "),
						linkNode("submission form", "/submit-game"),
						textNode(" while submissions are open."),
					]),
				),
				faq(
					"How can I help out?",
					paragraphNode([
						textNode("We're always looking for volunteers. Apply on the "),
						linkNode("volunteer page", "/volunteer"),
						textNode("."),
					]),
				),
			],
		},
		{
			blockName: "Pre-event: Sponsors",
			blockType: "sponsorGridBlock",
			title: "Our Sponsors",
			sponsors: [],
		},
		{
			blockName: "Pre-event: Twitch Banner",
			blockType: "socialBannerBlock",
			heading: "Watch live on Twitch",
			text: "Follow AusSpeedruns on Twitch so you don't miss a run.",
			buttonLabel: "Follow on Twitch",
			url: "https://www.twitch.tv/ausspeedruns",
			platform: "twitch",
		},
	];

	return {
		slug: "upcoming-event-template",
		_status: "draft",
		title: "Upcoming Event Template",
		meta: {
			title: "Upcoming Event Template",
			description: "Template layout for upcoming event pages. Duplicate this page and change the event.",
		},
		layout,
	};
}
