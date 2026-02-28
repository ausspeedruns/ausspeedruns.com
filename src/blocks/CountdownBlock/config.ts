import type { Block } from "payload";

export const CountdownBlockConfig: Block = {
	slug: "countdownBlock",
	interfaceName: "CountdownBlock",
	fields: [
		{ name: "title", type: "text", label: "Title", defaultValue: "Event Starts In" },
		{ name: "targetDate", type: "date", label: "Target Date", required: true },
		{ name: "finishedMessage", type: "text", label: "Finished Message", defaultValue: "The event has started!" }
	]
};
