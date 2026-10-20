"use client";

import { useEffect, useState } from "react";
import { getCountdownParts, type CountdownParts } from "./countdown";

export interface CountdownState {
	/** Null until mounted on the client, to avoid hydration mismatches. */
	parts: CountdownParts | null;
	finished: boolean;
}

export function useCountdown(targetDate: string | Date | null | undefined): CountdownState {
	const [state, setState] = useState<CountdownState>({ parts: null, finished: false });

	useEffect(() => {
		if (!targetDate) return;
		const target = new Date(targetDate).getTime();
		if (Number.isNaN(target)) return;

		let timer: ReturnType<typeof setInterval> | undefined;
		const tick = () => {
			const distance = target - Date.now();
			if (distance <= 0) {
				setState({ parts: getCountdownParts(0), finished: true });
				if (timer) clearInterval(timer);
				return false;
			}
			setState({ parts: getCountdownParts(distance), finished: false });
			return true;
		};

		if (tick()) timer = setInterval(tick, 1000);
		return () => {
			if (timer) clearInterval(timer);
		};
	}, [targetDate]);

	return state;
}
