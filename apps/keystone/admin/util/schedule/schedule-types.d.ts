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
	internalDonationIncentive: string;
	race: string;
	internalRacer: string;
	internalRunner: string;
	scheduled: Date;
	uuid: string;
}

