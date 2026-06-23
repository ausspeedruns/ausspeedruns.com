import { BOLD, headingNode, linkNode, listNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock } from "./types";

export function buildKitchenSinkFaqSection(): KitchenSinkLayoutBlock {
	return {
		blockName: "FAQ Block",
		blockType: "faqBlock",
		title: "Frequently Asked Questions",
		faqs: [
			{
				question: "What is a speedrun?",
				answer: richText(
					paragraphNode([
						textNode("A speedrun is playing a video game with the goal of completing it as "),
						textNode("fast as possible", BOLD),
						textNode(
							". Speedrunners use various techniques, glitches, and optimised routes to achieve the lowest possible time.",
						),
					]),
				),
			},
			{
				question: "How can I get involved with AusSpeedruns?",
				answer: richText(
					paragraphNode([textNode("There are many ways to participate:")]),
					listNode("bullet", [
						"Submit a run for an upcoming event",
						"Volunteer to help during a marathon",
						"Donate to charity during a live event",
						"Join our Discord community",
					]),
				),
			},
			{
				question: "When is the next event?",
				answer: richText(
					paragraphNode([
						textNode("Check the "),
						linkNode("events page", "/events"),
						textNode(
							" for upcoming event dates and details. We typically run several events per year, including our flagship marathon.",
						),
					]),
				),
			},
			{
				question: "Are events in-person or online?",
				answer: richText(
					paragraphNode([
						textNode("We run both! Our major marathons are usually "),
						textNode("in-person", BOLD),
						textNode(
							" events held in Australian cities, while smaller events and community showcases may be ",
						),
						textNode("online", BOLD),
						textNode(". All events are streamed live on "),
						linkNode("Twitch", "https://twitch.tv/ausspeedruns", true),
						textNode("."),
					]),
				),
			},
			{
				question: "Where does the donation money go?",
				answer: richText(
					paragraphNode([
						textNode(
							"100% of donations go directly to our charity partner. AusSpeedruns covers operational costs through sponsorships and merchandise sales.",
						),
					]),
				),
			},
		],
	};
}