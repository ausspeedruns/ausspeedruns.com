import type { Page } from "#/payload-types";

type LayoutBlock = Page["layout"][number];

const text = (value: string, format = 0) => ({
	type: "text",
	detail: 0,
	format,
	mode: "normal",
	style: "",
	text: value,
	version: 1,
});

const richText = (heading: string, body: string) => ({
	root: {
		type: "root",
		children: [
			{
				type: "heading",
				tag: "h2",
				children: [text(heading)],
				direction: "ltr" as const,
				format: "" as const,
				indent: 0,
				version: 1,
			},
			{
				type: "paragraph",
				children: [text(body)],
				direction: "ltr" as const,
				format: "" as const,
				indent: 0,
				textFormat: 0,
				version: 1,
			},
		],
		direction: "ltr" as const,
		format: "" as const,
		indent: 0,
		version: 1,
	},
});

const customLink = (label: string, url: string, appearance: "default" | "outline" = "default") => ({
	link: { type: "custom" as const, label, url, appearance, newTab: /^https?:\/\//.test(url) },
});

/**
 * Default homepage layout (minus event features, which need real event IDs).
 * Editors are expected to add Event Feature blocks above these in the admin.
 */
export function buildHomeLayout(): LayoutBlock[] {
	return [
		{
			blockType: "cta",
			richText: richText(
				"What is AusSpeedruns?",
				"AusSpeedruns is a community of Australian speedrunners who run charity marathons throughout the year, showcasing the best runs from across the country while raising money for great causes.",
			),
			links: [customLink("About us", "/about-us"), customLink("Our events", "/events", "outline")],
		},
		{
			blockType: "statsBlock",
			title: "AusSpeedruns so far",
			showRaised: true,
			showEvents: true,
			showRuns: true,
		},
		{
			blockType: "cta",
			richText: richText(
				"Partner with us",
				"Our marathons reach thousands of viewers live on Twitch and on YouTube afterwards. Get in touch to find out how your brand can support AusSpeedruns and our charities.",
			),
			links: [customLink("Get in touch", "/about-us")],
		},
		{
			blockType: "socialBannerBlock",
			heading: "Missed a run?",
			text: "Every run from every event is uploaded to our YouTube channel.",
			buttonLabel: "Watch on YouTube",
			url: "https://www.youtube.com/@AusSpeedruns",
			platform: "youtube",
		},
	];
}

export const homeMeta = {
	title: "AusSpeedruns",
	description:
		"AusSpeedruns runs Australian speedrunning charity marathons. Find our next event, catch up on past events and watch every run on YouTube.",
};
