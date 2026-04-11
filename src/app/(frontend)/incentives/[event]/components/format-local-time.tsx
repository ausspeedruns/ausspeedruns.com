"use client";

import dayjs from "dayjs";

interface Props {
	date: Date;
}

export function FormatLocalTime({ date }: Props) {
	return dayjs(date).format("dddd h:mm A");
}
