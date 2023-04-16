export type Run = {
	youtubeVOD?: string | undefined;
	twitchVOD?: string | undefined;
	finalTime?: string | undefined;
	runnerId: string;
	runner: ({
		id?: string;
		username: string;
	})[];
	submissionId: string;
	game: string;
	category: string;
	platform: string;
	estimate: string;
	internalDonationIncentives: DonationIncentive[];
	race: string;
	internalRacer: string;
	internalRunner: string;
	scheduled: Date;
	uuid: string;
	techPlatform: string;
	specialReqs: string;
}

type DonationIncentive = {
	title: string;
	time?: string;
	description?: string;
};
