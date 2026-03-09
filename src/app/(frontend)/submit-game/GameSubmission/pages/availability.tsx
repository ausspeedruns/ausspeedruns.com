import { useEffect, useMemo } from "react";
import { Checkbox } from "@mantine/core";
import dayjs from "dayjs";
import { GameSubmitPage } from "../components/GameSubmitPage";
import { type GameSubmissionResults } from "../submissionTypes";
import type { UseFormReturnType } from "@mantine/form";

interface AvailabilityProps {
	event: {
		startDate: string;
		endDate: string;
		eventTimezone: string;
	};
	form: UseFormReturnType<GameSubmissionResults>;
};

export function Availability(props: AvailabilityProps) {
	const eventLength = useMemo(
		() => dayjs(props.event.endDate).diff(dayjs(props.event.startDate), "day") + 1,
		[props.event],
	);

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
		<>
			<div style={{ display: "flex", flexDirection: "column" }}>{dateCheckboxes}</div>
		</>
	);
}
