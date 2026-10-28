import type { RequiredDataFromCollectionSlug } from "payload";

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

// The helpers type children loosely; the shapes they build are valid Lexical nodes
const richText = (...children: object[]) => buildRichText(...children) as unknown as RichTextValue;

const customLink = (label: string, url: string, appearance: "default" | "outline" = "default") => ({
	link: { type: "custom" as const, label, url, appearance, newTab: /^https?:\/\//.test(url) },
});

/** Bracketed writing prompt, so editors can see what goes where and roughly how much to write. */
const prompt = (text: string) => paragraphNode([textNode(`[${text}]`)]);

/**
 * Draft About Us skeleton. Every paragraph is a writing prompt with a target
 * length; replace them in the admin before publishing.
 */
export function aboutUsPage(): PageData {
	const layout: LayoutBlock[] = [
		{
			blockName: "About: Intro",
			blockType: "content",
			columns: [
				{
					size: "full",
					enableLink: false,
					richText: richText(
						headingNode("About AusSpeedruns", "h1"),
						prompt("~1–2 sentences: who AusSpeedruns is in a nutshell"),
						prompt("~1 short paragraph: what we do and why we do it"),
					),
				},
			],
		},
		{
			blockName: "About: All-time stats",
			blockType: "statsBlock",
			title: "AusSpeedruns so far",
			description: "[~1 sentence: framing for the numbers below]",
			showRaised: true,
			showEvents: true,
			showRuns: true,
			extraStats: [{ label: "Charities supported", value: "[#]" }],
		},
		{
			blockName: "About: Our story",
			blockType: "content",
			columns: [
				{
					size: "twoThirds",
					enableLink: false,
					richText: richText(
						headingNode("Our story", "h2"),
						prompt("~1 paragraph: how and when AusSpeedruns started, and who started it"),
						prompt("~1 paragraph: how the events and community grew over the years"),
						prompt("~1 paragraph: where AusSpeedruns is today and what's next"),
					),
				},
				{
					size: "oneThird",
					enableLink: false,
					richText: richText(
						headingNode("Milestones", "h3"),
						listNode("bullet", [
							[textNode("[Year]: ", BOLD), textNode("[first event / founding]")],
							[textNode("[Year]: ", BOLD), textNode("[milestone]")],
							[textNode("[Year]: ", BOLD), textNode("[milestone]")],
							[textNode("[Year]: ", BOLD), textNode("[milestone]")],
						]),
					),
				},
			],
		},
		{
			blockName: "About: Charities",
			blockType: "content",
			columns: [
				{
					size: "full",
					enableLink: false,
					richText: richText(
						headingNode("Charities we've supported", "h2"),
						prompt("~1 sentence: why charity is at the heart of our events"),
						listNode("bullet", [
							[textNode("[Charity name]: ", BOLD), textNode("[event(s)], [~1 sentence on the cause]")],
							[textNode("[Charity name]: ", BOLD), textNode("[event(s)], [~1 sentence on the cause]")],
							[textNode("[Charity name]: ", BOLD), textNode("[event(s)], [~1 sentence on the cause]")],
						]),
					),
				},
			],
		},
		{
			blockName: "About: Get involved CTA",
			blockType: "cta",
			richText: richText(
				headingNode("Get involved", "h2"),
				prompt("~1–2 sentences: invite people to run, volunteer or join the community"),
			),
			links: [customLink("Submit a run", "/submit-game"), customLink("Volunteer", "/volunteer", "outline")],
		},
		{
			blockName: "About: Partner with us / Contact CTA",
			blockType: "cta",
			richText: richText(
				headingNode("Partner with us", "h2"),
				prompt("~1–2 sentences: the reach we offer sponsors and partners, and who to talk to"),
				paragraphNode([
					textNode("Contact: ", BOLD),
					linkNode("[contact email]", "mailto:[contact email]"),
				]),
			),
			links: [customLink("Get in touch", "mailto:[contact email]")],
		},
		{
			blockName: "About: Twitch banner",
			blockType: "socialBannerBlock",
			heading: "Watch live on Twitch",
			text: "Follow AusSpeedruns on Twitch so you don't miss our next marathon.",
			buttonLabel: "Follow on Twitch",
			url: "https://www.twitch.tv/ausspeedruns",
			platform: "twitch",
		},
	];

	return {
		slug: "about-us",
		_status: "draft",
		title: "About Us",
		meta: {
			title: "About Us | AusSpeedruns",
			description: "[~1–2 sentences, under 160 characters: who AusSpeedruns is, for search results]",
		},
		layout,
	};
}
