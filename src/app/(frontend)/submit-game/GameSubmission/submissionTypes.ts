import type { Submission } from "#payload-types.ts";

export interface GameSubmissionResults {
	event: number;

	// Game info
	game: string;
	platform: string;
	techPlatform: string;
	ageRating: Submission["ageRating"];

	// Run info
	category: string;
	video: string;
	estimate: string;
	possibleEstimate: string | undefined;
	possibleEstimateReason: string | undefined;
	lowerEstimate: string;
	specialRequirements: string;
	donationIncentives: DonationIncentive[] | undefined;

	// Availability
	availability: boolean[];

	// Race/Co-op
	race: Submission["raceType"];
	racer: string;
	coop: boolean;

	// Backup
	backup: boolean;
}

export type DonationIncentive = {
	title: string;
	time?: string;
	description?: string;
};
