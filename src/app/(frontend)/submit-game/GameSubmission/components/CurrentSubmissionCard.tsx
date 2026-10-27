"use client";

import { useEffect, useState, type ReactNode } from "react";
import styles from "./CurrentSubmissionCard.module.css";
import type { GameSubmissionResults } from "../submissionTypes";
import type { UseFormReturnType } from "@mantine/form";
import { validateUrl } from "#fields/validators.ts";

type CurrentSubmissionCardProps = {
	currentStep: number;
	form: UseFormReturnType<GameSubmissionResults>;
	eventName: string;
	totalDays: number;
	submitted: boolean;
};

const AGE_RATINGS: Record<string, string> = {
	m_or_lower: "G/PG/M",
	ma15: "MA15+",
	r18: "R18+",
};

function Blank() {
	return <span className={styles.blank}>________</span>;
}

function orBlank(value: ReactNode) {
	return value === undefined || value === null || value === "" || value === false ? <Blank /> : value;
}

function Line({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className={styles.line}>
			<span className={styles.label}>{label}</span>
			<span className={styles.lineValue}>{orBlank(children)}</span>
		</div>
	);
}

function Block({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className={styles.block}>
			<span className={styles.label}>{label}</span>
			<span className={styles.value}>{orBlank(children)}</span>
		</div>
	);
}

export function raceSummary(values: GameSubmissionResults) {
	if (values.race === "noRace") return "No";
	const kind = values.coop ? "Co-op" : "Race";
	return values.race === "only" ? `${kind} only` : `${kind} (solo OK)`;
}

export default function CurrentSubmissionCard(props: CurrentSubmissionCardProps) {
	const values = props.form.values;
	// Rendered client-side only so the server and client markup match
	const [printedAt, setPrintedAt] = useState<string | null>(null);

	useEffect(() => {
		setPrintedAt(
			new Date().toLocaleString("en-AU", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			}),
		);
	}, []);

	const daysAvailable = values.availability.slice(0, props.totalDays).filter(Boolean).length;
	const incentiveCount = values.donationIncentives?.filter((incentive) => incentive.title.trim()).length ?? 0;
	const showTechPlatform = values.techPlatform && values.techPlatform !== values.platform;

	// Sections for steps the runner hasn't reached yet are faded out
	const sectionState = (step: number) =>
		props.submitted || props.currentStep > step ? "done" : props.currentStep === step ? "active" : "upcoming";

	return (
		<aside className={styles.receipt} aria-label="Submission summary" data-submitted={props.submitted || undefined}>
			<p className={styles.storeName}>*** AusSpeedruns ***</p>
			<p className={styles.header}>Game Submission</p>
			<p className={styles.meta}>{props.eventName}</p>
			<p className={styles.meta}>{printedAt ?? "\u00A0"}</p>

			<hr />

			<section className={styles.section} data-state={sectionState(0)}>
				<Block label="Game">{values.game}</Block>
				<Block label="Platform">
					{values.platform && (
						<>
							{values.platform}
							{showTechPlatform && <span className={styles.subValue}>on {values.techPlatform}</span>}
						</>
					)}
				</Block>
				<Line label="Rating">{AGE_RATINGS[values.ageRating ?? ""]}</Line>
			</section>

			<hr />

			<section className={styles.section} data-state={sectionState(1)}>
				<Block label="Category">{values.category}</Block>
				<Line label="Estimate">{values.estimate !== "00:00:00" && values.estimate}</Line>
				{values.possibleEstimate !== undefined && (
					<Line label="Lower est.">{values.possibleEstimate !== "00:00:00" && values.possibleEstimate}</Line>
				)}
				<Line label="Video">{values.video && validateUrl(values.video) === true && "Linked"}</Line>
				{incentiveCount > 0 && <Line label="Incentives">{incentiveCount}</Line>}
				{values.specialRequirements.trim() && <Line label="Special reqs">Yes</Line>}
			</section>

			<hr />

			<section className={styles.section} data-state={sectionState(2)}>
				<Line label="Available">
					{props.totalDays === 0 ? "TBA" : daysAvailable > 0 && `${daysAvailable}/${props.totalDays} days`}
				</Line>
			</section>

			<section className={styles.section} data-state={sectionState(3)}>
				<Line label="Race/Co-op">{raceSummary(values)}</Line>
				{values.race !== "noRace" && values.racer && <Block label="With">{values.racer}</Block>}
			</section>

			<section className={styles.section} data-state={sectionState(4)}>
				<Line label="Backup">{values.backup ? "Yes" : "No"}</Line>
			</section>

			<hr />

			<div className={styles.barcode} aria-hidden />
			<p className={styles.footer}>
				{props.submitted ? "Thank you for submitting!" : `Step ${Math.min(props.currentStep + 1, 5)} of 5`}
			</p>

			{props.submitted && (
				<div className={styles.stamp} aria-hidden>
					Submitted
				</div>
			)}
		</aside>
	);
}
