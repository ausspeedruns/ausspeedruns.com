import type { Block, Run } from "./schedule-types";
import styles from "./run.module.css";

import ConsoleIcon from "./icons/console.svg";
import RunnerIcon from "./icons/runner.svg";
import EstimateIcon from "./icons/stopwatch.svg";
// import PaidIcon from "@mui/icons-material/Paid";
import { Runners } from "./runners";
import { formatScheduleTime } from "./time";

interface RunItemProps {
	run: Run;
	showLocalTime: boolean;
	eventTimezone: string;
	isLive?: boolean;
	block?: Block;
	style?: React.CSSProperties;
}

export function RunElement(props: RunItemProps) {
	const { run } = props;

	const convertedTimezone = formatScheduleTime(
		run.scheduledTime,
		props.eventTimezone,
		props.showLocalTime,
		"h:mm a",
	);

	if (run.type === "setupBuffer") {
		return (
			<div className={styles.setupBuffer} key={run.id}>
				{parseInt(run.estimate.split(":")[1] ?? "0", 10)} min Setup Buffer
			</div>
		);
	}

	if (run.type === "segment") {
		const hasPeople = run.runners.length > 0 || (run.otherRunners?.length ?? 0) > 0;
		return (
			<div
				className={[styles.segment, props.isLive ? styles.liveRun : ""].join(" ")}
				key={run.id}
				id={run.id.toString()}
				style={{
					background: run.segmentType?.colour ?? undefined,
					color: run.segmentType?.textColour ?? undefined,
				}}
			>
				<span className={styles.segmentTime}>{convertedTimezone}</span>
				<span className={styles.segmentType}>{run.segmentType?.name ?? "Segment"}</span>
				<span className={styles.segmentTitle}>{run.category || run.segmentType?.name}</span>
				{hasPeople && (
					<span className={styles.segmentPeople}>
						<Runners runners={run.runners} others={run.otherRunners} />
					</span>
				)}
			</div>
		);
	}

	if (run.type === "sleep" || run.type === "other") {
		return (
			<div className={styles.setupBuffer} key={run.id}>
				{convertedTimezone} — {run.category || (run.type === "sleep" ? "Overnight break" : run.game)}
			</div>
		);
	}

	let categoryExtras = <></>;
	if (run.race)
		categoryExtras = (
			<span
				className={styles.categoryExtras}
				style={{
					background: props.block && props.block.colour,
					border: props.block && "3px solid #fff",
				}}
			>
				RACE
			</span>
		);
	if (run.coop)
		categoryExtras = (
			<span
				className={styles.categoryExtras}
				style={{
					background: props.block && props.block.colour,
					border: props.block && "3px solid #fff",
				}}
			>
				CO-OP
			</span>
		);

	const runClassNames = [styles.run];
	if (props.isLive) runClassNames.push(styles.liveRun);

	const estimateSplit = run.estimate.split(":");
	const hours = parseInt(estimateSplit[0]);
	const minutes = parseInt(estimateSplit[1]);
	const formattedHours = hours.toString();
	const formattedMinutes = minutes.toString().padStart(2, "0");
	const estimateText = `${formattedHours}:${formattedMinutes}:00`;

	return (
		<div
			className={runClassNames.join(" ")}
			key={run.id}
			style={{ background: props.block?.colour, color: props.block?.textColour, ...props.style }}
			id={run.id.toString()}
			run-odd={`${run.displayIndex % 2 != 0}`}
		>
			<span className={styles.time} style={props.block && { background: "white", color: "black" }}>
				{convertedTimezone}
			</span>
			{props.block?.name && <span className={styles.blockName}>{props.block?.name}</span>}
			<h3 className={styles.game}>{run.game}</h3>
			<span className={styles.category} style={{ color: props.block?.textColour }}>
				{run.type === "medley" ? (
					<>
						<span
							className={styles.categoryExtras}
							style={{ background: props.block && props.block.colour, border: props.block && "3px solid #fff" }}
						>
							MEDLEY
						</span>
						{run.children?.length ?? 0} {run.children?.length === 1 ? "game" : "games"}
					</>
				) : (
					<>
						{categoryExtras}
						{run.category}
					</>
				)}
			</span>
			<div className={styles.metaData} style={{ color: props.block?.textColour }}>
				<span className={styles.runners}>
					<RunnerIcon />
					<Runners runners={run.runners} others={run.otherRunners} />
				</span>
				<span className={styles.estimate}>
					<EstimateIcon />
					{estimateText}
				</span>
				<span className={styles.platform}>
					<ConsoleIcon />
					{run.platform}
				</span>
			</div>
			{run.donationIncentives && run.donationIncentives.length > 0 && (
				<div
					className={styles.donationIncentives}
					style={{ color: props.block?.textColour, borderColor: props.block && "white" }}
				>
					<span className={styles.title}>{/* <PaidIcon /> Incentives */}</span>
					{run.donationIncentives?.map((incentive) => (
						<span
							className={styles.donationIncentive}
							style={{ color: props.block?.textColour }}
							key={incentive.id}
						>
							{incentive.title}
						</span>
					))}
				</div>
			)}
			{run.type === "medley" && run.children && run.children.length > 0 && (
				<details className={styles.medleyGames} style={{ color: props.block?.textColour }}>
					<summary>Show games</summary>
					<ol>
						{run.children.map((child) => (
							<li key={child.id} className={styles.medleyGame}>
								<span className={styles.medleyGameTime}>
									{child.scheduledTime
										? `~${formatScheduleTime(child.scheduledTime, props.eventTimezone, props.showLocalTime, "h:mm a")}`
										: ""}
								</span>
								<span className={styles.medleyGameName}>
									<strong>{child.game}</strong>
									<span>
										{child.race && "RACE · "}
										{child.coop && "CO-OP · "}
										{child.category}
									</span>
								</span>
								<span className={styles.medleyGameMeta}>
									<Runners runners={child.runners} others={child.otherRunners} />
									<span>
										{formatEstimate(child.estimate)} · {child.platform}
									</span>
									{child.donationIncentives.map((incentive) => (
										<em key={incentive.id}>{incentive.title}</em>
									))}
								</span>
							</li>
						))}
					</ol>
				</details>
			)}
		</div>
	);
}

function formatEstimate(estimate: string): string {
	const [hours = "0", minutes = "0"] = estimate.split(":");
	return `${parseInt(hours, 10)}:${minutes.padStart(2, "0")}`;
}
