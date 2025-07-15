import { Block, Run } from "./schedule-types";
import styles from "./Schedule.event.module.scss";

import ConsoleIcon from "./icons/console.svg";
import RunnerIcon from "./icons/runner.svg";
import EstimateIcon from "./icons/stopwatch.svg";
import PaidIcon from "@mui/icons-material/Paid";
import { Runners } from "./runners";

const runItemOptions: Intl.DateTimeFormatOptions = {
	hour12: true,
	minute: "2-digit",
	hour: "2-digit",
};

interface RunItemProps {
	run: Run;
	showLocalTime: boolean;
	eventTimezone: string;
	isLive?: boolean;
	block?: Block;
	style?: React.CSSProperties;
}

export const RunElement: React.FC<RunItemProps> = (props: RunItemProps) => {
	const { run } = props;

	let convertedTimezone = props.showLocalTime
		? new Date(run.scheduledTime).toLocaleTimeString("en-AU", {
				...runItemOptions,
				timeZone: props.eventTimezone,
			})
		: new Date(run.scheduledTime).toLocaleTimeString("en-AU", runItemOptions);

	if (convertedTimezone[0] === "0") convertedTimezone = convertedTimezone.substring(1);

	if (run.game === "Setup Buffer") {
		return (
			<div className={styles.setupBuffer} key={run.id}>
				{run.estimate.split(":")[1]} min Setup Buffer
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
				}}>
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
				}}>
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

	// Bad hardcoding bad!
	let overwriteFilter;
	if (props.block) {
		if (props.block.textColour === "#ffffff") {
			overwriteFilter = "invert(100%)";
		} else {
			overwriteFilter = "unset";
		}
	}

	return (
		<div
			className={runClassNames.join(" ")}
			key={run.id}
			style={{ background: props.block?.colour, color: props.block?.textColour, ...props.style }}
			id={run.id}
			run-odd={`${run.order !== undefined ? run.order % 2 != 0 : false}`}>
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
					<img src={RunnerIcon.src} style={{ filter: overwriteFilter }} />
					{run.runners.length > 0 ? <Runners runners={run.runners} /> : run.racer}
				</span>
				<span className={styles.estimate}>
					<img src={EstimateIcon.src} style={{ filter: overwriteFilter }} />
					{estimateText}
				</span>
				<span className={styles.platform}>
					<img src={ConsoleIcon.src} style={{ filter: overwriteFilter }} />
					{run.platform}
				</span>
			</div>
			{run.donationIncentiveObject && run.donationIncentiveObject.length > 0 && (
				<div
					className={styles.donationIncentives}
					style={{ color: props.block?.textColour, borderColor: props.block && "white" }}>
					<span className={styles.title}>
						<PaidIcon /> Incentives
					</span>
					{run.donationIncentiveObject?.map((incentive) => (
						<span
							className={styles.donationIncentive}
							style={{ color: props.block?.textColour }}
							key={incentive.id}>
							{incentive.title}
						</span>
					))}
				</div>
			)}
		</div>
	);
};
