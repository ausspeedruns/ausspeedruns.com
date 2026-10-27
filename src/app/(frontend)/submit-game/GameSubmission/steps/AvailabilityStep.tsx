import { Alert, Checkbox, Input } from "@mantine/core";
import { addDays } from "date-fns";
import styles from "../GameSubmission.module.css";
import { type GameSubmissionResults } from "../submissionTypes";
import type { UseFormReturnType } from "@mantine/form";

interface AvailabilityProps {
	event: {
		startDate: string;
		endDate: string;
		eventTimezone: string;
	};
	eventLength: number;
	form: UseFormReturnType<GameSubmissionResults>;
}

export function Availability(props: AvailabilityProps) {
	const { eventLength } = props;

	if (eventLength === 0) {
		return (
			<div className={styles.pageContent}>
				<div className={styles.pageHeader}>
					<h2>Availability</h2>
					<p>Select all days you are available to attend.</p>
				</div>
				<Alert variant="light" color="blue" title="Event dates not announced yet">
					This event doesn&apos;t have its dates set yet, so you can skip this step for now.
				</Alert>
			</div>
		);
	}

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
		const date = addDays(props.event.startDate, i);
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
				<h2>Availability</h2>
				<p>Select all days you are available to attend. More availability improves your chances.</p>
			</div>

			{/* data-path lets the form focus this group (and read out the error) when no day is selected */}
			<div
				role="group"
				aria-label="Days you are available"
				aria-describedby={props.form.errors.availability ? "availability-error" : undefined}
				data-path="availability"
				tabIndex={-1}
				className={styles.pageContent}
				style={{ padding: 0 }}
			>
				<Checkbox checked={allSelected} onChange={toggleAll} label="Available all days" fw={600} />

				<div className={styles.dayList}>{dateCheckboxes}</div>
			</div>

			{props.form.errors.availability && (
				<Input.Error id="availability-error">{props.form.errors.availability}</Input.Error>
			)}
		</div>
	);
}
