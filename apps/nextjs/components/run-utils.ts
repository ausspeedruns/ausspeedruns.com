interface Run {
	id: string;
	runners: {
		username: string;
	}[];
	game: string;
	category: string;
	platform: string;
	finalTime?: string;
	donationIncentiveObject?: {
		title: string;
	}[];
	race?: boolean;
	coop?: boolean;
	racer: string;
};

interface Filters {
	race: boolean;
	coop: boolean;
	donationIncentive: boolean;
	search: string;
	console: string[];
};

function isStringInRunData<Type extends Run>(run: Type, searchString: string) {
	const lowerCaseSearchString = searchString.toLowerCase();
	return (
		run.category.toLowerCase().includes(lowerCaseSearchString) ||
		run.game.toLowerCase().includes(lowerCaseSearchString) ||
		run.runners.find((runner) => runner.username.toLowerCase().includes(lowerCaseSearchString)) !== undefined ||
		run.donationIncentiveObject?.find((incentive) => incentive.title.toLowerCase().includes(lowerCaseSearchString)) !== undefined ||
		run.finalTime?.toLowerCase().includes(lowerCaseSearchString) ||
		run.racer.toLowerCase().includes(lowerCaseSearchString)
	);
}

export function FilterRuns<Type extends Run>(runs: Array<Type>, filters: Filters) {
	// Jesus ChatGPT this is based
	return runs.filter((run) => {
		if (filters.race && !run.race) return false;
		if (filters.coop && !run.coop) return false;
		if (filters.donationIncentive && run.donationIncentiveObject.length === 0) return false;
		if (filters.search && !isStringInRunData(run, filters.search)) return false;
		if (filters.console.length > 0 && !filters.console.includes(run.platform.toLowerCase())) return false;
		return true;
	});
}