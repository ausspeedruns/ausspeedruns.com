"use client";
import type { Header } from "#/payload-types";
import { type RowLabelProps, useRowLabel } from "@payloadcms/ui";

export function RowLabel(_props: RowLabelProps) {
	const data = useRowLabel<NonNullable<Header["navItems"]>[number]>();

	const label = data?.data?.link?.label
		? `Nav item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ""}: ${data?.data?.link?.label}`
		: "Row";

	return <div>{label}</div>;
}
