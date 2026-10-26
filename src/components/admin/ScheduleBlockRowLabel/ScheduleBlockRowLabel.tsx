"use client";

import { useRowLabel } from "@payloadcms/ui";

import { readableTextColour } from "#/utilities/schedule/blocks.ts";

type BlockRow = { name?: string | null; colour?: string | null; textColour?: string | null; endRun?: unknown };

export const ScheduleBlockRowLabel = () => {
	const { data, rowNumber } = useRowLabel<BlockRow>();
	const name = data?.name || `Block ${(rowNumber ?? 0) + 1}`;

	return (
		<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
			<span
				style={{
					background: data?.colour || "var(--theme-elevation-150)",
					color: data?.textColour || readableTextColour(data?.colour),
					borderRadius: 4,
					padding: "1px 8px",
					fontWeight: 600,
				}}
			>
				{name}
			</span>
			{!data?.endRun && <span style={{ opacity: 0.6, fontSize: "0.85em" }}>single run</span>}
		</span>
	);
};
