export type Submission = {
	id: string;
	game: string;
	category: string;
	platform: string;
	techPlatform: string;
	estimate: string;
	possibleEstimate: string;
	possibleEstimateReason: string;
	status: "submitted" | "accepted" | "backup" | "rejected";
	newDonationIncentives?: {
		title: string;
		time?: string;
		description?: string;
	}[];
	race?: string;
	racer?: string;
	coop?: boolean;
	video: string;
	ageRating?: string;
	event: {
		id: string;
		name: string;
		shortname: string;
		acceptingSubmissions: boolean;
		acceptingBackups: boolean;
		startDate: string;
		endDate: string;
		eventTimezone: string;
	};
	runner: {
		username: string;
	};
	willingBackup: boolean;
	specialReqs: string;
	availability: boolean[];
};
