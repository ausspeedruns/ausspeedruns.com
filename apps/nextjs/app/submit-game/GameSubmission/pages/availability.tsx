import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { FormControlLabel, Checkbox } from "@mui/material";
import { addDays, differenceInDays } from "date-fns";
import { GameSubmitPage } from "../components/GameSubmitPage";
import { SubmissionPageRef } from "../submissionTypes";

type AvailabilityProps = {
	event: {
		startDate: string;
		endDate: string;
		eventTimezone: string;
	};
	show: boolean;
	onComplete: (isComplete: boolean) => void;
};

function datesToString(dates: boolean[]) {
	return JSON.stringify([...dates].map((date) => (date ? "true" : "false")));
}

export const Availability = forwardRef<SubmissionPageRef, AvailabilityProps>((props, ref) => {
	const [dates, setDates] = useState<boolean[]>([true]);

	const eventLength = useMemo(
		() => differenceInDays(new Date(props.event.endDate), new Date(props.event.startDate)) + 1,
		[props.event],
	);

	useImperativeHandle(ref, () => ({
		reset: () => setDates([]),
	}));

	useEffect(() => {
		props.onComplete(dates.some((date) => date));
	}, [dates]);

	let dateCheckboxes = [];
	for (let i = 0; i < eventLength; i++) {
		const date = addDays(new Date(props.event.startDate), i);
		dateCheckboxes.push(
			<FormControlLabel
				key={i}
				control={
					<Checkbox
						onChange={(e) => {
							const newDates = [...dates];
							newDates[i] = e.target.checked;
							setDates(newDates);
						}}
						checked={dates[i] ?? false}
						value={dates[i] ?? false}
					/>
				}
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
		<GameSubmitPage title="Availability" show={props.show}>
			<input type="hidden" name="availability" value={datesToString(dates)} />
			<div style={{ display: "flex", flexDirection: "column" }}>{dateCheckboxes}</div>
		</GameSubmitPage>
	);
});
