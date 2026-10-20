export type Runner = {
	username: string;
};

export type Run = {
	id: number;
	type: "run" | "setupBuffer" | "sleep" | "other";
	runners: string[];
	game: string;
	category: string;
	platform: string;
	estimate: string;
	scheduledTime: string;
	donationIncentives: {
		id: number;
		title: string;
		data?: unknown;
	}[];
	race: boolean;
	coop: boolean;
	displayIndex: number;
};

export type Block = NonNullable<Event["scheduleMetadata"]>["scheduleBlocks"][number];

export type Settings = {
	showLocalTime: boolean;
	filter: {
		race: boolean;
		coop: boolean;
		donationIncentive: boolean;
		search: string;
		console: string[];
	};
	liveRunId: number;
};
