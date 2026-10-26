"use client";

import { Button, Group, Modal, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState, type ReactNode } from "react";

export const notify = {
	success: (message: string) => notifications.show({ color: "green", title: "Done", message }),
	error: (message: string) => notifications.show({ color: "red", title: "Something went wrong", message }),
};

export function errorMessage(error: unknown, fallback = "Something went wrong."): string {
	return error instanceof Error ? error.message : fallback;
}

interface ConfirmModalProps {
	opened: boolean;
	title: ReactNode;
	children: ReactNode;
	confirmLabel: string;
	danger?: boolean;
	onCancel: () => void;
	onConfirm: () => Promise<unknown> | unknown;
}

/** Confirmation dialog that shows a loading state while `onConfirm` runs, then closes. */
export function ConfirmModal({
	opened,
	title,
	children,
	confirmLabel,
	danger,
	onCancel,
	onConfirm,
}: ConfirmModalProps) {
	const [loading, setLoading] = useState(false);

	return (
		<Modal opened={opened} onClose={() => !loading && onCancel()} title={title} centered>
			<Stack>
				{children}
				<Group justify="flex-end">
					<Button variant="default" onClick={onCancel} disabled={loading}>
						Cancel
					</Button>
					<Button
						color={danger ? "red" : undefined}
						loading={loading}
						onClick={async () => {
							setLoading(true);
							try {
								await onConfirm();
							} finally {
								setLoading(false);
								onCancel();
							}
						}}
					>
						{confirmLabel}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
