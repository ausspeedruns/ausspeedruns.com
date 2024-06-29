import React, { Suspense, useEffect, useRef, useState } from "react";
import styles from "./Heroblock.module.scss";
import { faCalendar, faChevronRight, faPersonRunning, faTicket } from "@fortawesome/free-solid-svg-icons";
import Button from "../Button/Button";
import type { AusSpeedrunsEvent } from "../../types/types";
import * as THREE from "three";

import { ASM2024Logo } from "./ASM24Logo";
import { Canvas } from "@react-three/fiber";

type HeroBlockProps = {
	event: AusSpeedrunsEvent;
	tagLine?: string;
	darkText?: boolean;
	schedule?: boolean;
	submitRuns?: boolean;
	ticketLink?: string;
};

function zeroPad(num: number): string {
	return num.toString().padStart(2, "0");
}

function deg2Rad(degrees: number) {
	return degrees * (Math.PI / 180);
}

THREE.ShaderChunk.project_vertex = `
 	// vec2 resolution = vec2(320, 240);
 	vec2 resolution = vec2(192, 144);
	vec4 mvPosition = vec4(transformed, 1.0);

	mvPosition = modelViewMatrix * mvPosition;

	gl_Position = projectionMatrix * mvPosition;
 	gl_Position.xyz /= gl_Position.w;
 	gl_Position.xy = floor(resolution * gl_Position.xy) / resolution;
 	gl_Position.xyz *= gl_Position.w;
`;

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
					{zeroPad(days)}:{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
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
					{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
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
				{zeroPad(minutes)}:{zeroPad(seconds)}
			</span>
		</span>
	);
}

const ASM24HeroBlock = ({ event, tagLine, darkText, schedule, submitRuns, ticketLink }: HeroBlockProps) => {
	const [countdownElement, setCountdownElement] = useState(<></>);
	const canvasRef = useRef<HTMLDivElement>(null);
	const [targetRotation, setTargetRotation] = useState(new THREE.Euler());
	const rotation = new THREE.Euler();

	const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left - rect.width / 2;
		const y = event.clientY - rect.top - rect.height / 2;

		rotation.y = deg2Rad(x / 50);
		rotation.x = deg2Rad(y / 10);

		setTargetRotation(rotation);
	};

	function updateCountdown() {
		if (!event.startDate) return;
		if (Date.now() < new Date(event.startDate).getTime()) {
			setCountdownElement(countdownRender(Date.now(), new Date(event.startDate).getTime()));
		}
	}

	useEffect(() => {
		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<section
			className={styles.heroblock}
			style={{
				backgroundImage: `url("${require(`../../styles/img/${event.heroImage}`).default.src}")`,
				color: darkText ? "#000" : "#fff",
			}}
			onMouseMove={handleMouseMove}
			onMouseLeave={() => setTargetRotation(rotation.set(0, 0, 0))}
			ref={canvasRef}>
			<div className={`${styles.content} content`}>
				<div className={styles.ctaBlock}>
					<h1>{event.preferredName}</h1>
					<h2>{event.dates}</h2>
					<h3 className={[styles.countdown, styles.monospaced].join(" ")}>{countdownElement}</h3>
					<br />
					<p>{tagLine}</p>
					<Button
						actionText={event.preferredName}
						link={`/${event.shortName}`}
						iconRight={faChevronRight}
						colorScheme={"secondary"}
					/>
					{schedule && (
						<Button
							actionText="Schedule"
							link={`/${event.shortName}/schedule`}
							iconRight={faCalendar}
							colorScheme={"secondary"}
						/>
					)}
					{(event.website || ticketLink) && (
						<Button
							actionText="Purchase Tickets"
							link={event.website ?? ticketLink}
							iconRight={faTicket}
							colorScheme={"secondary"}
						/>
					)}
					{submitRuns && (
						<Button
							actionText="Submit a run!"
							link="/submit-game"
							iconRight={faPersonRunning}
							colorScheme={"secondary"}
						/>
					)}
				</div>
				<div style={{ width: "100%", padding: "0", maxWidth: 2000 }}>
					<Canvas flat style={{ imageRendering: "pixelated" }}>
						<Suspense fallback={null}>
							<ASM2024Logo targetRotation={targetRotation} />
						</Suspense>
					</Canvas>
				</div>
			</div>
		</section>
	);
};

export default ASM24HeroBlock;
