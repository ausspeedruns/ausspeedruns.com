import type { KitchenSinkLayoutBlock } from "./types";

export function buildKitchenSinkCountdownSection(): KitchenSinkLayoutBlock {
	return {
		blockName: "Countdown Block",
		blockType: "countdownBlock",
		title: "Next Event Starts In",
		targetDate: "2026-07-01T10:00:00.000Z",
		finishedMessage: "The event is LIVE! Head to the stream!",
	};
}
