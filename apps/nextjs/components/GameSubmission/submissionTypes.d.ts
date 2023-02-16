export type DonationIncentive = {
	title: string;
	time?: string;
	description?: string;
}

export type AgeRatingLiterals = "m_or_lower" | "ma15" | "ra18";
export type RaceLiterals = "no" | "solo" | "only";

export type MUTATION_SUBMISSION_RESULTS = {
	createSubmission: {
		game: string;
		category: string;
		estimate: string;
		possibleEstimate?: string;
		platform: string;
		techPlatform: string;
		race: string;
		coop: boolean;
		racer: string;
		newDonationIncentives?: DonationIncentive[];
	};
}

export type Event = {
	id: string;
	shortname: string;
	submissionInstructions: {
		document: any;
	};
	startDate: string;
	endDate: string;
	eventTimezone: string;
	acceptingBackups: boolean;
	acceptingSubmissions: boolean;
}

export type QUERY_USER_RESULTS = {
	user: {
		verified: boolean;
		dateOfBirth: string;
		discord: string;
		submissions?: {
			game: string;
			platform: string;
			techPlatform?: string;
			ageRating: RaceLiterals;
		}[];
	};
	events: Event[];
}
