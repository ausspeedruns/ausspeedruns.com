import { useEffect, useState } from "react";
import styles from "./EstimateInput.module.scss";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

type EstimateInputProps = {
	onTimeChange: (formattedTime: string) => void;
	label?: string;
	required?: boolean;
	value: string;
	disabled?: boolean;
};

function parseEstimateString(estimate: string) {
	const regexInfo = /(\d{1,2}):(\d{2}):\d{2}/.exec(estimate);
	if (!regexInfo) {
		return {
			hours: 0,
			mins: 0,
		};
	}
	const hours = parseInt(regexInfo[1]);
	const mins = parseInt(regexInfo[2]);
	if (!isNaN(hours) && !isNaN(mins)) {
		return {
			hours,
			mins,
		};
	} else {
		console.error("[EstimateInput] Tried to parse", estimate);
		return {
			hours: 0,
			mins: 0,
		};
	}
}

function EstimateInput(props: EstimateInputProps) {
	const [hours, setHours] = useState<number>(
		parseEstimateString(props.value).hours,
	);
	const [mins, setMins] = useState<number>(
		parseEstimateString(props.value).mins,
	);

	useEffect(() => {
		const newTime = parseEstimateString(props.value);
		setHours(newTime.hours);
		setMins(newTime.mins);
	}, [props.value]);

	function formatTime(): string {
		const paddedHour = hours.toString().padStart(2, "0");
		const paddedMinute = mins.toString().padStart(2, "0");

		return `${paddedHour}:${paddedMinute}:00`;
	}

	useEffect(() => {
		const formattedTime = formatTime();
		if (formattedTime !== props.value) props.onTimeChange(formatTime());
	}, [hours, mins]);

	return (
		<div className={styles.estimateContainer}>
			<InputLabel
				disabled={props.disabled}
				id="estimate-label"
				className={styles.label}>
				{props.label ?? "Estimate"}
				{props.required && "*"}
			</InputLabel>
			<div className={styles.inputContainer}>
				<FormControl
					disabled={props.disabled}
					className={styles.select}>
					<InputLabel id="estimate-hour-label">Hour</InputLabel>
					<Select
						fullWidth
						labelId="estimate-hour-label"
						id="estimate-hour-select"
						value={hours}
						onChange={(e) => setHours(e.target.value as number)}
						label="Hour">
						{[...Array(14).keys()].map((number) => {
							return (
								<MenuItem
									className={styles.menuItem}
									value={number}
									key={number}>
									{number}
								</MenuItem>
							);
						})}
					</Select>
				</FormControl>
				<FormControl
					disabled={props.disabled}
					className={styles.select}>
					<InputLabel id="estimate-mins-label">Mins</InputLabel>
					<Select
						fullWidth
						labelId="estimate-mins-label"
						id="estimate-mins-select"
						value={mins}
						onChange={(e) => setMins(e.target.value as number)}
						label="Mins">
						{Array.from({ length: 12 }, (_, i) => i * 5).map(
							(number) => {
								return (
									<MenuItem
										className={styles.menuItem}
										value={number}
										key={number}>
										{number.toString().padStart(2, "0")}
									</MenuItem>
								);
							},
						)}
					</Select>
				</FormControl>
			</div>
		</div>
	);
}

export default EstimateInput;
