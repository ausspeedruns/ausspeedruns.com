import type { Block } from "payload";

export const DonationTrackerBlockConfig: Block = {
	slug: "donationTrackerBlock",
	imageURL: "/block-thumbnails/donationTrackerBlock.webp",
	imageAltText: "Donation total and incentive progress",
	interfaceName: "DonationTrackerBlock",
	fields: [
		{ name: "event", type: "relationship", relationTo: "events", required: true, label: "Event" },
		{ name: "title", type: "text", label: "Title", defaultValue: "Donations & Incentives" },
		{
			name: "displayMode",
			type: "select",
			label: "Display mode",
			defaultValue: "live",
			options: [
				{ label: "Live (active incentives)", value: "live" },
				{ label: "Results (post-event recap)", value: "results" },
			],
		},
	],
};
