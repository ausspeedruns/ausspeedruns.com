export type Runner = {
	username: string;
};

export type MedleyGame = {
	id: number;
	game: string;
	category: string;
	platform: string;
	estimate: string;
	scheduledTime: string | null;
	runners: string[];
	otherRunners: string[];
	race: boolean;
	coop: boolean;
	donationIncentives: {
		id: number;
		title: string;
	}[];
};

export type Run = {
	id: number;
	type: "run" | "medley" | "segment" | "setupBuffer" | "sleep" | "other";
	/** Games in a medley, in order */
	children?: MedleyGame[];
	segmentType?: { name: string; colour?: string | null; textColour?: string | null } | null;
	runners: string[];
	otherRunners?: string[];
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
