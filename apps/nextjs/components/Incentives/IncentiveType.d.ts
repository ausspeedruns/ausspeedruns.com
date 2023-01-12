export interface BaseIncentiveData {
	title: string;
	active: boolean;
	notes: string;
	run: {
		game: string;
		category: string;
		scheduledTime: string;
	};
}
