"use client";

import { useEffect, useState } from "react";

/**
 * Current time in ms, updated every `intervalMs`.
 * Starts at `initial` so server and client render the same markup, then syncs to the real clock after mounting.
 */
export function useNow(intervalMs: number, initial: number): number {
	const [now, setNow] = useState(initial);

	useEffect(() => {
		setNow(Date.now());
		const timer = setInterval(() => setNow(Date.now()), intervalMs);
		return () => clearInterval(timer);
	}, [intervalMs]);

	return now;
}
