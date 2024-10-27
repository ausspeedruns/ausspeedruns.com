"use client";

import { useState } from "react";
import styles from "./post-event.module.scss";

import type { AllRunsEvent } from "@ausspeedruns/component-blocks";
import { Accordion, AccordionDetails, AccordionSummary, Button, TextField } from "@mui/material";
import { faTwitch } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FilterRuns } from "../run-utils";

import type { PostEventRenderers } from "@ausspeedruns/component-blocks";
import Link from "next/link";

function RunnerLinks(runners: { id?: string; username: string }[], race = false, className?: string) {
	return runners.map((runner, i) => {
		// If only one name or second last in the list to not include a comma
		if (runners.length === 1 || i === runners.length - 2) {
			return GetRunnerElement(runner, className);
		}

		// End of names
		if (i === runners.length - 1) {
			return (
				<>
					<span> {race ? "vs" : "and"} </span>
					{GetRunnerElement(runner, className)}
				</>
			);
		}

		return (
			<>
				{GetRunnerElement(runner, className)}
				<span>, </span>
			</>
		);
	});
}

function GetRunnerElement(runner: { id?: string; username: string }, className?: string) {
	if (runner.id) {
		return (
			<Link key={runner.id} className={className} href={`/user/${runner.username}`}>
				{runner.username}
			</Link>
		);
	}

	return (
		<span key={runner.username} className={className}>
			{runner.username}
		</span>
	);
}

export function AllRuns({ event }: { event: Parameters<PostEventRenderers["AllRuns"]>[0]['event'] }) {
	const [search, setSearch] = useState("");

	if (!event) return <></>;

	const eventData = event.data as AllRunsEvent;

	return (
		<div className={styles.allRunsContainer}>
			<div className={styles.header}>
				<span className={styles.event}>{eventData.shortname} Runs</span>
				<TextField
					label="Search"
					color="primary"
					variant="outlined"
					onChange={(e) => setSearch(e.target.value)}
					value={search}
				/>
			</div>
			<div className={styles.runList}>
				<div className={styles.runListHeader}>
					{/* <span className={styles.runNumber}>#</span> */}
					<span className={styles.game}>Game</span>
					<span className={styles.category}>Category</span>
					<span className={styles.runners}>Runner</span>
					<span className={styles.platform}>Console</span>
					<span className={styles.finalTime}>Final Time</span>
				</div>
				<div className={styles.runs}>
					{FilterRuns(eventData.runs, {
						console: [],
						coop: false,
						race: false,
						donationIncentive: false,
						search,
					}).map((run) => {
						let runners: { id?: string; username: string }[] = [];
						runners.push(...run.runners);
						if (run.racer) {
							runners.push({
								id: undefined,
								username: run.racer,
							});
						}

						// const expanded = openedRuns.includes(run.id);

						return (
							<Accordion
								className={styles.run}
								key={run.id}
								disableGutters
								TransitionProps={{ unmountOnExit: true }}
								// expanded={expanded}
								// onChange={handleRunChange(run.id)}
							>
								<AccordionSummary className={styles.runListHeader}>
									{/* <span className={styles.runNumber}>{runIndex.get(run.id)}</span> */}
									<span className={styles.game}>{run.game}</span>
									<span className={styles.category}>{run.category}</span>
									<span className={styles.runners}>
										{runners.map((runner) => runner.username).join(", ")}
									</span>
									<span className={styles.platform}>{run.platform}</span>
									<span className={styles.finalTime}>{run.finalTime}</span>
								</AccordionSummary>
								<AccordionDetails className={styles.runData}>
									<div className={styles.youtube}>
										{run.youtubeVOD ? (
											<iframe
												width="100%"
												height="100%"
												src={`https://www.youtube-nocookie.com/embed/${
													run.youtubeVOD.split("?v=")[1]
												}`}
												title="YouTube video player"
												frameBorder="0"
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												allowFullScreen
											/>
										) : (
											<span>YouTube VOD coming soon!</span>
										)}
									</div>
									<div className={styles.data}>
										<div className={styles.runGameAndCategory}>
											<h2>{run.game}</h2>
											<h3>{run.category}</h3>
										</div>
										<div className={styles.metadata}>
											<div className={styles.column}>
												<span className={styles.label}>Run by</span>
												<div>{RunnerLinks(runners, run.race, styles.runnerLink)}</div>
												<span className={styles.label}>Final Time</span>
												<span className={styles.finalTime}>{run.finalTime}</span>
												<span className={styles.label}>Console</span>
												<span className={styles.platform}>{run.platform}</span>
											</div>
											<div className={styles.column}>
												{run.twitchVOD && (
													<a
														href={run.twitchVOD}
														target="_blank"
														rel="noopener noreferrer"
														className={styles.twitch}>
														<Button
															variant="contained"
															startIcon={<FontAwesomeIcon icon={faTwitch} />}>
															Twitch
														</Button>
													</a>
												)}
											</div>
										</div>
									</div>
								</AccordionDetails>
							</Accordion>
						);
					})}
				</div>
			</div>
		</div>
	);
}
