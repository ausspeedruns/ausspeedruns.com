"use client";

import { ActionIcon, CopyButton, Stack, Text, Tooltip } from "@mantine/core";
import { Check, Copy } from "pixelarticons/react";
import { formatCents } from "#utilities/formatCents.ts";

import styles from "./BankTransferDetails.module.css";

export interface BankTransferDetailsProps {
	amountInCents: number;
	reference: string;
	accountName?: string | null;
	bsb?: string | null;
	accountNumber?: string | null;
	instructions?: string | null;
}

function CopyValue({ label, value }: { label: string; value: string }) {
	return (
		<CopyButton value={value} timeout={1500}>
			{({ copied, copy }) => (
				<Tooltip label={copied ? "Copied" : `Copy ${label}`} withArrow position="left">
					<ActionIcon variant="subtle" color="gray" onClick={copy} aria-label={`Copy ${label}`}>
						{copied ? <Check width={16} height={16} /> : <Copy width={16} height={16} />}
					</ActionIcon>
				</Tooltip>
			)}
		</CopyButton>
	);
}

export function BankTransferDetails(props: BankTransferDetailsProps) {
	const rows: { label: string; value?: string | null; copyValue?: string; emphasise?: boolean }[] = [
		{ label: "Amount", value: formatCents(props.amountInCents), copyValue: (props.amountInCents / 100).toFixed(2) },
		{ label: "Account name", value: props.accountName },
		{ label: "BSB", value: props.bsb },
		{ label: "Account number", value: props.accountNumber },
		{ label: "Reference", value: props.reference, emphasise: true },
	];

	return (
		<Stack gap="sm">
			<dl className={styles.list}>
				{rows.map((row) =>
					row.value ? (
						<div key={row.label} className={styles.row} data-emphasise={row.emphasise || undefined}>
							<dt>{row.label}</dt>
							<dd>{row.value}</dd>
							<CopyValue label={row.label.toLowerCase()} value={row.copyValue ?? row.value} />
						</div>
					) : null,
				)}
			</dl>
			<Text size="sm">
				Put <strong>{props.reference}</strong> in the transfer description, otherwise we can&apos;t match the
				payment to your order.
			</Text>
			{props.instructions && (
				<Text size="sm" c="dimmed">
					{props.instructions}
				</Text>
			)}
		</Stack>
	);
}
