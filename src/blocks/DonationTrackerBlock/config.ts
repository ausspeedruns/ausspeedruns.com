import type { Block } from "payload";

export const DonationTrackerBlockConfig: Block = {
	slug: "donationTrackerBlock",
	interfaceName: "DonationTrackerBlock",
	fields: [
		{ name: "event", type: "relationship", relationTo: "events", required: true, label: "Event" },
		{ name: "title", type: "text", label: "Title", defaultValue: "Donations & Incentives" }
	]
};
