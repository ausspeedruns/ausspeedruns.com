import type { Block, Run } from "./schedule-types";
import styles from "./run.module.css";

import ConsoleIcon from "./icons/console.svg";
import RunnerIcon from "./icons/runner.svg";
import EstimateIcon from "./icons/stopwatch.svg";
// import PaidIcon from "@mui/icons-material/Paid";
import { Runners } from "./runners";
import { scheduleTimeToDisplayZone } from "./time";

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

	const convertedTimezone = scheduleTimeToDisplayZone(
		run.scheduledTime,
		props.eventTimezone,
		props.showLocalTime,
	).format("h:mm A");

	if (run.type === "setupBuffer") {
		return (
			<div className={styles.setupBuffer} key={run.id}>
				{parseInt(run.estimate.split(":")[1] ?? "0", 10)} min Setup Buffer
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
				{categoryExtras}
				{run.category}
			</span>
			<div className={styles.metaData} style={{ color: props.block?.textColour }}>
				<span className={styles.runners}>
					<RunnerIcon />
					<Runners runners={run.runners} />
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
		</div>
	);
}
