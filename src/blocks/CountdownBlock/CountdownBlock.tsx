"use client";

import React, { useEffect, useState } from "react";
import type { CountdownBlock as CountdownBlockProps } from "#/payload-types";
import styles from "./CountdownBlock.module.css";

export function CountdownBlock(props: CountdownBlockProps) {
	const { title, targetDate, finishedMessage } = props;
	const [timeLeft, setTimeLeft] = useState("");

	useEffect(() => {
		if (!targetDate) return;

		const target = new Date(targetDate).getTime();
		const timer = setInterval(() => {
			const now = new Date().getTime();
			const dist = target - now;

			if (dist < 0) {
				clearInterval(timer);
				setTimeLeft("EXPIRED");
				return;
			}

			const days = Math.floor(dist / (1000 * 60 * 60 * 24));
			const hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((dist % (1000 * 60)) / 1000);

			setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
		}, 1000);

		return () => clearInterval(timer);
	}, [targetDate]);

	return (
		<div className={styles.container}>
			{title && <h3>{title}</h3>}
			{timeLeft === "EXPIRED" ? (
				<h2 className={styles.finishedMessage}>{finishedMessage || "Time's up!"}</h2>
			) : (
				<div className={styles.timeLeft}>{timeLeft || "Loading..."}</div>
			)}
		</div>
	);
}
