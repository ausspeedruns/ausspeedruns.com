import { useMemo } from "react";
import { Checkbox, Input } from "@mantine/core";
import dayjs from "dayjs";
import styles from "../GameSubmission.module.css";
import { type GameSubmissionResults } from "../submissionTypes";
import type { UseFormReturnType } from "@mantine/form";

interface AvailabilityProps {
	event: {
		startDate: string;
		endDate: string;
		eventTimezone: string;
	};
	form: UseFormReturnType<GameSubmissionResults>;
}

export function Availability(props: AvailabilityProps) {
	const eventLength = useMemo(
		() => dayjs(props.event.endDate).diff(dayjs(props.event.startDate), "day") + 1,
		[props.event],
	);

	const allSelected =
		props.form.values.availability.length >= eventLength && props.form.values.availability.every(Boolean);

	function toggleAll() {
		if (allSelected) {
			props.form.setFieldValue("availability", []);
		} else {
			props.form.setFieldValue("availability", Array(eventLength).fill(true));
		}
	}

	let dateCheckboxes = [];
	for (let i = 0; i < eventLength; i++) {
		const date = dayjs(props.event.startDate).add(i, "day").toDate();
		dateCheckboxes.push(
			<Checkbox
				key={i}
				onChange={(e) => {
					const newDates = [...props.form.values.availability];
					newDates[i] = e.currentTarget.checked;
					props.form.setFieldValue("availability", newDates);
				}}
				checked={props.form.values.availability[i] ?? false}
				label={date.toLocaleDateString("en-AU", {
					weekday: "long",
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					timeZone: props.event.eventTimezone || "Australia/Melbourne",
				})}
			/>,
		);
	}

	return (
		<div className={styles.pageContent}>
			<div className={styles.pageHeader}>
				<h3>Availability</h3>
				<p>Select all days you are available to attend. More availability improves your chances.</p>
			</div>

			<Checkbox checked={allSelected} onChange={toggleAll} label="Available all days" fw={600} />

			<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingLeft: "0.25rem" }}>
				{dateCheckboxes}
			</div>

			{props.form.errors.availability && <Input.Error>{props.form.errors.availability}</Input.Error>}
		</div>
	);
}
