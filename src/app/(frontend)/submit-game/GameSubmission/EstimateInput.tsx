import { useEffect, useState } from "react";
import styles from "./EstimateInput.module.css";
import { Input, Select } from "@mantine/core";

type EstimateInputProps = {
	onTimeChange: (formattedTime: string) => void;
	label?: string;
	required?: boolean;
	value: string;
	disabled?: boolean;
	name?: string;
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
	const [hours, setHours] = useState<number>(parseEstimateString(props.value).hours);
	const [mins, setMins] = useState<number>(parseEstimateString(props.value).mins);

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
			<input type="hidden" name={props.name} value={formatTime()} />
			<Input.Label className={styles.label}>
				{props.label ?? "Estimate"}
				{props.required && "*"}
			</Input.Label>
			<div className={styles.inputContainer}>
				<Select
					disabled={props.disabled}
					className={styles.select}
					label="Hour"
					value={hours.toString()}
					onChange={(val) => val !== null && setHours(parseInt(val))}
					data={[...Array(14).keys()].map((n) => ({
						value: n.toString(),
						label: n.toString(),
					}))}
				/>
				<Select
					disabled={props.disabled}
					className={styles.select}
					label="Mins"
					value={mins.toString()}
					onChange={(val) => val !== null && setMins(parseInt(val))}
					data={Array.from({ length: 12 }, (_, i) => i * 5).map((n) => ({
						value: n.toString(),
						label: n.toString().padStart(2, "0"),
					}))}
				/>
			</div>
		</div>
	);
}

export default EstimateInput;
