import { format, formatDistanceStrict } from "date-fns";

/** e.g. "1:02:03" or "12:34". */
export function formatDuration(ms: number): string {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const pad = (value: number) => value.toString().padStart(2, "0");
	return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/** e.g. "in 2 hours", "5 minutes ago" or "now". */
export function formatRelative(target: string | number, now: number): string {
	const time = new Date(target).getTime();
	if (Math.abs(time - now) < 60_000) return "now";
	return formatDistanceStrict(time, now, { addSuffix: true, roundingMethod: "floor" });
}

/** Start time in the viewer's timezone, e.g. "Sat 2:30 pm". */
export function formatStartTime(target: string): string {
	return format(new Date(target), "EEE h:mm aaa");
}
