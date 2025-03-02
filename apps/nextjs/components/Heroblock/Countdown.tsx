"use client";

import { useEffect, useState } from "react";

type CountdownProps = {
	eventDate?: string;
};

export function Countdown(props: CountdownProps) {
	const [countdownElement, setCountdownElement] = useState(<></>);

	function updateCountdown() {
		if (!props.eventDate) return;
		if (Date.now() < new Date(props.eventDate).getTime()) {
			setCountdownElement(countdownRender(Date.now(), new Date(props.eventDate).getTime()));
		}
	}

	useEffect(() => {
		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);
		return () => clearInterval(interval);
	}, []);

	return countdownElement;
}

function zeroPad(num: number): string {
	return num.toString().padStart(2, "0");
}

function countdownRender(currentTime: number, eventDate: number) {
	// Calculate the difference in seconds between the target date and current date
	let diffInSeconds = (eventDate - currentTime) / 1000;

	// Calculate the days, hours, minutes and seconds from the difference in seconds
	let days = Math.floor(diffInSeconds / 86400);
	let hours = Math.floor(diffInSeconds / 3600) % 24;
	let minutes = Math.floor(diffInSeconds / 60) % 60;
	let seconds = Math.floor(diffInSeconds % 60);

	if (days > 0) {
		return (
			<span>
				<span className="sr-only">
					{days} days, {hours} hours, {minutes} minutes and {seconds} seconds remaining
				</span>
				<span aria-hidden>
					{zeroPad(days)} : {zeroPad(hours)} : {zeroPad(minutes)} : {zeroPad(seconds)}
				</span>
			</span>
		);
	}

	if (hours > 0) {
		return (
			<span>
				<span className="sr-only">
					{hours} hours, {minutes} minutes and {seconds} seconds remaining
				</span>
				<span aria-hidden>
					{zeroPad(hours)} : {zeroPad(minutes)} : {zeroPad(seconds)}
				</span>
			</span>
		);
	}

	return (
		<span>
			<span className="sr-only">
				{minutes} minutes and {seconds} seconds remaining
			</span>
			<span aria-hidden>
				{zeroPad(minutes)} : {zeroPad(seconds)}
			</span>
		</span>
	);
}
