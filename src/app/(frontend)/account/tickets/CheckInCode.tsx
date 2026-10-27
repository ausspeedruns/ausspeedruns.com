"use client";

import { useEffect, useState } from "react";
import { Button, Modal } from "@mantine/core";
import { Barcode } from "pixelarticons/react";

import styles from "./CheckInCode.module.css";

interface CheckInCodeProps {
	ticketID: string;
	eventName: string;
}

/** The pickup desk accepts IDs with or without the prefix and ignores spaces, so only the code itself is shown large. */
const PREFIX = /^(T-|ORD-)/i;

function groupCode(code: string): string[] {
	let size = 4;
	if (code.length % 5 === 0) size = 5;
	else if (code.length % 3 === 0) size = 3;

	const groups: string[] = [];
	for (let i = 0; i < code.length; i += size) {
		groups.push(code.slice(i, i + size));
	}
	return groups;
}

/** Keeps the phone screen on while the code is being shown at the desk. */
function useScreenWakeLock(active: boolean) {
	useEffect(() => {
		if (!active || !("wakeLock" in navigator)) return;

		let lock: WakeLockSentinel | null = null;
		let released = false;
		navigator.wakeLock
			.request("screen")
			.then((sentinel) => {
				if (released) void sentinel.release();
				else lock = sentinel;
			})
			.catch(() => {});

		return () => {
			released = true;
			void lock?.release();
		};
	}, [active]);
}

export function CheckInCode({ ticketID, eventName }: CheckInCodeProps) {
	const [opened, setOpened] = useState(false);
	useScreenWakeLock(opened);

	const code = ticketID.replace(PREFIX, "").toUpperCase();
	const groups = groupCode(code);

	return (
		<>
			<Button
				onClick={() => setOpened(true)}
				size="md"
				leftSection={<Barcode width={20} height={20} />}
				className={styles.openButton}
			>
				Show ticket at check-in
			</Button>

			<Modal
				opened={opened}
				onClose={() => setOpened(false)}
				fullScreen
				withCloseButton={false}
				classNames={{ content: styles.content, body: styles.body }}
				aria-label={`Ticket ID ${code.split("").join(" ")}`}
			>
				<p className={styles.eventName}>{eventName}</p>
				<p className={styles.instruction}>Show this screen at the ticket desk</p>

				<div className={styles.code} aria-hidden>
					{groups.map((group, groupIndex) => (
						<div key={groupIndex} className={styles.group}>
							{group.split("").map((char, charIndex) => (
								<span key={charIndex} className={styles.char}>
									{char}
								</span>
							))}
						</div>
					))}
				</div>

				<p className={styles.fullId}>{ticketID}</p>

				<Button size="xl" fullWidth onClick={() => setOpened(false)} className={styles.closeButton}>
					Close
				</Button>
			</Modal>
		</>
	);
}
