import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FocusEvent, ReactNode } from "react";
import styles from "./EstimateInput.module.css";
import { Input, Select } from "@mantine/core";

type EstimateInputProps = {
	onTimeChange?: (formattedTime: string) => void;
	label?: string;
	required?: boolean;
	value?: string;
	defaultValue?: string;
	onChange?: (value: string | ChangeEvent<HTMLInputElement>) => void;
	onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
	onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
	error?: ReactNode;
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
	const initialTime = useMemo(
		() => parseEstimateString(props.value ?? props.defaultValue ?? "00:00:00"),
		[props.defaultValue, props.value],
	);
	const [hours, setHours] = useState<number>(initialTime.hours);
	const [mins, setMins] = useState<number>(initialTime.mins);

	useEffect(() => {
		if (props.value === undefined) return;

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
		if (formattedTime === props.value) return;

		props.onTimeChange?.(formattedTime);
		props.onChange?.(formattedTime);
	}, [hours, mins, props.onChange, props.onTimeChange, props.value]);

	return (
		<div className={styles.estimateContainer}>
			<input
				type="hidden"
				name={props.name}
				value={formatTime()}
				onFocus={props.onFocus}
				onBlur={props.onBlur}
				onChange={props.onChange}
			/>
			<Input.Label className={styles.label} required={props.required}>
				{props.label ?? "Estimate"}
			</Input.Label>
			<div className={styles.inputContainer}>
				<Select
					disabled={props.disabled}
					className={styles.select}
					label="Hour"
					value={hours.toString()}
					onChange={(val) => val !== null && setHours(parseInt(val))}
					onFocus={(event) => props.onFocus?.(event as FocusEvent<HTMLInputElement>)}
					onBlur={(event) => props.onBlur?.(event as FocusEvent<HTMLInputElement>)}
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
					onFocus={(event) => props.onFocus?.(event as FocusEvent<HTMLInputElement>)}
					onBlur={(event) => props.onBlur?.(event as FocusEvent<HTMLInputElement>)}
					data={Array.from({ length: 12 }, (_, i) => i * 5).map((n) => ({
						value: n.toString(),
						label: n.toString().padStart(2, "0"),
					}))}
				/>
			</div>
			{props.error ? <Input.Error>{props.error}</Input.Error> : null}
		</div>
	);
}

export default EstimateInput;
