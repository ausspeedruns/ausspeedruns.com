"use client";

import { format } from "date-fns";

interface Props {
	date: Date;
}

export function FormatLocalTime({ date }: Props) {
	return <>{format(date, "EEEE h:mm a")}</>;
}