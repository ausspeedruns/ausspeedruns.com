export interface CountdownParts {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

export function getCountdownParts(distanceMs: number): CountdownParts {
	const totalSeconds = Math.max(0, Math.floor(distanceMs / 1000));
	return {
		days: Math.floor(totalSeconds / 86_400),
		hours: Math.floor((totalSeconds % 86_400) / 3_600),
		minutes: Math.floor((totalSeconds % 3_600) / 60),
		seconds: totalSeconds % 60,
	};
}
