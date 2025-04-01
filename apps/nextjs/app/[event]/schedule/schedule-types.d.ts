export type Runner = {
	username: string;
};

export type Run = {
	id: string;
	runners: Runner[];
	game: string;
	category: string;
	platform: string;
	estimate: string;
	finalTime: string;
	donationIncentiveObject: {
		id: string;
		title: string;
	}[];
	race: boolean;
	racer: string;
	coop: boolean;
	twitchVOD: string;
	youtubeVOD: string;
	scheduledTime: string;
	order?: number;
};

export type Block = {
	name: string;
	colour: string;
	textColour: string;
	startRunId: string;
	endRunId?: string;
};

export type Settings = {
	showLocalTime: boolean;
	filter: {
		race: boolean;
		coop: boolean;
		donationIncentive: boolean;
		search: string;
		console: string[];
	};
	liveRunId: string;
};
