"use client";

import { format } from "date-fns";

interface Props {
	date: string;
}

export function FormatLocalTime({ date }: Props) {
	return (
		// The server renders in its own timezone, so the client re-renders in the viewer's local time
		<time dateTime={date} suppressHydrationWarning>
			{format(new Date(date), "EEEE h:mm a")}
		</time>
	);
}
